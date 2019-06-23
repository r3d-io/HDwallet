const bitcoin = require('bitcoinjs-lib');
const rp = require('request-promise');
const wif = require('wif');
const create = require('./generate');
const dotenv = require('dotenv');
dotenv.config();

generateKey = async function (rootNode) {
  console.log(`Root private key ${rootNode.privateExtendedKey} \nRoot public key ${rootNode.publicExtendedKey}`)

  addrNode = rootNode.derive("m/44'/0'/0'/0");
  publicKey = wif.encode(128, addrNode._publicKey, true)

  extPrivateKey = addrNode.privateExtendedKey
  extPublicKey = addrNode.publicExtendedKey
  privateKey = addrNode._privateKey.toString('hex')

  console.log(`Extended private key  ${extPrivateKey} \nExtended public key  ${extPublicKey}`)
  console.log(`Derived path private key  ${privateKey} \nDerived path public key  ${publicKey}`)
}

addressBitcoin = async function (rootNode, path) {
  const addrNode = rootNode.derive(path);
  const privateKey = wif.encode(128, addrNode._privateKey, true)
  const keyPair = bitcoin.ECPair.fromWIF(privateKey)
  const publicKey = addrNode._publicKey.toString('hex')
  let { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
  console.log(`Path ${path} \nAddress: ${address.toString('hex')} \nprivate key ${privateKey}\npublic key ${publicKey}`)
  return address
}

testnetAddressBitcoin = async function (rootNode, path) {
  const TestNet = bitcoin.networks.testnet
  const addrNode = rootNode.derive(path);
  const privateKey = wif.encode(128, addrNode._privateKey, true)
  const keyPair = bitcoin.ECPair.fromWIF(privateKey)
  keyPair.network = TestNet;
  privateKey = keyPair.toWIF()
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: TestNet })
  console.log(`Public address: ${address} \n Private: ${privateKey}`)
}

btcTransaction = async function (userInput, fees) {
  
  const TestNet = bitcoin.networks.testnet
  const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${fromAddress}?unspentOnly=true`;
  let privateKey = userInput.senderKey
  let fromAddress = userInput.senderAddress
  let toAddress = userInput.recieverAddress
  let amount = Number(userInput.amount) + fees;
  let key = bitcoin.ECPair.fromWIF(privateKey, TestNet);
  let json = JSON.parse(await rp.get(url))
  let utxos = json.txrefs
  let transSum = 0
  let utxosarr = []
  console.log(`Amount: ${amount} Account balance: ${json.balance} fees: ${fees}`)
  
  let tx = new bitcoin.TransactionBuilder(TestNet);
  tx.setVersion(2);
  
  for (let index = 0; index < utxos.length; index++) {
    console.log("Output Hash:", utxos[index].tx_hash, "Output Index:", utxos[index].tx_output_n, "utx value", utxos[index].value);
    transSum += utxos[index].value;
    utxosarr.push(utxos[index].tx_hash)
    tx.addInput(utxos[index].tx_hash, utxos[index].tx_output_n);
    if (transSum >= amount) break;
  }
  let change = transSum - amount;
  
  tx.addOutput(toAddress, amount);
  tx.addOutput(fromAddress, change);
  for (let index = 0; index < utxosarr.length; index++) {
    tx.sign(index, key);
  }
  let transaction = tx.build().toHex()
  
  console.log(`final amount to send ${transSum} change ${change} remaining ${json.balance - transSum + change} \n`)
  console.log(transaction);
  if (userInput.operationType == "Broadcast") {
    sendBtcTransaction(transaction)
  }
}

function sendBtcTransaction(transaction) {
  var options = {
    method: 'POST',
    uri: process.env.BTC_TESTNET,
    body: {
      tx: transaction
    },
    json: true
  };
  
  rp(options)
  .then(function (parsedBody) {
    console.log(parsedBody)
  })
  .catch(function (err) {
    console.log(err.statusCode, err.message, err.error)
  });
}

exports.generateKey = generateKey;
exports.generateAddress = addressBitcoin;
exports.generateTestnetAddress = testnetAddressBitcoin;
exports.createTransaction = btcTransaction;