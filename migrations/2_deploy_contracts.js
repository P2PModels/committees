/* global artifacts */
var CommitteeManager = artifacts.require('CommitteeManager.sol')

module.exports = function(deployer) {
  deployer.deploy(CommitteeManager)
}
