const inquirer = require('inquirer')
const bip39 = require('bip39')
const hdkey = require('hdkey')
const util = require('ethereumjs-util')
const subutil = require('util')
const wif = require('wif')
const bitcoin = require("bitcoinjs-lib")
const Web3 = require('web3')
const request = require("request");

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
      generateTestnetAddressBitcoin(coinType)
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
  console.log("\nAddress " + address + "\nPrivate key " + addrNode._privateKey.toString('hex'))
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
  keyPair.network = TestNet;
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: TestNet })
  privateKey = keyPair.toWIF()
  console.log(`Public address: ${address} \n Private: ${privateKey}`)
  // console.log(subutil.inspect(keyPair, {showHidden: false, depth: null}))
}

async function btcTransaction() {
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
      default: '100'
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
    tx.sign(0, key);
    console.log(tx.build().toHex());
  }
  else if (answers.operationType == "Broadcast") {
    const url = "https://api.blockcypher.com/v1/btc/test3/addrs/mrbxFvwjzsMbnMgrsGFFDkfyvk9oVEUbHb?unspentOnly=true";
    request.get(url, (error, response, body) => {
      let json = JSON.parse(body);
      balance = 0
      utxos = json.txrefs
      for(i = 0; i< utxos.length; i++){
        balance += Number(utxos[i].value)/1000000000
        console.log(utxos[i].tx_hash);
      }
      console.log(balance)
    });
  }
}

async function ethTransaction() {
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
executemain()