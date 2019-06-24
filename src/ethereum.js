const Web3 = require('web3');
const util = require('ethereumjs-util');
const dotenv = require('dotenv');
dotenv.config();
const Wallet = require("./wallet.js");

class ethereumWallet extends Wallet {

	static generateKey (rootNode, path) {
		console.log(`Root private key ${rootNode.privateExtendedKey} \nRoot public key ${rootNode.publicExtendedKey}`)
		let addrNode = rootNode.derive(path);
 
		let publicKey = addrNode._publicKey.toString('hex')
		let extPrivateKey = addrNode.privateExtendedKey
		let extPublicKey = addrNode.publicExtendedKey
		let privateKey = addrNode._privateKey.toString('hex')

		console.log(`Extended private key  ${extPrivateKey} \nExtended public key  ${extPublicKey}`)
		console.log(`Derived path private key  ${privateKey} \nDerived path public key  ${publicKey}`)
	}

	static generateAddress (rootNode, path) {
		const addrNode = rootNode.derive(path);
		const pubKey = util.privateToPublic(addrNode._privateKey);
		const addr = util.publicToAddress(pubKey).toString('hex');
		const address = util.toChecksumAddress(addr);
		console.log(`\nAddress ${address} \nPrivate key ${addrNode._privateKey.toString('hex')}`)
		return address
	}

	static async createTransaction (userInput, gasLimit) {
		const privateKey = userInput.myKey
		const fromAddress = userInput.myAddress
		const toAddress = userInput.recieverAddress
		const amount = userInput.amount

		let web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_TESTNET));
		let recieverAddress = toAddress;
		let txValue = web3.utils.numberToHex(web3.utils.toWei(amount, 'ether'));
		let gasPrice = await web3.eth.getGasPrice();
		let gasPriceVal = web3.utils.numberToHex(gasPrice);
		let txData = web3.utils.asciiToHex('my first eth transactionAmount');
		web3.eth.getBlock("latest", false, (error, result) => {
			gasLimit = web3.utils.numberToHex(result.gasLimit)
		});
		let nonceVal = await web3.eth.getTransactionCount(fromAddress)
		nonceVal = web3.utils.numberToHex(nonceVal)
		console.log(nonceVal, recieverAddress, gasPriceVal, gasLimit, txValue)

		const rawTransaction = {
			nonce: nonceVal,
			to: recieverAddress,
			gasPrice: gasPriceVal, //GWei
			gasLimit: gasLimit, //Wei
			value: txValue,
			data: txData,
			chainId: 3,
		};
		const signed = await web3.eth.accounts.signTransaction(rawTransaction, privateKey)
		const rawTx = signed.rawTransaction
		console.log(rawTx)

		if (userInput.operationType == "Broadcast") {
			sendEthTransaction(rawTx)
		}
	}

	sendEthTransaction(rawTx) {
		const sendRawTx = rawTx =>
			new Promise((resolve, reject) =>
				web3.eth
					.sendSignedTransaction(rawTx)
					.on('transactionHash', resolve)
					.on('error', reject)
			)
		sendRawTx(rawTx).then(hash => console.log({ hash }))
	}
}

module.exports = ethereumWallet;