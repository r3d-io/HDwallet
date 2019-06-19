const bip39 = require('bip39')
const hdkey = require('hdkey')
const util = require('ethereumjs-util')
const wif = require('wif')
const bitcoin = require("bitcoinjs-lib")
const inquirer = require('inquirer');
const subutil = require('util')

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
    mnemonic = generate.Mnemonic()
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


exports.Mnemonic = function() {
  let mnemonic = bip39.generateMnemonic()
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  console.log("\nMnemonic " + mnemonic + "\nSeed " + seed.toString('hex'))
  return mnemonic
}

generateKey = async function(coinType) {
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
exports.Key = generateKey;

exports.AddressEther = async function(coinType) {
  rootNode = await generateKey(coinType)
  path = await getAddress(coinType)
  const addrNode = rootNode.derive(path);
  const pubKey = util.privateToPublic(addrNode._privateKey);
  const addr = util.publicToAddress(pubKey).toString('hex');
  const address = util.toChecksumAddress(addr);
  console.log("\nAddress " + address + "\nPrivate key " + addrNode._privateKey.toString('hex'))
  return address
}

exports.AddressBitcoin = async function(coinType){
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

exports.TestnetAddressBitcoin = async function(coinType) {
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