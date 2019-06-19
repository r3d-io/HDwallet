const inquirer = require('inquirer')
var transaction = require('./transaction');
var generate = require('./generate');

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
    transaction.btcTransaction('btc')
  }
  else if (answers.options == "ETH transaction") {
    transaction.ethTransaction('eth')
  }
  else if (answers.options == "Generate address") {
    coinType = await getCoinType()
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

async function getCoinType() {
  coinType = await inquirer.prompt([
    {
      type: 'list',
      name: 'currencyType',
      message: 'Which currency you want to use Ethereum or Bitcoin',
      choices: ['eth', 'btc'],
    },
  ])
  return coinType.currencyType
}

executemain()