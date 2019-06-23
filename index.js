const inquirer = require('inquirer')
const btc = require('./bitcoin');
const eth = require('./ethereum');
const create = require('./generate');
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

  if (answers.options === "Generate mnemonic") {
    create.mnemonic()
  }
  else if (answers.options === "Generate key") {
    coinType = await getter.getCoinType()
    rootNode = await create.rootNode()

    if (coinType === 'eth')
      eth.generateKey(rootNode)
    else if (coinType === 'btc')
      btc.generateKey(rootNode)
  }
  else if (answers.options === "Generate address") {
    coinType = await getter.getCoinType()
    rootNode = await create.rootNode()
    path = await getter.getAddress(coinType)

    if (coinType === 'eth')
      eth.generateAddress(rootNode, path)
    else if (coinType === 'btc')
      btc.generateAddress(rootNode, path)
  }
  else if (answers.options === "BTC transaction") {
    userInput = await getter.getUserInput(0)
    btc.createTransaction(userInput, 5000)
  }
  else if (answers.options === "ETH transaction") {
    userInput = await getter.getUserInput(60)
    eth.createTransaction(userInput, 25000)
  }
  else {
    process.exit()
  }
}

executemain()