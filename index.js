const bip39 = require('bip39')
const hdkey = require('hdkey')

const mnemonic = bip39.generateMnemonic()
const seed = bip39.mnemonicToSeedSync(mnemonic)

const root = hdkey.fromMasterSeed(seed);
const masterPrivateKey = root._privateKey.toString('hex');
const masterPublicKey = root._publicKey.toString('hex');

console.log(mnemonic + "\n" + seed.toString('hex') + "\n" + masterPrivateKey + "\n" + masterPublicKey )

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})
readline.question('Enter seed length 12 15 18 21 24', (seedlength) => {
  
  readline.close()
})
