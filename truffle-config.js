var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "random galaxy action metal fog topic timber response unlock magnet bomb hello";
module.exports = {
 networks: {
    compilers: {
        solc: {
            vesion: "0.5.1",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                evmVersion: "byzantium"
            }
        }
    },
  development: {
   host: "127.0.0.1",
   port: 8545,
   network_id: 4
  },
  rinkeby: {
      provider: function() { 
       return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/a449da99e824497dba6e95c6e54eb27e");
      },
      network_id: 4,
      gas: 4500000, 
      gasPrice: 10000000000,
      skipDryRun: true
  }


 }
};