/*
 * SPDX-License-Identitifer:    GPL-3.0-or-later
 *
 * This file requires contract dependencies which are licensed as
 * GPL-3.0-or-later, forcing it to also be licensed as such.
 *
 * This is the only file in your project that requires this license and
 * you are free to choose a different license for the rest of the project.
 */

pragma solidity 0.4.24;

import "@aragon/os/contracts/factory/DAOFactory.sol";
import "@aragon/os/contracts/apm/Repo.sol";
import "@aragon/os/contracts/lib/ens/ENS.sol";
import "@aragon/os/contracts/lib/ens/PublicResolver.sol";
import "@aragon/os/contracts/apm/APMNamehash.sol";

import "@aragon/apps-voting/contracts/Voting.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

import "@aragon/apps-vault/contracts/Vault.sol";
import "@aragon/apps-finance/contracts/Finance.sol";


import "./CommitteeManager.sol";


contract TemplateBase is APMNamehash {
    ENS public ens;
    DAOFactory public fac;

    bytes32 constant internal VAULT_APP_ID = 0x7e852e0fcfce6551c13800f1e7476f982525c2b5277ba14b24339c68416336d1;
    bytes32 constant internal FINANCE_APP_ID = 0xbf8491150dafc5dcaee5b861414dca922de09ccffa344964ae167212e8c673ae;
    bytes32 constant internal TOKEN_MANAGER_APP_ID = 0x6b20a3010614eeebf2138ccec99f028a61c811b3b1a3343b6ff635985c75c91f;
    bytes32 constant internal VOTING_APP_ID = 0x9fa3927f639745e587912d4b0fea7ef9013bf93fb907d29faeab57417ba6e1d4;
    event DeployInstance(address dao);
    event InstalledApp(address appProxy, bytes32 appId);

    constructor(DAOFactory _fac, ENS _ens) public {
        ens = _ens;

        // If no factory is passed, get it from on-chain bare-kit
        if (address(_fac) == address(0)) {
            bytes32 bareKit = apmNamehash("bare-kit");
            fac = TemplateBase(latestVersionAppBase(bareKit)).fac();
        } else {
            fac = _fac;
        }
    }

    function latestVersionAppBase(bytes32 appId) public view returns (address base) {
        Repo repo = Repo(PublicResolver(ens.resolver(appId)).addr(appId));
        (,base,) = repo.getLatest();

        return base;
    }
}


