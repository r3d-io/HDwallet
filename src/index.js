const inquirer = require('inquirer');
const btc = require('./bitcoin.js');
const eth = require('./ethereum.js');
const create = require('./common.js');
const getter = require('./getter.js');

async function executemain() {
  answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'options',
      message: 'Which operation do you want to perform?',
      choices: ['Generate mnemonic', 'Generate key', 'Generate address', 'BTC transaction', 'ETH transaction', 'Exit'],
    },
  ])

  switch (answers.options) {
    case "Generate mnemonic": {
      create.mnemonic()
      break;
    }
    case "Generate key": {
      let coinType = await getter.getCoinType()
      let rootNode = await create.rootNode()

      if (coinType === 'eth')
        eth.generateKey(rootNode, "m/44'/60'/0'/0")
      else if (coinType === 'btc')
        btc.generateKey(rootNode, "m/44'/0'/0'/0")
      break;
    }
    case "Generate address": {
      let coinType = await getter.getCoinType()
      let rootNode = await create.rootNode()
      path = await getter.getAddress(coinType)

      if (coinType === 'eth')
        eth.generateAddress(rootNode, path)
      else if (coinType === 'btc')
        btc.generateAddress(rootNode, path)
      break;
    }
    case "BTC transaction": {
      let userInput = await getter.getUserInput(0)
      btc.createTransaction(userInput, 5000)
      break;
    }
    case "ETH transaction": {
      let userInput = await getter.getUserInput(60)
      eth.createTransaction(userInput, 25000)
      break;
    }
    default: {
      process.exit()
    }
  }
}

executemain()