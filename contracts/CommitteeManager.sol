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
    event CreateCommittee(address indexed committeeAddress, bytes32 name, string description,
    bool[2] tokenParams, string tokenSymbol, address[] initialMembers, uint256[] stakes, uint64[3] votingParams);
    event RemoveCommittee(address indexed committeeAddress);
    event AddMember(address indexed committeeAddress, address member);
    event RemoveMember(address indexed committeeAddress, address member);
    event AddPermission(address indexed committeeAddress, address app, bytes32 appName, bytes32 role);
    event RemovePermission(address indexed committeeAddress, address app, bytes32 appName, bytes32 role);
    event ModifyCommittee(address indexed committeeAddress, string description);

    //Types
    struct Committee {
        bytes32 name;
        string description;
        address tokenManagerAppAddress;
        address votingAppAddress;
    }

    /// State
    mapping(address => Committee) committees;
    Voting internal generalVoting;

    /// ACL
    bytes32 constant public CREATE_COMMITTEE_ROLE = keccak256("CREATE_COMMITTEE_ROLE");
    bytes32 constant public EDIT_COMMITTEE_ROLE = keccak256("EDIT_COMMITTEE_ROLE");
    bytes32 constant public DELETE_COMMITTEE_ROLE = keccak256("DELETE_COMMITTEE_ROLE");
    bytes32 constant public EDIT_COMMITTEE_MEMBERS_ROLE = keccak256("EDIT_COMMITTEE_MEMBERS_ROLE");
    bytes32 constant public EDIT_COMMITTEE_PERMISSIONS_ROLE = keccak256("EDIT_COMMITTEE_PERMISSIONS_ROLE");


    function initialize(MiniMeTokenFactory _miniMeTokenFactory, ENS _ens, Voting _generalVoting) public onlyInit {
        initialized();
        ens = _ens;
        miniMeFactory = _miniMeTokenFactory;
        generalVoting = _generalVoting;
    }

    /**
     * @notice Create a new committee called
     * @param _name Committee's name 0: committee name 1: tokensymbol
     * @param _description Committee's info data. 0 -> description, 1 -> tokenSymbol
     * @param _tokenSymbol Committees token symbol.
     * @param _tokenParams Token properties. First position transferable. Second unique
     * @param  _initialMembers Committee's initial members address.
     * @param _votingParams It contains Voting configuration data like: approval percentage, quorum percentage and duration.
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
        emit CreateCommittee(apps[0], _name, _description, _tokenParams, _tokenSymbol, _initialMembers, _stakes, _votingParams);
    }

    /**
     * @notice Add a new member to the committee.
     * @param _committee Committee's address
     * @param _member Committee's member address
     */
    function addMember(address _committee, address _member) external auth(EDIT_COMMITTEE_MEMBERS_ROLE) {
        address tmAddress = committees[_committee].tokenManagerAppAddress;
        _mintTokens(TokenManager(tmAddress), _member, 1);

        emit AddMember(_committee, _member);
    }

    /**
     * @notice Delete a member from committee.
     * @param _committee Committee's address
     * @param _committee Committee's member address.
     */
    function removeMember(address _committee, address _member) external auth(EDIT_COMMITTEE_MEMBERS_ROLE) {
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
    function addPermission(address _committee, address _app, bytes32 _appName,
        bytes32 _role) external auth(EDIT_COMMITTEE_PERMISSIONS_ROLE) {
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
    function removePermission(address _committee, address _app, bytes32 _appName,
        bytes32 _role) external auth(EDIT_COMMITTEE_PERMISSIONS_ROLE) {
        require(committees[_committee].tokenManagerAppAddress != address(0), "The committee doesnt't exist");

        //...
    }

    /**
     * @notice Modify committee.
     * @param _committee Committee's address
     * @param _description Committee's description
     */
    function modifyCommittee(address _committee, string _description) external auth(EDIT_COMMITTEE_ROLE) {
        require(committees[_committee].tokenManagerAppAddress != address(0), "The committee doesn't exist");

        committees[_committee].description = _description;

        emit ModifyCommittee(_committee, _description);
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
        _grantTokenManagerPermissions(acl, tokenManager, generalVoting);
        //TO DO add stakes variable as parameter
        if (_tokenParams[1])
            _mintTokens(acl, tokenManager, _initialMembers, 1);
        else
            _mintTokens(acl, tokenManager, _initialMembers, _stakes);
        Voting voting = _installVotingApp(_dao, token, _votingParams[0] * PCT, _votingParams[1] * PCT, _votingParams[2] * 1 days);
        //Only token holders can open a vote.
        _createVotingPermissions(acl, voting, generalVoting, generalVoting);
        _changeTokenManagerPermissionManager(acl, tokenManager, generalVoting);

        apps[0] = address(tokenManager);
        apps[1] = address(voting);
    }
}
