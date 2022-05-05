var MyNotary = artifacts.require("Ballot");

module.exports = function(deployer, network, accounts) {
 deployer.deploy(MyNotary,{from: accounts[0]});
};