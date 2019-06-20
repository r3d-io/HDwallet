const inquirer = require('inquirer');
const bitcoin = require("bitcoinjs-lib");
const request = require("request");
var rp = require('request-promise');
const Web3 = require('web3');
const subutil = require('util')

exports.btcTransaction = async function () {
  answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'operationType',
      message: 'Do you want raw transaction or broadcast transaction on testnet?',
      choices: ['Broadcast', 'Raw transaction'],
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
      default: '15842'
    },
  ])

  privateKey = answers.myKey
  fromAddress = answers.myAddress
  toAddress = answers.recieverAddress
  amount = Number(answers.amount);
  let fees = 6000;
  const TestNet = bitcoin.networks.testnet
  // const insight = new explorers.Insight();

  if (answers.operationType == "Raw transaction") {
    var key = bitcoin.ECPair.fromWIF(privateKey, TestNet);
    var tx = new bitcoin.TransactionBuilder(TestNet);
    tx.addInput("405dc36b7a8d841b102a46360781b58c1db7764d380558f61d3f2cd38c146d98", 0);
    tx.addOutput(toAddress, amount);
    tx.addOutput(fromAddress, amount - 1000);
    tx.sign(0, key);
    console.log(tx.build().toHex());
  }
  else if (answers.operationType == "Broadcast") {
    const url = "https://api.blockcypher.com/v1/btc/test3/addrs/" + fromAddress + "?unspentOnly=true";
    let transaction
    let json = JSON.parse(await rp.get(url))
    let utxos = json.txrefs
    let key = bitcoin.ECPair.fromWIF(privateKey, TestNet);
    let transSum = 0
    console.log(`Amount: ${amount} Account balance: ${json.balance} fees: ${fees}`)
    // console.log(url, utxos)
    
    let tx = new bitcoin.TransactionBuilder(TestNet);
    tx.setVersion(2);
    for (let utx of utxos) {
      console.log("Output Hash:", utx.tx_hash, "Output Index:", utx.tx_output_n, "utx value", utx.value );
      tx.addInput(utx.tx_hash, utx.tx_output_n);
      transSum += utx.value;
      if (transSum >= amount ) break;
    }
    let change = transSum - amount;
    console.log(`final amount to send ${transSum} change ${change} remaining ${json.balance-transSum+change}`)
    // tx.addInput(utxos[0].tx_hash, utxos[0].tx_output_n);
    tx.addOutput(toAddress, amount);
    tx.addOutput(fromAddress, change);
    tx.sign(0, key);
    transaction = tx.build().toHex()
    console.log(transaction);

    // var options = {
    //   method: 'POST',
    //   uri: 'https://api.blockcypher.com/v1/btc/test3/txs/push',
    //   json: {
    //     "tx": transaction
    //   }
    // };

    var options = {
      method: 'POST',
      uri: 'https://chain.so/api/v2/send_tx/BTCTEST',
      body: { tx_hex: transaction },
      json: true // Automatically stringifies the body to JSON
    };


    rp(options)
      .then(function (parsedBody) {
        console.log(parsedBody)
      })
      .catch(function (err) {
        console.log(err.statusCode, err.message, err.error)
      });

    // request(hash,
    //   function (err, httpResponse, body) {
    //     if (err) {
    //       console.log("unable to request server", err)
    //       return
    //     }
    //     // console.log("transaction hash \n" + body)
    //     console.log(subutil.inspect(body, { showHidden: false, depth: null }))
    //   })
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
