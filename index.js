const Web3 = require('web3');
const bip39 = require('bip39')
const hdkey = require('hdkey')
const util = require('ethereumjs-util');
const ethTx = require('ethereumjs-tx').Transaction
var inquirer = require('inquirer');

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

  async function getKey(){
    answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'options',
        message: 'Do you have a mnemonic or not?',
        choices: ['Yes', 'No'],
      },
    ])

    if(answers.options == "Yes"){
      answer = await inquirer.prompt([
        {
          name: 'mnemonic',
          message: 'Enter your mnemonic',
          default: 'require pulse curve cage relief material voyage general act virus fabric wheat',
        },
      ])
      mnemonic= answer.mnemonic
      rootNode = await generateKey(mnemonic)
      return rootNode
    }
    else if(answers.options == "No"){
      mnemonic = generateMnemonic()
      rootNode = await generateKey(mnemonic)
      return rootNode
    }
  }

  async function generateKey(mnemonic){
    const seed = await bip39.mnemonicToSeedSync(mnemonic)
    const rootNode = await hdkey.fromMasterSeed(seed)
    console.log("Master private key" + rootNode._privateKey.toString('hex') + "\nMaster public key" + rootNode._publicKey.toString('hex') )
    return rootNode
  }

  async function generateAddress(){
    rootNode = await getKey()
    const addrNode = rootNode.derive("m/44'/60'/0'/0/0");
    const pubKey = util.privateToPublic(addrNode._privateKey);
    const addr = util.publicToAddress(pubKey).toString('hex');
    const address = util.toChecksumAddress(addr);
    console.log("Address " + address)
    return address
  }