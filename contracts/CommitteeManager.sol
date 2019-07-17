pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/os/contracts/lib/math/SafeMath.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/apps-voting/contracts/Voting.sol";

//import "@aragon/apps-vault/contracts/Vault.sol";
import "@aragon/os/contracts/apm/APMNamehash.sol";

import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/acl/ACL.sol";

import "@aragon/os/contracts/apm/Repo.sol";
import "@aragon/os/contracts/lib/ens/ENS.sol";
import "@aragon/os/contracts/lib/ens/PublicResolver.sol";
import "@aragon/os/contracts/evmscript/IEVMScriptRegistry.sol"; // needed for EVMSCRIPT_REGISTRY_APP_ID

import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

contract CommitteeManager is AragonApp, APMNamehash {
    using SafeMath for uint256;

    //Events
    event CreateCommittee(address indexed entity, bytes32 committee, address committeeAddress);
    event RemoveCommittee(address indexed entity, bytes32 committee);
    event AddMemberToCommittee(address indexed entity, bytes32 committee, address member);
    event RemoveMemberFromCommittee(address indexed entity, bytes32 committee, address member);
    event AddPermissionToCommittee(address indexed entity, bytes32 committee, bytes32 permission);
    event RemovePermissionFromCommittee(address indexed entity, bytes32 committee, bytes32 permission);
    event ModifyCommittee(address indexed entity, bytes32 committee);

    //Types
    struct Committee {
        bytes32 name; // ?????
        string description;
        address tokenManagerAppAddress;
        address votingAppAddress;
//        Por consenso, consenso-mayoria, mayoria relativa, mayoria absoluta.
        uint8 committeeType;

    }

    //State
    ENS public ens;
    uint64 constant PCT = 10 ** 16;
    address constant ANY_ENTITY = address(-1);

    mapping(address => Committee) committees;

    //ACL
    bytes32 constant public CREATE_COMMITTEE_ROLE = keccak256("CREATE_COMMITTEE_ROLE");
    bytes32 constant public EDIT_COMMITTEE_ROLE = keccak256("EDIT_COMMITTEE_ROLE");
    bytes32 constant public DELETE_COMMITTEE_ROLE = keccak256("DELETE_COMMITTEE_ROLE");
    bytes32 constant public EDIT_COMMITTEE_MEMBERS_ROLE = keccak256("EDIT_COMMITTEE_MEMBERS_ROLE");
    bytes32 constant public EDIT_COMMITTEE_PERMISSIONS_ROLE = keccak256("EDIT_COMMITTEE_PERMISSIONS_ROLE");

    function initialize() public onlyInit {
        initialize();
        //TODO need to take this address out.
        ens = ENS(0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1);

    }
//
//    function createCommittee(bytes32 _name, string _description, bytes32 _committeeTokenSymbol, uint8 committeeType, address[] initialMembers) external auth(CREATE_COMMITTEE_ROLE) {
//        address tokenManager;
//        address voting;
//        (tokenManager, voting) = setCommitteeApps(_name, _committeeTokenSymbol, initialMembers);
//        committees[tokenManager] = Committee(_name, _description, tokenManager, voting, committeeType);
//
//        emit CreateCommittee(msg.sender, _name, tokenManager);
//    }

//    function removeCommittee(bytes32 name) external auth(REMOVE_COMMITTEE_ROLE) {
//        delete committees[name];
//    }

//    function addMemberToCommittee(address _key /*need to review. How do we get tokenManager addresss*/, address _member)
//    external auth(EDIT_COMMITTEE_MEMBERS_ROLE) {
//        TokenManager tokenManager = TokenManager(committees[_key].tokenManagerAppAddress);
//        //Should it call voting app right ?
//        tokenManager.mint(_member, 1);
//    }
//
//    function removeMemberFromCommittee(address _key, address _member) external auth(EDIT_COMMITTEE_MEMBERS_ROLE) {
//
//    }
//
//    function addPermissionToCommittee(address _key, bytes32 _role, address _app) external auth(EDIT_COMMITTEE_PERMISSIONS_ROLE) {
//        //acl.createPermission(address entity, address app, bytes32 role, address manager)
//        //...
//    }
//
//    function removePermissionFromCommittee(address _key, bytes32 _role, address _app) external auth(EDIT_COMMITTEE_PERMISSIONS_ROLE) {
//        //requrire()
//        //acl.revokePermission(address entity, address app, bytes32 role)
//        //...
//    }
//
//    function modifyCommitee(address _key, string _description) external auth(EDIT_COMMITTEE_ROLE) {
//        //...
//    }
//
//    function setCommitteeApps(bytes32 _committeeName, bytes32 _committeeTokenSymbol, address[] initialMembers /*, uint256[] initialTokens*/) internal returns (
//        address tmAddress,
//        address vAddress) {
//        Kernel k = Kernel(kernel());
//        ACL acl = ACL(k.acl());
//        bytes32 appId = apmNamehash("token-manager");
//        address appBase = latestVersionAppBase(appId);
//        MiniMeTokenFactory tokenFactory = new MiniMeTokenFactory();
//        MiniMeToken token = tokenFactory.createCloneToken(MiniMeToken(0), 0, "Membership Commitee", 0, "MC", true);
//
//        tmAddress = k.newAppInstance(appId, appBase);
//
//        TokenManager tokenManager = TokenManager(tmAddress);
//        token.changeController(tokenManager);
//        tokenManager.initialize(token, true, 0);
//        acl.createPermission(this, tokenManager, tokenManager.MINT_ROLE(), this);
//
//        //Create token for every member.
//        for(uint i = 0; i < initialMembers.length; i++) {
//            tokenManager.mint(initialMembers[i], 1);
//        }
//
//        appId = apmNamehash("voting");
//        appBase = latestVersionAppBase(appId);
//
//        vAddress = k.newAppInstance(appId, appBase);
//        Voting voting = Voting(vAddress);
//        voting.initialize(token, 50 * PCT, 20 * PCT, 1 days);
//
//        acl.createPermission(ANY_ENTITY, voting, voting.CREATE_VOTES_ROLE(), voting);
//        acl.grantPermission(voting, tokenManager, tokenManager.MINT_ROLE());
//
//        acl.setPermissionManager(voting, tokenManager, tokenManager.MINT_ROLE());
//        //acl.revoke...
//    }
//
//    function latestVersionAppBase(bytes32 appId) internal returns (address base) {
//        Repo repo = Repo(PublicResolver(ens.resolver(appId)).addr(appId));
//        (,base,) = repo.getLatest();
//
//        return base;
//    }
}
