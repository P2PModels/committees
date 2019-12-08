pragma solidity ^0.4.24;

import "@aragon/os/contracts/apm/APMNamehash.sol";
import "@aragon/os/contracts/common/IsContract.sol";
import "@aragon/apps-shared-minime/contracts/MiniMeToken.sol";
import "@aragon/os/contracts/apm/Repo.sol";
import "@aragon/os/contracts/acl/ACL.sol";
import "@aragon/os/contracts/kernel/Kernel.sol";
import "@aragon/os/contracts/lib/ens/ENS.sol";
import "@aragon/os/contracts/lib/ens/PublicResolver.sol";

import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "@aragon/apps-voting/contracts/Voting.sol";
// import "@aragon/apps-agent/contracts/Agent.sol";
import "@aragon/apps-finance/contracts/Finance.sol";


contract CommitteeHelper is APMNamehash, IsContract {
    /* Hardcoded constant to save gas
    * bytes32 constant internal VAULT_APP_ID = apmNamehash("vault");                  // vault.aragonpm.eth
    * bytes32 constant internal VOTING_APP_ID = apmNamehash("voting");                // voting.aragonpm.eth
    * bytes32 constant internal FINANCE_APP_ID = apmNamehash("finance");              // finance.aragonpm.eth
    * bytes32 constant internal TOKEN_MANAGER_APP_ID = apmNamehash("token-manager");  // token-manager.aragonpm.eth
    */
    bytes32 constant internal VAULT_APP_ID = 0x7e852e0fcfce6551c13800f1e7476f982525c2b5277ba14b24339c68416336d1;
    bytes32 constant internal VOTING_APP_ID = 0x9fa3927f639745e587912d4b0fea7ef9013bf93fb907d29faeab57417ba6e1d4;
    bytes32 constant internal FINANCE_APP_ID = 0xbf8491150dafc5dcaee5b861414dca922de09ccffa344964ae167212e8c673ae;
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

    /* VAULT */

    function _installNonDefaultVaultApp(Kernel _dao) internal returns (Vault) {
        bytes memory initializeData = abi.encodeWithSelector(Vault(0).initialize.selector);
        return Vault(_installNonDefaultApp(_dao, VAULT_APP_ID, initializeData));
    }

    function _createVaultPermissions(ACL _acl, Vault _vault, address _grantee, address _manager) internal {
        _acl.createPermission(_grantee, _vault, _vault.TRANSFER_ROLE(), _manager);
    }

    /* FINANCE */

    function _installFinanceApp(Kernel _dao, Vault _vault, uint64 _periodDuration) internal returns (Finance) {
        bytes memory initializeData = abi.encodeWithSelector(Finance(0).initialize.selector, _vault, _periodDuration);
        return Finance(_installNonDefaultApp(_dao, FINANCE_APP_ID, initializeData));
    }

    function _createFinancePermissions(ACL _acl, Finance _finance, address _grantee, address _manager) internal {
        _acl.createPermission(_grantee, _finance, _finance.EXECUTE_PAYMENTS_ROLE(), _manager);
        _acl.createPermission(_grantee, _finance, _finance.MANAGE_PAYMENTS_ROLE(), _manager);
    }

    function _createFinanceCreatePaymentsPermission(ACL _acl, Finance _finance, address _grantee, address _manager) internal {
        _acl.createPermission(_grantee, _finance, _finance.CREATE_PAYMENTS_ROLE(), _manager);
    }

    function _grantCreatePaymentPermission(ACL _acl, Finance _finance, address _to) internal {
        _acl.grantPermission(_to, _finance, _finance.CREATE_PAYMENTS_ROLE());
    }

    function _transferCreatePaymentManagerFromTemplate(ACL _acl, Finance _finance, address _manager) internal {
        _acl.setPermissionManager(_manager, _finance, _finance.CREATE_PAYMENTS_ROLE());
    }

    /* TOKEN MANAGER */

    function _installTokenManagerApp(Kernel _dao, MiniMeToken _token, bool[2] _tokenParams) internal returns (TokenManager) {

        TokenManager tokenManager = TokenManager(_installNonDefaultApp(_dao, TOKEN_MANAGER_APP_ID));
        _token.changeController(tokenManager);
        tokenManager.initialize(_token, _tokenParams[0], _tokenParams[1] ? 1 : 0);
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

    function _mintTokens(TokenManager _tokenManager, address[] _holders, uint256[] _stakes) internal {
        for (uint256 i = 0; i < _holders.length; i++) {
            _tokenManager.mint(_holders[i], _stakes[i]);
        }
    }

    function _mintTokens(TokenManager _tokenManager, address[] _holders, uint256 _stake) internal {
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

    function _installNonDefaultApp(Kernel _dao, bytes32 _appId, bytes memory _initializeData) internal returns (address) {
        return _installApp(_dao, _appId, _initializeData, false);
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
        require(address(miniMeFactory) != address(0), ERROR_MINIME_FACTORY_NOT_PROVIDED);

        MiniMeToken token = miniMeFactory.createCloneToken(MiniMeToken(address(0)), 0, _name, _decimals, _symbol, true);
        emit DeployToken(address(token));
        return token;
    }
}
