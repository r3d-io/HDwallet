const bip39 = require('bip39')
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

const mnemonic = bip39.generateMnemonic()
const seed = bip39.mnemonicToSeedSync(mnemonic)
console.log(seed)
readline.question('Enter seed length 12 15 18 21 24', (seedlength) => {

  readline.close()
})
