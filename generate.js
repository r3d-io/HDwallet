const bip39 = require('bip39')
const hdkey = require('hdkey')
const subutil = require('util')
var getter = require('./getter')

exports.mnemonic = function() {
  let mnemonic = bip39.generateMnemonic()
  let seed = bip39.mnemonicToSeedSync(mnemonic)
  console.log(`Mnemonic ${mnemonic} \nSeed ${seed.toString('hex')}`)
  return mnemonic
}

exports.rootNode = async function(){
  let mnemonic = await getter.getMnemonic()
  let seed = bip39.mnemonicToSeedSync(mnemonic)
  let rootNode = hdkey.fromMasterSeed(seed)
  return rootNode
}