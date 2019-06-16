const inquirer = require('inquirer')
const bip39 = require('bip39')
const hdkey = require('hdkey')
const util = require('ethereumjs-util')
const sha256 = require('js-sha256');
const ripemd160 = require('ripemd160')
const base58 = require('bs58check')
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
    console.log("Master private key " + addrNode._privateKey.toString('hex') + "\nMaster public key " + addrNode._publicKey.toString('hex'))
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
  let hash = sha256(Buffer.from(addrNode._publicKey, 'hex'));
  let publicKeyHash = ripemd160().update(Buffer.from(hash, 'hex')).digest();
  step1 = Buffer.from("00" + publicKeyHash, 'hex');
  step2 = sha256(step1);
  step3 = sha256(Buffer.from(step2, 'hex'));
  checksum = step3.substring(0, 8);
  step4 = step1.toString('hex') + checksum;
  address = base58.encode(Buffer.from(step4, 'hex'));
	console.log("\nAddress " + address)
  return address
}

executemain()