pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";

import "@aragon/apps-voting/contracts/Voting.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/lib/ens/ENS.sol";

import "./CommitteeHelper.sol";


contract CommitteeManager is AragonApp, CommitteeHelper {

    /// Events
    event CreateCommittee(address indexed committeeAddress, address indexed votingAddress, bytes32 name, string description,
    bool[2] tokenParams, address[] initialMembers, uint256[] stakes, uint64[3] votingParams);
    event RemoveCommittee(address indexed committeeAddress);
    event AddMember(address indexed committeeAddress, address member);
    event RemoveMember(address indexed committeeAddress, address member);
    event AddPermission(address indexed committeeAddress, address app, bytes32 appName, bytes32 role);
    event RemovePermission(address indexed committeeAddress, address app, bytes32 appName, bytes32 role);
    event ModifyCommittee(address indexed committeeAddress, string description);

    /// Types
    struct Committee {
        bytes32 name;
        string description;
        address tokenManagerAppAddress;
        address votingAppAddress;
    }

    /// State
    mapping(address => Committee) committees;
    //Entity that manages committees apps permissions. 
    Voting internal entity;

    /// ACL
    bytes32 constant public CREATE_COMMITTEE_ROLE = keccak256("CREATE_COMMITTEE_ROLE");
    bytes32 constant public EDIT_COMMITTEE_ROLE = keccak256("EDIT_COMMITTEE_ROLE");
    bytes32 constant public DELETE_COMMITTEE_ROLE = keccak256("DELETE_COMMITTEE_ROLE");
    bytes32 constant public EDIT_COMMITTEE_MEMBERS_ROLE = keccak256("EDIT_COMMITTEE_MEMBERS_ROLE");
    bytes32 constant public EDIT_COMMITTEE_PERMISSIONS_ROLE = keccak256("EDIT_COMMITTEE_PERMISSIONS_ROLE");

    /// Errors
    string private constant ERROR_COMMITTEE_MISSING = "COMMITTEE_NOT_ADDED";
    string private constant ERROR_COMMITTEE_EXISTS = "COMMITTEE_ALREADY_ADDED";
    string private constant ERROR_MEMBER_MISSING = "MEMBER_DONT_EXIST";
    string private constant ERROR_MEMBER_EXISTS = "MEMBER_ALREADY_ADDED";
    string private constant ERROR_MINIME_FACTORY_NOT_CONTRACT = "MINIME_FACTORY_NOT_CONTRACT";
    string private constant ERROR_ENS_NOT_CONTRACT = "ENS_NOT_CONTRACT";
    string private constant ERROR_ENTITY_NOT_CONTRACT = "ENTITY_NOT_CONTRACT";


    modifier committeeExists(address _committee) {
        require(committees[_committee].tokenManagerAppAddress != address(0), ERROR_COMMITTEE_MISSING);
        _;
    }

    modifier memberExists(address _committee, address _member) {
        TokenManager tm = TokenManager(committees[_committee].tokenManagerAppAddress);
        require(tm.token().balanceOf(_member) > 0, ERROR_MEMBER_MISSING);
        _;
    }

    function initialize(MiniMeTokenFactory _miniMeTokenFactory, ENS _ens, Voting _entity) public onlyInit {
        initialized();
        ens = _ens;
        miniMeFactory = _miniMeTokenFactory;
        entity = _entity;
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
        address[2] memory apps; // 0: token manager; 1: voting
        apps = _createCommitteeApps(_tokenSymbol, _initialMembers, _votingParams, _tokenParams, _stakes);

        committees[apps[0]] = Committee(_name, _description, apps[0], apps[1]);
        emit CreateCommittee(apps[0], apps[1], _name, _description, _tokenParams, _initialMembers, _stakes, _votingParams);
    }

    /**
     * @notice Add `_member` to the committee `_committee`.
     * @param _committee Committee's address.
     * @param _member The new member address.
     * @param _stake  The new member token stakes.
     */
    function addMember(
        address _committee,
        address _member,
        uint256 _stake
    )
        external
        committeeExists(_committee)
        auth(EDIT_COMMITTEE_MEMBERS_ROLE)
    {
        address tmAddress = committees[_committee].tokenManagerAppAddress;
        _mintTokens(TokenManager(tmAddress), _member, _stake);

        emit AddMember(_committee, _member);
    }

    /**
     * @notice Delete member `_member` from committee `_committee`.
     * @param _committee Committee's address
     * @param _member Committee's member address.
     */
    function removeMember(
        address _committee,
        address _member
    )
        external
        committeeExists(_committee)
        memberExists(_committee, _member)
        auth(EDIT_COMMITTEE_MEMBERS_ROLE)
    {
        address tmAddress = committees[_committee].tokenManagerAppAddress;

        _burnTokens(TokenManager(tmAddress), _member, 1);

        emit RemoveMember(_committee, _member);
    }

    /**
     * @notice Delete committee.
     * @param _committee Committee's address
     * @param _committee Committee's members addreses.
     */
    function removeCommittee(address _committee, address[] _members) external auth(DELETE_COMMITTEE_ROLE) {
        address tmAddress = committees[_committee].tokenManagerAppAddress;
        //Delete all members
        _burnTokens(TokenManager(tmAddress), _members, 1);
        delete committees[tmAddress];

        emit RemoveCommittee(_committee);
    }

    /**
     * @notice Add permission to committee.
     * @param _committee Committee's address
     * @param _app Entity address
     * @param _appName Entity name
     * @param _role Permission
     */
    function addPermission(
        address _committee,
        address _app,
        bytes32 _appName,
        bytes32 _role
    )
    external auth(EDIT_COMMITTEE_PERMISSIONS_ROLE)
    {
        require(committees[_committee].tokenManagerAppAddress != address(0), "The committee doesn't exist");

        //...

    }

    /**
     * @notice Remove permission from committee
     * @param _committee Committee's address
     * @param _app Entity address
     * @param _appName Entity name
     * @param _role Permission
     */
    function removePermission(
        address _committee,
        address _app,
        bytes32 _appName,
        bytes32 _role
    )
    external auth(EDIT_COMMITTEE_PERMISSIONS_ROLE)
    {
        require(committees[_committee].tokenManagerAppAddress != address(0), "The committee doesnt't exist");

        //...
    }

    /**
     * @dev It creates a new TokenManager and Voting app for the new committee.
     */
    function _createCommitteeApps(
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
        _grantTokenManagerPermissions(acl, tokenManager, entity);

        if (_tokenParams[1])
            _mintTokens(acl, tokenManager, _initialMembers, 1);
        else
            _mintTokens(acl, tokenManager, _initialMembers, _stakes);

        Voting voting = _installVotingApp(_dao, token, _votingParams[0] * PCT, _votingParams[1] * PCT, _votingParams[2] * 1 days);
        //Only token holders can open a vote.
        _createVotingPermissions(acl, voting, entity, entity);
        _changeTokenManagerPermissionManager(acl, tokenManager, entity);

        apps[0] = address(tokenManager);
        apps[1] = address(voting);
    }
}
