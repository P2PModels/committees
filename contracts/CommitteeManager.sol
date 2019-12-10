pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";

import "@aragon/apps-vault/contracts/Vault.sol";
import "@aragon/apps-voting/contracts/Voting.sol";
import "@aragon/apps-finance/contracts/Finance.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/lib/ens/ENS.sol";

import "./CommitteeHelper.sol";


contract CommitteeManager is AragonApp, CommitteeHelper {

    /// Events
    event CreateCommittee(address indexed committeeAddress, address indexed votingAddress, bytes32 name, string description);
    event RemoveCommittee(address indexed committeeAddress);
    event AddMembers(address indexed committeeAddress, address[] members, uint256[] stakes);
    event RemoveMember(address indexed committeeAddress, address member);
    event ModifyCommitteeInfo(address indexed committeeAddress, bytes32 name, string description);

    /// Types
    struct Committee {
        bytes32 name;
        address voting;
        address finance;
    }

    /// State
    mapping(address => Committee) committees;
    //Entity that manages committees apps permissions.
    address internal manager;

    // Constants
    uint64 constant private DEFAULT_FINANCE_PERIOD = uint64(30 days);
    address constant private NO_FINANCE = address(0);

    /// ACL
    bytes32 constant public CREATE_COMMITTEE_ROLE = keccak256("CREATE_COMMITTEE_ROLE");
    bytes32 constant public MODIFY_INFO_ROLE = keccak256("MODIFY_INFO_ROLE");
    bytes32 constant public DELETE_COMMITTEE_ROLE = keccak256("DELETE_COMMITTEE_ROLE");
    bytes32 constant public MANAGE_MEMBERS_ROLE = keccak256("MANAGE_MEMBERS_ROLE");

    /// Errors
    string private constant ERROR_COMMITTEE_MISSING = "COMMITTEE_NOT_ADDED";
    string private constant ERROR_COMMITTEE_EXISTS = "COMMITTEE_ALREADY_ADDED";
    string private constant ERROR_MEMBER_MISSING = "MEMBER_DONT_EXIST";
    string private constant ERROR_MEMBER_EXISTS = "MEMBER_ALREADY_ADDED";
    string private constant ERROR_MEMBER_STAKES_NOT_EQUAL = "MEMBER_STAKES_NOT_EQUAL";
    string private constant ERROR_MINIME_FACTORY_NOT_CONTRACT = "MINIME_FACTORY_NOT_CONTRACT";
    string private constant ERROR_ENS_NOT_CONTRACT = "ENS_NOT_CONTRACT";
    string private constant ERROR_ENTITY_NOT_CONTRACT = "ENTITY_NOT_CONTRACT";


    modifier committeeExists(address _committee) {
        require(committees[_committee].voting != address(0), ERROR_COMMITTEE_MISSING);
        _;
    }

    modifier areEqualMembersStakes(address[] _members, uint256[] _stakes) {
        require(_members.length == _stakes.length, ERROR_MEMBER_STAKES_NOT_EQUAL);
        _;
    }

    modifier memberExists(address _committee, address _member) {
        TokenManager tm = TokenManager(_committee);
        require(tm.token().balanceOf(_member) > 0, ERROR_MEMBER_MISSING);
        _;
    }

    function initialize(MiniMeTokenFactory _miniMeTokenFactory, ENS _ens, address _manager) public onlyInit {
        initialized();
        ens = _ens;
        miniMeFactory = _miniMeTokenFactory;
        manager = _manager;
    }

    function getAcl() external view returns(address) {
        return Kernel(kernel()).acl();
    }

    /**
     * @notice Create a new committee.
     * @param _name The name of the committee.
     * @param _description The description of the committee.
     * @param _tokenSymbol Committee's token symbol.
     * @param _tokenParams Token configuration (transferable and cumulative)
     * @param  _initialMembers Committee's initial member addresses.
     * @param _votingParams Voting configuration (approval percentage, quorum percentage and duration).
     */
    function createCommittee(
        bytes32 _name,
        string _description,
        string _tokenSymbol,
        bool[2] _tokenParams,
        address[] _initialMembers,
        uint256[] _stakes,
        uint64[3] _votingParams
    )
        external auth(CREATE_COMMITTEE_ROLE)
    {
        address[2] memory apps = _installCommitteeApps(_tokenSymbol, _initialMembers, _votingParams, _tokenParams, _stakes);
        committees[apps[0]] = Committee(_name, apps[1], NO_FINANCE);
        emit CreateCommittee(apps[0], apps[1], _name, _description);
    }

    /**
     * @notice Create a new financial committee.
     * @param _name The name of the committee.
     * @param _description The description of the committee.
     * @param _tokenSymbol Committee's token symbol.
     * @param _tokenParams Token configuration (transferable and cumulative)
     * @param  _initialMembers Committee's initial member addresses.
     * @param _votingParams Voting configuration (approval percentage, quorum percentage and duration).
     */
    function createFinancialCommittee(
        bytes32 _name,
        string _description,
        string _tokenSymbol,
        bool[2] _tokenParams,
        address[] _initialMembers,
        uint256[] _stakes,
        uint64[3] _votingParams
    )
        external auth(CREATE_COMMITTEE_ROLE)
    {
        address[2] memory apps = _installCommitteeApps(_tokenSymbol, _initialMembers, _votingParams, _tokenParams, _stakes);
        committees[apps[0]] = Committee(_name, apps[1], NO_FINANCE);
        _installFinanceApps(apps[0], apps[1]);
        emit CreateCommittee(apps[0], apps[1], _name, _description);
    }

    /**
     * @notice Modify committee name and description
     * @param _committee Committee's token manager address
     * @param _name New committee name
     * @param _description New committee description
     */
    function modifyCommitteeInfo(address _committee, bytes32 _name, string _description)
        external
        committeeExists(_committee)
        authP(MODIFY_INFO_ROLE, _arr(_committee))
    {
        committees[_committee].name = _name;
        emit ModifyCommitteeInfo(_committee, _name, _description);
    }

    /**
     * @notice Add new members to the committee `_committee`
     * @param _committee Committee's token manager address
     * @param _members The new members addresses
     * @param _stakes  The new members token stakes
     */
    function addMembers(
        address _committee,
        address[] _members,
        uint256[] _stakes
    )
        external
        committeeExists(_committee)
        areEqualMembersStakes(_members, _stakes)
        authP(MANAGE_MEMBERS_ROLE, _arr(_committee))
    {
        TokenManager tm = TokenManager(_committee);
        _mintTokens(tm, _members, _stakes);
    }

    /**
     * @notice Delete member `_member` from committee `_committee`.
     * @param _committee Committee's token manager address
     * @param _member Committee's member address
     */
    function removeMember(
        address _committee,
        address _member
    )
        external
        committeeExists(_committee)
        memberExists(_committee, _member)
        authP(MANAGE_MEMBERS_ROLE, _arr(_committee))
    {
        TokenManager tm = TokenManager(_committee);
        _burnTokens(tm, _member, tm.token().balanceOf(_member));
    }

    /**
     * @notice Delete committee.
     * @param _committee Committee address
     * @param _members Members addreses
     */
    function removeCommittee(
        address _committee,
        address[] _members
    )
        external
        committeeExists(_committee)
        authP(DELETE_COMMITTEE_ROLE, _arr(_committee))
    {
        Kernel _dao = Kernel(kernel());
        ACL acl = ACL(_dao.acl());
        Committee c = committees[_committee];
        TokenManager tm = TokenManager(_committee);

        //Delete all members
        _burnTokens(tm, _members);

        //Revoke token manager permissions
        _revokeTokenManagerPermissions(acl, tm, manager);
        _revokeTokenManagerPermissions(acl, tm, this);

        //Burn permission manager so no one can't set it never again.
        _burnTokenManagerPermissionManager(acl, tm);


        if (c.finance != address(0)) {
            Finance finance = Finance(c.finance);
            _revokeAndBurnVaultPermissions(acl, finance.vault(), finance);
            _revokeFinancePermissions(acl, finance, c.voting);
            _burnFinancePermissionManager(acl, finance);
        }

        delete committees[_committee];

        emit RemoveCommittee(_committee);
    }

    /**
     * @dev It creates a new TokenManager and Voting app for the new committee.
     */
    function _installCommitteeApps(
        string _committeeTokenSymbol,
        address[] _initialMembers,
        uint64[3] _votingParams,
        bool[2] _tokenParams,
        uint256[] _stakes
    )
        internal returns (address[2] memory apps)
    {
        Kernel _dao = Kernel(kernel());
        ACL acl = ACL(_dao.acl());
        MiniMeToken token = _createToken(string(abi.encodePacked(_committeeTokenSymbol, " Token")), _committeeTokenSymbol, 0);
        TokenManager tokenManager = _installTokenManagerApp(_dao, token, _tokenParams);
        _createTokenManagerPermissions(acl, tokenManager, this, this);
        _grantTokenManagerPermissions(acl, tokenManager, manager);
        _mintTokens(tokenManager, _initialMembers, _stakes);

        Voting voting = _installVotingApp(_dao, token, _votingParams[0] * PCT, _votingParams[1] * PCT, _votingParams[2] * 1 days);
        //Only token holders can open a vote.
        _createVotingPermissions(acl, voting, manager, manager);
        _changeTokenManagerPermissionManager(acl, tokenManager, manager);

        _revokeTokenManagerPermissions(acl, tokenManager, this);
        apps[0] = address(tokenManager);
        apps[1] = address(voting);
    }

    function _installFinanceApps(address _committee, address _grantee) internal {
        Kernel _dao = Kernel(kernel());
        ACL acl = ACL(_dao.acl());
        Vault vault = _installNonDefaultVaultApp(_dao);
        Finance finance = _installFinanceApp(_dao, vault, DEFAULT_FINANCE_PERIOD);
        _createVaultPermissions(acl, vault, finance, manager);
        _createFinancePermissions(acl, finance, _grantee, manager);
        _createFinanceCreatePaymentsPermission(acl, finance, _grantee, manager);
        committees[_committee].finance = finance;
    }

    // Syntax sugar

    function _arr(address _a) internal pure returns (uint256[] r) {
        r = new uint256[](1);
        r[0] = uint256(_a);
    }
}
