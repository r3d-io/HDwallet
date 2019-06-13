const Web3 = require('web3');
const bip39 = require('bip39')
const hdkey = require('hdkey')
const util = require('ethereumjs-util');
const ethTx = require('ethereumjs-tx').Transaction
var inquirer = require('inquirer');

// console.log(mnemonic + "\n" + seed.toString('hex') + "\n" + addr + "\n" + address )

inquirer
  .prompt([
    {
      type: 'list',
      name: 'options',
      message: 'Which operation do you want to perform?',
      choices: ['Generate mnemonic', 'Generate key', 'Generate address'],
    },
  ])
  .then(answers => {
    if(answers.options == "Generate mnemonic"){
      generateMnemonic()
    }
    else if(answers.options == "Generate key"){
      getKey()
    }
    else if(answers.options == "Generate address"){
      generateAddress()
    }
  });

  function generateMnemonic(){
    let mnemonic = bip39.generateMnemonic()
    console.log(mnemonic)
    return mnemonic
  }

  function getKey(){
    inquirer.prompt([
      {
        type: 'list',
        name: 'options',
        message: 'Do you have a mnemonic or not?',
        choices: ['Yes', 'No'],
      },
    ])
    .then(answers => {
      if(answers.options == "Yes"){
        inquirer.prompt([
          {
            name: 'mnemonic',
            message: 'Enter your mnemonic',
            // default: 'require pulse curve cage relief material voyage general act virus fabric wheat',
          },
        ])
        .then(answers => {
          mnemonic= answers.mnemonic
          generateKey(mnemonic)
        });
      }
      else if(answers.options == "No"){
        mnemonic = generateMnemonic()
        generateKey(mnemonic)
      }
    });
  }

  function generateKey(mnemonic){
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const rootNode = hdkey.fromMasterSeed(seed)
    console.log("Master private key" + rootNode._privateKey.toString('hex') + "\nMaster public key" + rootNode._publicKey.toString('hex') )
    return rootNode
  }

  function generateAddress(){
    rootNode = getKey()
    const addrNode = rootNode.derive("m/44'/60'/0'/0/0");
    const pubKey = util.privateToPublic(addrNode._privateKey);
    const addr = util.publicToAddress(pubKey).toString('hex');
    const address = util.toChecksumAddress(addr);
    console.log("Address" + address)
    return address
  }