const bip39 = require('bip39')
const hdkey = require('hdkey')
const util = require('ethereumjs-util');

const mnemonic = bip39.generateMnemonic()
const seed = bip39.mnemonicToSeedSync(mnemonic)

const root = hdkey.fromMasterSeed(seed);
// const masterPrivateKey = root._privateKey.toString('hex');
// const masterPublicKey = root._publicKey.toString('hex');

const addrNode = root.derive("m/44'/60'/0'/0/0"); //line 1
const pubKey = util.privateToPublic(addrNode._privateKey);
const addr = util.publicToAddress(pubKey).toString('hex');
const address = util.toChecksumAddress(addr);

console.log(mnemonic + "\n" + seed.toString('hex') + "\n" + address )

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})
readline.question('Enter seed length 12 15 18 21 24', (seedlength) => {
  
  readline.close()
})

// https://iancoleman.io/bip39/