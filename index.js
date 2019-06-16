const inquirer = require('inquirer')
const bip39 = require('bip39')
const hdkey = require('hdkey')
const util = require('ethereumjs-util')
const createHash = require ('create-hash')
const bs58check = require('bs58check')
const wif = require('wif')
// const Web3 = require('web3')
// const bitcoin = require("bitcoinjs-lib")
// const ethTx = require('ethereumjs-tx').Transaction

async function executemain() {
	answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'options',
			message: 'Which operation do you want to perform?',
			choices: ['Generate mnemonic', 'Generate key', 'Generate address','Exit'],
		},
	])

	if (answers.options == "Generate mnemonic") {
		generateMnemonic()
	}
	else if (answers.options == "Generate key") {
		coinType = await getCoinType()
		generateKey(coinType)
	}
	else if (answers.options == "Generate address") {
		coinType = await getCoinType()
		if (coinType == 'eth')
			generateAddressEther(coinType)
		else if(coinType == 'btc')
      generateAddressBitcoin(coinType)
  }
  else{
    process.exit()
  }
  console.log('\n')
  // executemain()
}

async function getCoinType() {
	coinType = await inquirer.prompt([
		{
			type: 'list',
			name: 'currencyType',
			message: 'Which currency you want to use Ethereum or Bitcoin',
			choices: ['eth', 'btc'],
		},
	])
	return coinType.currencyType
}

async function getMnemonic() {
	answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'options',
			message: 'Do you have a mnemonic or not?',
			choices: ['Yes', 'No'],
		},
	])

	if (answers.options == "Yes") {
		response = await inquirer.prompt([
			{
				name: 'mnemonic',
				message: 'Enter your mnemonic',
				default: 'require pulse curve cage relief material voyage general act virus fabric wheat',
			},
		])
		return response.mnemonic
	}
	else if (answers.options == "No") {
		mnemonic = generateMnemonic()
		return mnemonic
	}
}

async function getAddress(coinType) {
	answers = await inquirer.prompt([
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
	path = "m/44'/"
	if (coinType == "btc")
		path = path + "0'/0'"
	else if (coinType == "eth")
		path = path + "60'/0'"
	if (answers.changeType == "Internal")
		path = path + "0/"
	else if (answers.changeType == "External")
		path = path + "1/"
	path = path + answers.addressNum
	return path
}

function generateMnemonic() {
  let mnemonic = bip39.generateMnemonic()
	const seed = bip39.mnemonicToSeedSync(mnemonic)  
	console.log("\nMnemonic " + mnemonic + "\nSeed " + seed.toString('hex'))
	return mnemonic
}

async function generateKey(coinType) {
	mnemonic = await getMnemonic()
	const seed = bip39.mnemonicToSeedSync(mnemonic)
	rootNode = hdkey.fromMasterSeed(seed)
	console.log("Extended private key " + rootNode.privateExtendedKey + "\nExtended public key " + rootNode.publicExtendedKey)
	if (coinType == 'eth') {		
		addrNode = rootNode.derive("m/44'/60'/0'/0/0");
		console.log("Master private key " + addrNode._privateKey.toString('hex') + "\nMaster public key " + addrNode._publicKey.toString('hex'))
	}
	else if (coinType == 'btc') {
    addrNode = rootNode.derive("m/44'/0'/0'/0/0");
    privateKey = wif.encode(128, addrNode._privateKey, true)
    console.log("Master private key " + privateKey + "\nMaster public key " + addrNode._publicKey.toString('hex'))
	}
	return rootNode
}

async function generateAddressEther(coinType) {
	rootNode = await generateKey(coinType)
	path = await getAddress(coinType)
	const addrNode = rootNode.derive(path);
	const pubKey = util.privateToPublic(addrNode._privateKey);
	const addr = util.publicToAddress(pubKey).toString('hex');
	const address = util.toChecksumAddress(addr);
	console.log("\nAddress " + address)
	return address
}

async function generateAddressBitcoin(coinType) {
  rootNode = await generateKey(coinType)
	path = await getAddress(coinType)
	addrNode = rootNode.derive(path);
  step1 = addrNode._publicKey;
  step2 = createHash('sha256').update(step1).digest();
  step3 = createHash('rmd160').update(step2).digest();
  step5 = createHash('sha256').update(step3).digest();
  step6 = createHash('sha256').update(step5).digest();
  step7 = step6.slice(0,4)
  step8 = Buffer.concat([step3, step7]);
  // step4 = Buffer.allocUnsafe(21);
  // console.log(step4.toString('hex')  + "\n" +step6.toString('hex') + "\n" +step7.toString('hex'))
  // step4.writeUInt8(0x6f, 0);
  // step3.copy(step4, 1);
  // step9 = bs58check.encode(step4);
  address = bs58check.encode(step8);  
  console.log("\nAddress " + address)
  return address
}

executemain()