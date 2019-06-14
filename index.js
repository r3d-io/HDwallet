const Web3 = require('web3');
const bip39 = require('bip39')
const hdkey = require('hdkey')
const inquirer = require('inquirer')
const sha256 = require('js-sha256');
const ripemd160 = require('ripemd160');
const bitcoin = require("bitcoinjs-lib")
const util = require('ethereumjs-util')
const ethTx = require('ethereumjs-tx').Transaction

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
      generateKey()
    }
    else if(answers.options == "Generate address"){
      generateAddress()
    }
  });

  async function getMnemonic(){
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
      return mnemonic
    }
    else if(answers.options == "No"){
      mnemonic = generateMnemonic()
      return mnemonic
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

  async function generateKey(mnemonic){
    mnemonic = await getMnemonic()
    const seed =  bip39.mnemonicToSeedSync(mnemonic)
    const rootNode =  hdkey.fromMasterSeed(seed)
    console.log("Master private key" + rootNode._privateKey.toString('hex') + "\nMaster public key" + rootNode._publicKey.toString('hex') )
    return rootNode
  }

function generateMnemonic() {
	let mnemonic = bip39.generateMnemonic()
	console.log(mnemonic)
	return mnemonic
}

async function generateKey(coinType) {
	mnemonic = await getMnemonic()
	const seed = bip39.mnemonicToSeedSync(mnemonic)
	rootNode = hdkey.fromMasterSeed(seed)
	if (coinType == 'eth') {
		addrNode = rootNode.derive("m/44'/60'/0'/0/0");
		console.log("Master private key " + rootNode._privateKey.toString('hex') + "\nMaster public key " + rootNode._publicKey.toString('hex'))
	}
	else if (coinType == 'btc') {
		addrNode = rootNode.derive("m/44'/0'/0'/0/0");
		console.log("Master private key " + rootNode.privateExtendedKey + "\nMaster public key " + rootNode.publicExtendedKey)
	}
	console.log(rootNode)
	return rootNode
}

async function generateAddressEther(coinType) {
	rootNode = await generateKey(coinType)
	path = await getAddress(coinType)
	const addrNode = rootNode.derive(path);
	const pubKey = util.privateToPublic(addrNode._privateKey);
	const addr = util.publicToAddress(pubKey).toString('hex');
	const address = util.toChecksumAddress(addr);
	console.log("Address " + address)
	return address
}

async function generateAddressBitcoin(coinType) {
	rootNode = await generateKey(coinType)
	const step1 = Buffer.from("00" + rootNode.privateExtendedKey, 'hex');
	const step2 = sha256(step1);
	const step3 = sha256(Buffer.from(step2, 'hex'));
	const checksum = step3.substring(0, 8);
	const step4 = step1.toString('hex') + checksum;
	const address = base58.encode(Buffer.from(step4, 'hex'));
	return address
}
executemain()
