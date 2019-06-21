const bip39 = require('bip39')
const hdkey = require('hdkey')
const util = require('ethereumjs-util')
const wif = require('wif')
const bitcoin = require('bitcoinjs-lib')
const subutil = require('util')
var getter = require('./getter')

exports.Mnemonic = function() {
  let mnemonic = bip39.generateMnemonic()
  let seed = bip39.mnemonicToSeedSync(mnemonic)
  console.log(`Mnemonic ${mnemonic} \nSeed ${seed.toString('hex')}`)
  return mnemonic
}

generateRootNode = async function(){
  let mnemonic = await getter.getMnemonic()
  let seed = bip39.mnemonicToSeedSync(mnemonic)
  let rootNode = hdkey.fromMasterSeed(seed)
  return rootNode
}
exports.RootNode = generateRootNode;

generateKey = async function(coinType) {
  let rootNode = await generateRootNode()
  console.log(`Root private key ${rootNode.privateExtendedKey} \nRoot public key ${rootNode.publicExtendedKey}`)
  if (coinType == 'eth') {
    addrNode = rootNode.derive("m/44'/60'/0'/0");
    publicKey = addrNode._publicKey.toString('hex')
    
  }
  else if (coinType == 'btc') {
    addrNode = rootNode.derive("m/44'/0'/0'/0");
    publicKey = wif.encode(128, addrNode._publicKey, true)
  }

  extPrivateKey = addrNode.privateExtendedKey
  extPublicKey = addrNode.publicExtendedKey
  privateKey = addrNode._privateKey.toString('hex')

  console.log(`Extended private key  ${extPrivateKey} \nExtended public key  ${extPublicKey}`)
  console.log(`Derived path private key  ${privateKey} \nDerived path public key  ${publicKey}`)
}
exports.Key = generateKey;

exports.AddressEther = async function(rootNode, path) {
  const addrNode = rootNode.derive(path);
  const pubKey = util.privateToPublic(addrNode._privateKey);
  const addr = util.publicToAddress(pubKey).toString('hex');
  const address = util.toChecksumAddress(addr);
  console.log(`\nAddress ${address} \nPrivate key ${addrNode._privateKey.toString('hex')}`)
  return address
}

exports.AddressBitcoin = async function(rootNode, path) {
  const addrNode = rootNode.derive(path);
  const privateKey = wif.encode(128, addrNode._privateKey, true)
  const keyPair = bitcoin.ECPair.fromWIF(privateKey)
  const publicKey = addrNode._publicKey.toString('hex')
  let { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey })
  console.log(`Path ${path} \nAddress: ${address.toString('hex')} \nprivate key ${privateKey}\npublic key ${publicKey}`)
  return address
}

exports.TestnetAddressBitcoin = async function(rootNode, path) {
  const TestNet = bitcoin.networks.testnet
  const addrNode = rootNode.derive(path);
  const privateKey = wif.encode(128, addrNode._privateKey, true)
  const keyPair = bitcoin.ECPair.fromWIF(privateKey)
  keyPair.network = TestNet;
  const privateKey = keyPair.toWIF()
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: TestNet })
  console.log(`Public address: ${address} \n Private: ${privateKey}`)
}