contract Template is TemplateBase {
    MiniMeTokenFactory tokenFactory;

    uint64 constant PCT = 10 ** 16;
    address constant ANY_ENTITY = address(-1);
    uint64 constant DEFAULT_FINANCE_PERIOD = uint64(30 days);

    constructor(ENS ens) TemplateBase(DAOFactory(0), ens) public {
        tokenFactory = new MiniMeTokenFactory();
    }

    function newInstance() public {
        Kernel dao = fac.newDAO(this);
        ACL acl = ACL(dao.acl());
        acl.createPermission(this, dao, dao.APP_MANAGER_ROLE(), this);

        address root = msg.sender;
        bytes32 appId = keccak256(abi.encodePacked(apmNamehash("open"), keccak256("committee-manager-app")));

        Vault vault = Vault(dao.newAppInstance(VAULT_APP_ID, latestVersionAppBase(VAULT_APP_ID)));
        Finance finance = Finance(dao.newAppInstance(FINANCE_APP_ID, latestVersionAppBase(FINANCE_APP_ID)));
        CommitteeManager app = CommitteeManager(dao.newAppInstance(appId, latestVersionAppBase(appId)));
        Voting voting = Voting(dao.newAppInstance(VOTING_APP_ID, latestVersionAppBase(VOTING_APP_ID)));
        TokenManager tokenManager = TokenManager(dao.newAppInstance(TOKEN_MANAGER_APP_ID, latestVersionAppBase(TOKEN_MANAGER_APP_ID)));

        MiniMeToken token = tokenFactory.createCloneToken(MiniMeToken(0), 0, "App token", 0, "APP", true);
        token.changeController(tokenManager);

        // Initialize apps
        vault.initialize();
        finance.initialize(vault, DEFAULT_FINANCE_PERIOD);
        app.initialize(tokenFactory, ens, voting);

        tokenManager.initialize(token, true, 0);
        voting.initialize(token, 50 * PCT, 20 * PCT, 1 days);

        //Set token manager permissions
        acl.createPermission(this, tokenManager, tokenManager.MINT_ROLE(), this);
        acl.createPermission(voting, tokenManager, tokenManager.BURN_ROLE(), this);
        acl.grantPermission(voting, tokenManager, tokenManager.MINT_ROLE());
        acl.grantPermission(voting, tokenManager, tokenManager.BURN_ROLE());

        tokenManager.mint(root, 1); // Give one token to root
        //Set voting permissions
        acl.createPermission(ANY_ENTITY, voting, voting.CREATE_VOTES_ROLE(), voting);
        acl.grantPermission(voting, dao, dao.APP_MANAGER_ROLE());

        acl.createPermission(finance, vault, vault.TRANSFER_ROLE(), voting);

        //Set voting permissions over finance
        acl.createPermission(voting, finance, finance.EXECUTE_PAYMENTS_ROLE(), voting);
        acl.createPermission(voting, finance, finance.MANAGE_PAYMENTS_ROLE(), voting);
        acl.createPermission(voting, finance, finance.CREATE_PAYMENTS_ROLE(), voting);

        acl.createPermission(this, app, app.CREATE_COMMITTEE_ROLE(), this);

        //Set voting permissions over committees
        acl.createPermission(voting, app, app.MODIFY_INFO_ROLE(), voting);
        acl.createPermission(voting, app, app.DELETE_COMMITTEE_ROLE(), voting);
        acl.createPermission(voting, app, app.MANAGE_MEMBERS_ROLE(), voting);

        acl.grantPermission(app, dao, dao.APP_MANAGER_ROLE());
        acl.grantPermission(app, acl, acl.CREATE_PERMISSIONS_ROLE());

        createMembershipCommittee(app);
        createBountiesCommittee(app);
        createFinanceCommittee(app);

        // Clean up permissions
        // acl.grantPermission(root, dao, dao.APP_MANAGER_ROLE());
        acl.grantPermission(voting, dao, dao.APP_MANAGER_ROLE());

        acl.revokePermission(this, dao, dao.APP_MANAGER_ROLE());
        acl.setPermissionManager(voting, dao, dao.APP_MANAGER_ROLE());

        acl.grantPermission(voting, acl, acl.CREATE_PERMISSIONS_ROLE());
        acl.revokePermission(this, acl, acl.CREATE_PERMISSIONS_ROLE());
        acl.setPermissionManager(voting, acl, acl.CREATE_PERMISSIONS_ROLE());

        acl.revokePermission(this, tokenManager, tokenManager.MINT_ROLE());
        acl.setPermissionManager(voting, tokenManager, tokenManager.MINT_ROLE());

        //Clean up create committee permission
        acl.grantPermission(voting, app, app.CREATE_COMMITTEE_ROLE());
        acl.revokePermission(this, app, app.CREATE_COMMITTEE_ROLE());
        acl.setPermissionManager(voting, app, app.CREATE_COMMITTEE_ROLE());

        emit DeployInstance(dao);
    }

    function createMembershipCommittee(CommitteeManager app) internal {
        bool[2] memory tokenParams = [false, true];
        address[] memory initialMembers = new address[](2);
        uint256[] memory stakes = new uint256[](2);
        initialMembers[0] = 0xb4124cEB3451635DAcedd11767f004d8a28c6eE7;
        initialMembers[1] = 0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb;
        stakes[0] = 1;
        stakes[1] = 1;
        uint64[3] memory votingParams = [uint64(99), 99, 30];
        app.createCommittee(
            hex"004d656d6265727368697020436f6d6d6974746565", // Membership Committee
            "This a sample description nothing important to see here",
            "MCT",
            tokenParams,
            initialMembers,
            stakes,
            votingParams
        );
    }

    function createBountiesCommittee(CommitteeManager app) internal {
        bool[2] memory tokenParams = [false, false];
        address[] memory initialMembers = new address[](1);
        uint256[] memory stakes = new uint256[](1);
        initialMembers[0] = 0xb4124cEB3451635DAcedd11767f004d8a28c6eE7;
        stakes[0] = 1;
        uint64[3] memory votingParams = [uint64(50), 15, 30];
        app.createFinancialCommittee(
            hex"00426f756e7469657320436f6d6d6974746565", // Bounties Committee
            "This a sample description nothing important to see here",
            "BCT",
            tokenParams,
            initialMembers,
            stakes,
            votingParams
        );
    }

    function createFinanceCommittee(CommitteeManager app) internal {
        bool[2] memory tokenParams = [true, false];
        address[] memory initialMembers = new address[](1);
        uint256[] memory stakes = new uint256[](1);
        initialMembers[0] = 0xb4124cEB3451635DAcedd11767f004d8a28c6eE7;
        stakes[0] = 1;
        uint64[3] memory votingParams = [uint64(50), 50, 30];
        app.createFinancialCommittee(
            hex"0046696e616e636520436f6d6d6974746565", // Finance Committee
            "This a sample description nothing important to see here",
            "FCT",
            tokenParams,
            initialMembers,
            stakes,
            votingParams
        );
    }
}
