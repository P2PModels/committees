pragma solidity ^0.4.24;

import "@aragon/os/contracts/apps/AragonApp.sol";

import "@aragon/apps-voting/contracts/Voting.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";

import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/os/contracts/apm/Repo.sol";
import "@aragon/os/contracts/apm/APMNamehash.sol";
import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/lib/ens/ENS.sol";
import "@aragon/os/contracts/lib/ens/PublicResolver.sol";
import "@aragon/os/contracts/common/IsContract.sol";

import "@aragon/os/contracts/lib/math/SafeMath.sol";


contract BaseTemplate is APMNamehash, IsContract {
    /* Hardcoded constant to save gas
    * bytes32 constant internal AGENT_APP_ID = apmNamehash("agent");                  // agent.aragonpm.eth
    * bytes32 constant internal VAULT_APP_ID = apmNamehash("vault");                  // vault.aragonpm.eth
    * bytes32 constant internal VOTING_APP_ID = apmNamehash("voting");                // voting.aragonpm.eth
    * bytes32 constant internal FINANCE_APP_ID = apmNamehash("finance");              // finance.aragonpm.eth
    * bytes32 constant internal TOKEN_MANAGER_APP_ID = apmNamehash("token-manager");  // token-manager.aragonpm.eth
    */
    
    bytes32 constant internal VOTING_APP_ID = 0x9fa3927f639745e587912d4b0fea7ef9013bf93fb907d29faeab57417ba6e1d4;
    bytes32 constant internal TOKEN_MANAGER_APP_ID = 0x6b20a3010614eeebf2138ccec99f028a61c811b3b1a3343b6ff635985c75c91f;

    string constant private ERROR_ENS_NOT_CONTRACT = "TEMPLATE_ENS_NOT_CONTRACT";
    string constant private ERROR_DAO_FACTORY_NOT_CONTRACT = "TEMPLATE_DAO_FAC_NOT_CONTRACT";
    string constant private ERROR_ARAGON_ID_NOT_PROVIDED = "TEMPLATE_ARAGON_ID_NOT_PROVIDED";
    string constant private ERROR_ARAGON_ID_NOT_CONTRACT = "TEMPLATE_ARAGON_ID_NOT_CONTRACT";
    string constant private ERROR_MINIME_FACTORY_NOT_PROVIDED = "TEMPLATE_MINIME_FAC_NOT_PROVIDED";
    string constant private ERROR_MINIME_FACTORY_NOT_CONTRACT = "TEMPLATE_MINIME_FAC_NOT_CONTRACT";

    ENS internal ens;
    MiniMeTokenFactory internal miniMeFactory;

    uint64 constant PCT = 10 ** 16;
    address constant ANY_ENTITY = address(-1);

    event DeployToken(address token);
    event InstalledApp(address appProxy, bytes32 appId);


    /* ACL */

    function _createPermissions(ACL _acl, address[] _grantees, address _app, bytes32 _permission, address _manager) internal {
        _acl.createPermission(_grantees[0], _app, _permission, address(this));
        for (uint256 i = 1; i < _grantees.length; i++) {
            _acl.grantPermission(_grantees[i], _app, _permission);
        }
        _acl.revokePermission(address(this), _app, _permission);
        _acl.setPermissionManager(_manager, _app, _permission);
    }

    function _createPermissionForTemplate(ACL _acl, address _app, bytes32 _permission) internal {
        _acl.createPermission(address(this), _app, _permission, address(this));
    }

    function _removePermissionFromTemplate(ACL _acl, address _app, bytes32 _permission) internal {
        _acl.revokePermission(address(this), _app, _permission);
        _acl.removePermissionManager(_app, _permission);
    }

    /* TOKEN MANAGER */

    function _installTokenManagerApp(Kernel _dao, MiniMeToken _token, uint8 _tokenType) internal returns (TokenManager) {
        bool transferable;
        uint256 maxAccountTokens;
        TokenManager tokenManager = TokenManager(_installNonDefaultApp(_dao, TOKEN_MANAGER_APP_ID));
        _token.changeController(tokenManager);
        (transferable, maxAccountTokens) = _getTokenType(_tokenType);
        tokenManager.initialize(_token, transferable, maxAccountTokens);
        return tokenManager;
    }

    function _createTokenManagerPermissions(ACL _acl, TokenManager _tokenManager, address _grantee, address _manager) internal {
        _acl.createPermission(_grantee, _tokenManager, _tokenManager.MINT_ROLE(), _manager);
        _acl.createPermission(_grantee, _tokenManager, _tokenManager.BURN_ROLE(), _manager);
    }

    function _grantTokenManagerPermissions(ACL _acl, TokenManager _tokenManager, address _grantee) internal {
        _acl.grantPermission(_grantee, _tokenManager, _tokenManager.MINT_ROLE());
        _acl.grantPermission(_grantee, _tokenManager, _tokenManager.BURN_ROLE());
    }

    function _changeTokenManagerPermissionManager(ACL _acl, TokenManager _tokenManager, address _manager) internal {
        _acl.setPermissionManager(_manager, _tokenManager, _tokenManager.MINT_ROLE());
        _acl.setPermissionManager(_manager, _tokenManager, _tokenManager.BURN_ROLE());
    }

    function _mintTokens(ACL _acl, TokenManager _tokenManager, address[] _holders, uint256[] _stakes) internal {
        for (uint256 i = 0; i < _holders.length; i++) {
            _tokenManager.mint(_holders[i], _stakes[i]);
        }
    }

    function _mintTokens(ACL _acl, TokenManager _tokenManager, address[] _holders, uint256 _stake) internal {
        for (uint256 i = 0; i < _holders.length; i++) {
            _tokenManager.mint(_holders[i], _stake);
        }
    }

    function _mintTokens(TokenManager _tokenManager, address _holder, uint256 _stake) internal {
        _tokenManager.mint(_holder, _stake);
    }

    function _burnTokens(TokenManager _tokenManager, address _holder, uint256 _stake) internal {
        _tokenManager.burn(_holder, _stake);
    }

    function _burnTokens(TokenManager _tokenManager, address[] _holders, uint256 _stake) internal {
        for (uint256 i = 0; i < _holders.length; i++) {
            _tokenManager.burn(_holders[i], _stake);
        }
    }

    function _burnTokens(TokenManager _tokenManager, address[] _holders, uint256[] _stakes) internal {
        for (uint256 i = 0; i < _holders.length; i++) {
            _tokenManager.burn(_holders[i], _stakes[i]);
        }
    }

    /* VOTING */

    function _installVotingApp(Kernel _dao, MiniMeToken _token, uint64 _support,uint64 _acceptance, uint64 _duration) internal returns (Voting) {
        Voting voting = Voting(_installNonDefaultApp(_dao, VOTING_APP_ID));
        voting.initialize(_token, _support, _acceptance, _duration);
        return voting;
    }

    function _createVotingPermissions(ACL _acl, Voting _voting, address _grantee, address _manager) internal {
        _acl.createPermission(_grantee, _voting, _voting.MODIFY_QUORUM_ROLE(), _manager);
        _acl.createPermission(_grantee, _voting, _voting.MODIFY_SUPPORT_ROLE(), _manager);
        //Everyone can open a vote.
        _acl.createPermission(ANY_ENTITY, _voting, _voting.CREATE_VOTES_ROLE(), _manager);
    }

    /* APPS */

    function _installNonDefaultApp(Kernel _dao, bytes32 _appId) internal returns (address) {
        return _installApp(_dao, _appId, new bytes(0), false);
    }


    function _installApp(Kernel _dao, bytes32 _appId, bytes _data, bool _setDefault) internal returns (address) {
        address latestBaseAppAddress = _latestVersionAppBase(_appId);
        address instance = address(_dao.newAppInstance(_appId, latestBaseAppAddress, _data, _setDefault));
        emit InstalledApp(instance, _appId);
        return instance;
    }

    function _latestVersionAppBase(bytes32 _appId) internal view returns (address base) {
        Repo repo = Repo(PublicResolver(ens.resolver(_appId)).addr(_appId));
        (,base,) = repo.getLatest();
    }

    /* TOKEN */

    function _createToken(string _name, string _symbol, uint8 _decimals) internal returns (MiniMeToken) {
        // require(address(miniMeFactory) != address(0), ERROR_MINIME_FACTORY_NOT_PROVIDED);

        MiniMeToken token = miniMeFactory.createCloneToken(MiniMeToken(address(0)), 0, _name, _decimals, _symbol, true);
        emit DeployToken(address(token));
        return token;
    }
    
    function _getTokenType(uint8 _type) internal returns (bool transferable, uint256 maxAccount) {
        if (_type == 0) {
            //Membership Token Governance
            transferable = false;
            maxAccount = 1;
        } else if (_type == 1) {
            //Reputation Token Governance
            transferable = false;
            maxAccount = 0;
        } else if (_type == 2) {
            //Equity Token Governance
            transferable = true;
            maxAccount = 0;
        } else {
            transferable = false;
            maxAccount = 1;
        }
    }

}


