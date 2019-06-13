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
      response = await inquirer.prompt([
        {
          name: 'mnemonic',
          message: 'Enter your mnemonic',
          default: 'require pulse curve cage relief material voyage general act virus fabric wheat',
        },
      ])
      mnemonic = response.mnemonic
      rootNode = await generateKey(mnemonic)
      return rootNode
    }
    else if(answers.options == "No"){
      mnemonic = generateMnemonic()
      rootNode = await generateKey(mnemonic)
      return rootNode
    }
  }

  async function getAddress(){
    answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'currencyType',
        message: 'Which currency you want to use etherum or bitcoin',
        choices: ['eth', 'btc'],
      },
      {
        type: 'list',
        name: 'changeType',
        message: 'Please specify if it is an internal or external address?',
        choices: ['Internal', 'External'],
      },
      {
        name: 'addressNum',
        message: 'Enter the number for which you want to generate address ?',
        default: '0'
      },
    ])
    path = "m/44'/" + "60'/0'/0/0"
    if (answers.currencyType == "btc"){
      path = path + "0'/"
    }
    else if(answers.currencyType == "eth"){
      path = path + "60'/"
    }
    if (answers.changeType == "Internal"){
      path = path + "0'/"
    }
    else if(answers.changeType == "External"){
      path = path + "1'/"
    }
    path = path + answers.addressNum
    return path
  }

  function generateMnemonic(){
    let mnemonic = bip39.generateMnemonic()
    console.log(mnemonic)
    return mnemonic
  }

  function generateKey(mnemonic){
    const seed =  bip39.mnemonicToSeedSync(mnemonic)
    const rootNode =  hdkey.fromMasterSeed(seed)
    console.log("Master private key" + rootNode._privateKey.toString('hex') + "\nMaster public key" + rootNode._publicKey.toString('hex') )
    return rootNode
  }

  async function generateAddress(){
    rootNode = await getKey()
    path = await getAddress()
    const addrNode = rootNode.derive(path);
    const pubKey = util.privateToPublic(addrNode._privateKey);
    const addr = util.publicToAddress(pubKey).toString('hex');
    const address = util.toChecksumAddress(addr);
    console.log("Address " + address)
    return address
  }