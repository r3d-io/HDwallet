class Wallet{
  static generateKey(rootNode, path){
    console.log("this is an abstract class function generateKey")
  }

  static generateAddress(rootNode, path){
    console.log("this is an abstract class function generateAddress")
  }

  static async createTransaction(userInput, fees){
    console.log("this is an abstract class function createTransaction")
  }
}

module.exports = Wallet;