contract CommitteeManager is AragonApp, BaseTemplate {
    using SafeMath for uint256;

    /// Events
    event CreateCommittee(address indexed committeeAddress, bytes32 name, string description,
    uint8 votingType, uint8 committeeType, string tokenSymbol, address[] initialMembers, uint64[3] votingInfo);
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
        uint8 votingType;
        uint8 committeeType;

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
     * @notice Create a new committee.
     * @param _name Committee's name
     * @param _description Committee's description
     * @param _tokenSymbol Committee's token
     * @param _types Committee type and Voting app type.
     * @param  _initialMembers Committee's initial members address.
     * @param _votingInfo It contains Voting configuration data like: approval percentage, quorum percentage and duration.
     */
    function createCommittee(bytes32 _name, string _description, string _tokenSymbol, uint8[2] _types, 
        address[] _initialMembers, uint64[3] _votingInfo) external auth(CREATE_COMMITTEE_ROLE) {
        address tokenManager;
        address voting;
        (tokenManager, voting) = _createCommitteeApps(_tokenSymbol, _initialMembers, _votingInfo, _types[0]);

        committees[tokenManager] = Committee(_name, _description, tokenManager, voting, _types[1], _types[0]);
        emit CreateCommittee(tokenManager, _name, _description, _types[1], _types[0], _tokenSymbol, _initialMembers, _votingInfo);
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
        It creates a new TokenManager and Voting app.
    */ 
    function _createCommitteeApps(string _committeeTokenSymbol, address[] _initialMembers,
        uint64[3] _votingInfo, uint8 _tokenType) internal returns (address tmAddress, address vAddress) {
        Kernel _dao = Kernel(kernel());
        ACL acl = ACL(_dao.acl());

        MiniMeToken token = _createToken(string(abi.encodePacked(_committeeTokenSymbol, " Token")), _committeeTokenSymbol, 0);
        TokenManager tokenManager = _installTokenManagerApp(_dao, token, _tokenType);
        _createTokenManagerPermissions(acl, tokenManager, this, this);
        _grantTokenManagerPermissions(acl, tokenManager, generalVoting);
        _mintTokens(acl, tokenManager, _initialMembers, 1);

        Voting voting = _installVotingApp(_dao, token, _votingInfo[0] * PCT, _votingInfo[1] * PCT, _votingInfo[2] * 1 days);
        //Only token holders can open a vote.
        _createVotingPermissions(acl, voting, generalVoting, generalVoting);
        _changeTokenManagerPermissionManager(acl, tokenManager, generalVoting);

        tmAddress = address(tokenManager);
        vAddress = address(voting);
    }
}