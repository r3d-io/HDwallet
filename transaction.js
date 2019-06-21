const bitcoin = require('bitcoinjs-lib');
const rp = require('request-promise');
const Web3 = require('web3');

exports.btcTransaction = async function (userInput, fees) {

  const TestNet = bitcoin.networks.testnet
  let privateKey = userInput.senderKey
  let fromAddress = userInput.senderAddress
  let toAddress = userInput.recieverAddress
  let amount = Number(userInput.amount) + fees;
  let key = bitcoin.ECPair.fromWIF(privateKey, TestNet);
  const url = "https://api.blockcypher.com/v1/btc/test3/addrs/" + fromAddress + "?unspentOnly=true";
  let json = JSON.parse(await rp.get(url))
  let utxos = json.txrefs
  let transaction
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
  transaction = tx.build().toHex()

  console.log(`final amount to send ${transSum} change ${change} remaining ${json.balance - transSum + change} \n`)
  console.log(transaction);
  if (userInput.operationType == "Broadcast") {
    sendBtcTransaction(transaction)
  }
}

exports.ethTransaction = async function (userInput,gasLimit) {
  privateKey = userInput.myKey
  fromAddress = userInput.myAddress
  toAddress = userInput.recieverAddress
  amount = userInput.amount

  var web3 = new Web3(
    new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/6d83b486e19548de928707c8336bf15b')
  );
  let recieverAddress = toAddress;
  let txValue = web3.utils.numberToHex(web3.utils.toWei(amount, 'ether'));
  let gasPrice = await web3.eth.getGasPrice();
  let gasPriceVal = web3.utils.numberToHex(gasPrice);
  gasLimit = web3.utils.numberToHex(gasLimit);
  let txData = web3.utils.asciiToHex('my first eth transactionAmount');
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

  const sendRawTx = rawTx =>
  new Promise((resolve, reject) =>
    web3.eth
      .sendSignedTransaction(rawTx)
      .on('transactionHash', resolve)
      .on('error', reject)
  )
  sendRawTx(rawTx).then(hash => console.log({ hash }))
}

function sendBtcTransaction(transaction) {
  var options = {
    method: 'POST',
    uri: "https://api.blockcypher.com/v1/btc/test3/txs/push",
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