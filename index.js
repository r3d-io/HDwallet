const Web3 = require('web3')
const bip39 = require('bip39')
const bip32 = require('bip32')
const hdkey = require('hdkey')
const util = require('ethereumjs-util')
const ethTx = require('ethereumjs-tx').Transaction
const inquirer = require('inquirer')
const bitcoin = require("bitcoinjs-lib")
const ec = require("elliptic").ec
const ecdsa = new ec('secp256k1')
const sha256 = require('js-sha256');
const ripemd160 = require('ripemd160');

async function executemain() {
	answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'options',
			message: 'Which operation do you want to perform?',
			choices: ['Generate mnemonic', 'Generate key', 'Generate address'],
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
}

async function getCoinType() {
	coinType = await inquirer.prompt([
		{
			type: 'list',
			name: 'currencyType',
			message: 'Which currency you want to use etherum or bitcoin',
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
		mnemonic = response.mnemonic
		return mnemonic
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
		path = path + "0'/"
	else if (coinType == "eth")
		path = path + "60'/"
	if (answers.changeType == "Internal")
		path = path + "0'/"
	else if (answers.changeType == "External")
		path = path + "1'/"
	path = path + answers.addressNum
	return path
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
	console.log("Extended private key " + rootNode.privateExtendedKey + "\nExtended public key " + rootNode.publicExtendedKey)
	if (coinType == 'eth') {
		var rootNode = hdkey.derive("m/44'/0'")
		console.log("Master private key " + rootNode._privateKey.toString('hex') + "\nMaster public key " + rootNode._publicKey.toString('hex'))
	}
	else if (coinType == 'btc') {
		var rootNode = hdkey.derive("m/44'/0'")
		console.log("Master private key " + rootNode._privateKey.toString('hex') + "\nMaster public key " + rootNode._publicKey.toString('hex'))
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