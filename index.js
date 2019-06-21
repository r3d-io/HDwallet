const inquirer = require('inquirer')
var transaction = require('./transaction');
var generate = require('./generate');
var getter = require('./getter')

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
    generate.Mnemonic()
  }
  else if (answers.options == "Generate key") {
    coinType = await getCoinType()
    generate.Key(coinType)
  }
  else if (answers.options == "BTC transaction") {
    // generateTestnetAddressBitcoin('btc')
    userInput = getter.getUserInput(0)
    transaction.btcTransaction(userInput)
  }
  else if (answers.options == "ETH transaction") {
    userInput = getter.getUserInput(60)
    transaction.ethTransaction(userInput)
  }
  else if (answers.options == "Generate address") {
    coinType = await getter.getCoinType()
    if (coinType == 'eth')
      generate.AddressEther(coinType)
    else if (coinType == 'btc')
      generate.TestnetAddressBitcoin(coinType)
  }
  else {
    process.exit()
  }
  console.log('\n')
  // executemain()
}

executemain()