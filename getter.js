const inquirer = require('inquirer');
var generate = require('./generate');

exports.getCoinType = async function() {
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

exports.getUserInput = async function (coinType) {
  if (coinType === 0) {
    userInput = await inquirer.prompt([
      {
        type: 'list',
        name: 'operationType',
        message: 'Do you want raw transaction or broadcast transaction on testnet?',
        choices: ['Broadcast', 'Raw transaction'],
      },
      {
        name: 'senderKey',
        message: 'Enter Your private key fot transaction signing ?',
        default: 'cN5egrS6YMetqHYhdQzJXm5Uo6LekFs1VaXdWXA1zJjUjL3eJybC'
      },
      {
        name: 'senderAddress',
        message: 'Enter Your address used for recieving change ?',
        default: 'mrbxFvwjzsMbnMgrsGFFDkfyvk9oVEUbHb'
      },
      {
        name: 'recieverAddress',
        message: 'Enter Reciever address ?',
        default: 'mw6UqYnazuLESfUMhruAKt6DmQ3SWW475H'
      },
      {
        name: 'amount',
        message: 'Enter Amount to send ?',
        default: '15842'
      },
    ])
  }
  else if (coinType === 60) {
    userInput = await inquirer.prompt([
      {
        type: 'list',
        name: 'operationType',
        message: 'Do you want raw transaction or broadcast transaction on testnet?',
        choices: ['Broadcast', 'Raw transaction'],
      },
      {
        name: 'myKey',
        message: 'Enter Your private key fot transaction signing ?',
        default: 'c3e4d55b6da69801e62dcf16e01581b406d597760b12d45e022f80753b52c1af'
      },
      {
        name: 'myAddress',
        message: 'Enter Your address used for recieving change ?',
        default: '0x64d703057769DaC45052F3C36A5E4876Aa1516b5'
      },
      {
        name: 'recieverAddress',
        message: 'Enter Reciever address ?',
        default: '0x2FbF99b222E7CA87aFCA86F579d3e76d427DFB3A'
      },
      {
        name: 'amount',
        message: 'Enter Amount to send ?',
        default: '.01'
      },
    ])
  }
  return userInput
}


exports.getMnemonic = async function() {
  answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'options',
      message: 'Do you have a mnemonic or not?',
      choices: ['Yes', 'No'],
    },
  ])

  if (answers.options == "Yes") {
    response = await inquirer.prompt([
      {
        name: 'mnemonic',
        message: 'Enter your mnemonic',
        default: 'require pulse curve cage relief material voyage general act virus fabric wheat',
      },
    ])
    return response.mnemonic
  }
  else if (answers.options == "No") {
    mnemonic = generate.Mnemonic()
    return mnemonic
  }
}

exports.getAddress = async function(coinType) {
  answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'changeType',
      message: 'Please specify if it is an internal or external address?',
      choices: ['Internal', 'External'],
    },
    {
      name: 'addressNum',
      message: 'Enter the number for which you want to generate address ?',
      default: '0'
    },
  ])
  path = "m/44'/"
  if (coinType == "btc")
    path = path + "0'/0'/"
  else if (coinType == "eth")
    path = path + "60'/0'/"
  if (answers.changeType == "Internal")
    path = path + "0/"
  else if (answers.changeType == "External")
    path = path + "1/"
  path = path + answers.addressNum
  return path
}