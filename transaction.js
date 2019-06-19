const inquirer = require('inquirer');
const bitcoin = require("bitcoinjs-lib");
const request = require("request");
const Web3 = require('web3');
const subutil = require('util')

exports.btcTransaction = async function () {
  answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'operationType',
      message: 'Do you want raw transaction or broadcast transaction on testnet?',
      choices: ['Raw transaction', 'Broadcast'],
    },
    {
      name: 'myKey',
      message: 'Enter Your private key fot transaction signing ?',
      default: 'cN5egrS6YMetqHYhdQzJXm5Uo6LekFs1VaXdWXA1zJjUjL3eJybC'
    },
    {
      name: 'myAddress',
      message: 'Enter Your address used for recieving change ?',
      default: 'mrbxFvwjzsMbnMgrsGFFDkfyvk9oVEUbHb'
    },
    {
      name: 'recieverAddress',
      message: 'Enter Reciever address ?',
      default: 'mw6UqYnazuLESfUMhruAKt6DmQ3SWW475H'
    },
    {
      name: 'amount',
      message: 'Enter Amount to send ?',
      default: '10921'
    },
  ])

  privateKey = answers.myKey
  fromAddress = answers.myAddress
  toAddress = answers.recieverAddress
  amount = Number(answers.amount);
  fee = 5000;
  const TestNet = bitcoin.networks.testnet
  // const insight = new explorers.Insight();

  if (answers.operationType == "Raw transaction") {
    var key = bitcoin.ECPair.fromWIF(privateKey, TestNet);
    var tx = new bitcoin.TransactionBuilder(TestNet);
    tx.addInput("405dc36b7a8d841b102a46360781b58c1db7764d380558f61d3f2cd38c146d98", 0);
    tx.addOutput(toAddress, amount);
    tx.addOutput(fromAddress, amount-1000);
    tx.sign(0, key);
    console.log(tx.build().toHex());
  }
  else if (answers.operationType == "Broadcast") {
    const url = "https://api.blockcypher.com/v1/btc/test3/addrs/mrbxFvwjzsMbnMgrsGFFDkfyvk9oVEUbHb?unspentOnly=true";
    let transaction
    request.get(url, (error, response, body) => {

      if (error) {
        console.log("unable to request server", error)
        return
      }

      let json = JSON.parse(body);
      let utxos = json.txrefs
      let key = bitcoin.ECPair.fromWIF(privateKey, TestNet);
      let tx = new bitcoin.TransactionBuilder(TestNet);

      balance = 0
      for (i = 0; i < utxos.length && balance <= amount; i++) {
        tx.addInput(utxos[i].tx_hash, utxos[i].tx_output_n);
        balance += Number(utxos[i].value)
        console.log(utxos[i].tx_hash);
      }
      // tx.addInput(utxos[0].tx_hash, utxos[0].tx_output_n);
      tx.addOutput(toAddress, amount);
      tx.addOutput(fromAddress, amount-1000);
      tx.sign(0, key);

      transaction = tx.build().toHex()
      console.log(transaction);
    });

    var options = {
      uri: 'https://api.blockcypher.com/v1/btc/test3/txs/push',
      method: 'POST',
      json: {
        "tx": transaction
      }
    };
    request(options,
      function (err, httpResponse, body) {
        if (err) {
          console.log("unable to request server", err)
          return
        }
        // console.log("transaction hash \n" + body)
        console.log(subutil.inspect(body, {showHidden: false, depth: null}))
      })
  }
}

exports.ethTransaction = async function () {
  var web3 = new Web3(
    new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/6d83b486e19548de928707c8336bf15b')
  );
  let recieverAddress = '0x2FbF99b222E7CA87aFCA86F579d3e76d427DFB3A';
  let key = "c3e4d55b6da69801e62dcf16e01581b406d597760b12d45e022f80753b52c1af"
  // let privateKey = new Buffer.from(key, 'hex');
  let txValue = web3.utils.numberToHex(web3.utils.toWei('.01', 'ether'));
  let gasPrice = await web3.eth.getGasPrice();
  let gasPriceVal = web3.utils.numberToHex(gasPrice);
  let gasLimit = web3.utils.numberToHex(25000);
  let txData = web3.utils.asciiToHex('my first eth transactionAmount');
  let nonceVal = await web3.eth.getTransactionCount('0x64d703057769DaC45052F3C36A5E4876Aa1516b5')

  nonceVal = web3.utils.numberToHex(nonceVal)
  console.log(nonceVal, recieverAddress, gasPriceVal, gasLimit, txValue)

  const rawTransaction = {
    nonce: nonceVal,
    to: recieverAddress,
    gasPrice: gasPriceVal, // 90 GWei
    gasLimit: gasLimit, // 22000 Wei
    value: txValue,
    data: txData,
    chainId: 3,
  };
  const signed = await web3.eth.accounts.signTransaction(rawTransaction, key)
  const rawTx = signed.rawTransaction

  signedTransaction = await web3.eth.sendSignedTransaction(rawTx)
  console.log(signedTransaction)
}
