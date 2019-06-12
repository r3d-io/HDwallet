const Web3 = require('web3');
const bip39 = require('bip39')
const hdkey = require('hdkey')
const util = require('ethereumjs-util');
const ethTx = require('ethereumjs-tx').Transaction

let mnemonic = bip39.generateMnemonic()
mnemonic = "require pulse curve cage relief material voyage general act virus fabric wheat"
const seed = bip39.mnemonicToSeedSync(mnemonic)

const root = hdkey.fromMasterSeed(seed);
// const masterPrivateKey = root._privateKey.toString('hex');
// const masterPublicKey = root._publicKey.toString('hex');

const addrNode = root.derive("m/44'/60'/0'/0/0"); //line 1
const pubKey = util.privateToPublic(addrNode._privateKey);
const addr = util.publicToAddress(pubKey).toString('hex');
const address = util.toChecksumAddress(addr);

const params = {
  nonce: 0,
  to: '0x4584158529818ef77D1142bEeb0b6648BD8eDb2f',
  value: '0.1',
  gasPrice: 5000000000,
  gasLimit: 21000,
  chainId: 3
};
const tx = new ethTx(params);
tx.sign(addrNode._privateKey);
const serializedTx = tx.serialize()

const web3 = new Web3("ws://localhost:8546");

web3.eth.net.isListening()
   .then(() => console.log('is connected'))
   .catch(e => console.log('Wow. Something went wrong'));

web3.eth.sendSignedTransaction( `0x${serializedTx.toString('hex')}`, 
  (error, result) => { 
      if (error) { console.log(`Error: ${error}`); }  
      else { console.log(`Result: ${result}`); } 
  } 
 );

console.log(mnemonic + "\n" + seed.toString('hex') + "\n" + address )

// const readline = require('readline').createInterface({
//   input: process.stdin,
//   output: process.stdout
// })
// readline.question('Enter seed length 12 15 18 21 24', (seedlength) => {
  
//   readline.close()
// })

// https://iancoleman.io/bip39/
// geth --testnet --ws --wsorigins="*"
