const inquirer = require('inquirer')
const transaction = require('./transaction');
const generate = require('./generate');
const getter = require('./getter')

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
    generate.mnemonic()
  }
  else if (answers.options == "Generate key") {
    coinType = await getter.getCoinType()
    generate.key(coinType)
  }
  else if (answers.options == "BTC transaction") {
    userInput = await getter.getUserInput(0)
    transaction.btcTransaction(userInput,5000)
  }
  else if (answers.options == "ETH transaction") {
    userInput = await getter.getUserInput(60)
    transaction.ethTransaction(userInput,25000)
  }
  else if (answers.options == "Generate address") {
    coinType = await getter.getCoinType()
    rootNode = await generate.RootNode()
    path = await getter.getAddress(coinType)

    if (coinType == 'eth')
      generate.addressEther(rootNode, path)
    else if (coinType == 'btc')
      generate.testnetAddressBitcoin(rootNode, path)
  }
  else {
    process.exit()
  }
  console.log('\n')
}

executemain()