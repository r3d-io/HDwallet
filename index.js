const inquirer = require('inquirer')
const bip39 = require('bip39')
const hdkey = require('hdkey')
const util = require('ethereumjs-util')
const createHash = require('create-hash')
const bs58check = require('bs58check')
const subutil = require('util')
const wif = require('wif')
// const Web3 = require('web3')
const bitcoin = require("bitcoinjs-lib")
// const ethTx = require('ethereumjs-tx').Transaction

async function executemain() {
	answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'options',
			message: 'Which operation do you want to perform?',
			choices: ['Generate mnemonic', 'Generate key', 'Generate address', 'BTC transaction', 'ETH transaction', 'Exit'],
		},
	])

	if (answers.options == "Generate mnemonic") {
		generateMnemonic()
	}
	else if (answers.options == "Generate key") {
		coinType = await getCoinType()
		generateKey(coinType)
	}
	else if (answers.options == "BTC transaction") {
    // generateTestnetAddressBitcoin('btc')
		btcTransaction('btc')
	}
	else if (answers.options == "ETH transaction") {
		ethTransaction('eth')
	}
	else if (answers.options == "Generate address") {
		coinType = await getCoinType()
		if (coinType == 'eth')
			generateAddressEther(coinType)
		else if (coinType == 'btc')
			generateAddressBitcoin(coinType)
	}
	else {
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
		path = path + "0'/0'/"
	else if (coinType == "eth")
		path = path + "60'/0'/"
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
	console.log("Root private key " + rootNode.privateExtendedKey + "\nRoot public key " + rootNode.publicExtendedKey)
	if (coinType == 'eth') {
		addrNode = rootNode.derive("m/44'/60'/0'/0");
		extPrivateKey = addrNode.privateExtendedKey 
		extPublicKey = addrNode.publicExtendedKey
		privateKey = addrNode._privateKey.toString('hex')
		publicKey = addrNode._publicKey.toString('hex')
		
	}
	else if (coinType == 'btc') {
		addrNode = rootNode.derive("m/44'/0'/0'/0");
		extPrivateKey = addrNode.privateExtendedKey 
		extPublicKey = addrNode.publicExtendedKey
		privateKey = addrNode._privateKey.toString('hex')
		publicKey = wif.encode(128, addrNode._publicKey, true)
	}
	console.log("Extended private key " + extPrivateKey + "\nExtended public key " + extPublicKey)
	console.log("Derived path private key " + privateKey + "\nDerived path public key " + publicKey)
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
	privateKey = wif.encode(128, addrNode._privateKey, true)
	keyPair = bitcoin.ECPair.fromWIF(privateKey)
	let { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
	publicKey = addrNode._publicKey.toString('hex')
	console.log("Path " + path + "\nAddress: " + address.toString('hex') + "\nprivate key " + privateKey + "\npublic key " + publicKey)
	return address
}

async function generateTestnetAddressBitcoin(coinType) {
  const TestNet = bitcoin.networks.testnet
  // let keyPair = bitcoin.ECPair.makeRandom({ network: TestNet })
  rootNode = await generateKey(coinType)
	path = await getAddress(coinType)
	addrNode = rootNode.derive(path);
	privateKey = wif.encode(128, addrNode._privateKey, true)
	keyPair = bitcoin.ECPair.fromWIF(privateKey)
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: TestNet })
  privateKey = keyPair.toWIF()
  console.log(`Public: ${address} \n Private: ${privateKey}`)
  // console.log(subutil.inspect(address, {showHidden: false, depth: null}))
}

async function btcTransaction(){
	const TestNet = Btc.networks.testnet;

	let privateKey = "KwifDwSF7Hxdfr5SF1BBASaRAs3F5omKRYPAQ6hWVC5UUb1i6rmm";
	let wallet = new Btc.ECPair.fromWIF(privateKey, TestNet);
	let publicKey = wallet.getAddress();
	console.log("my public key:", publicKey);

	let tx = new Btc.TransactionBuilder(TestNet);

	let amountWeHave = 100000; // 1.0 BTC
	let amountToKeep = 90000; // 0.9 BTC
	let transactionFee = 1000; // 0.0001 BTC
	let amountToSend = amountWeHave - amountToKeep - transactionFee; // ~0.1 (0.0999)

	tx.addInput("405dc36b7a8d841b102a46360781b58c1db7764d380558f61d3f2cd38c146d98", 1)
	tx.addOutput("mw6UqYnazuLESfUMhruAKt6DmQ3SWW475H", amountToSend);
	tx.addOutput(publicKey, amountToKeep);
	tx.sign(0, wallet);

	console.log(tx.build().toHex());
} 
executemain()