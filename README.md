# HDwallet
## This is an implementation for Hierarchical determinsitc wallet in nodejs
1. To setup the project just clone the project and run 
  > npm install or npm i (Install all dependency present in package.json)
2. To start the project run 
  > npm start
### App structure
- *index.js*  Excutes the main program if you want to use CLI based interface <br />
- *generate.js* Contains common functinality required by other modules <br />
- *getter.js* Contains all methods required to take user input <br />
- *bitcoin.js* Contains methods for **Bitcoin** address,key generation and transaction broadcasting <br />
- *ethereum.js* Contains methods for **Ethereum** address,key generation and transaction broadcasting <br />

### Method description
**[ethereum.js](./ethereum.js)**  
- *generateKey(rootNode)*<br />
  It only require rootNode for key generation. rootNode can be derieved from your personal mnemonic or else it can be obainted from getMnemonic method of generate.js 
- *generateAddress(rootNode, path)*<br />
  The rootNode is an object required to derieve public key. it can be obtained with help of rootNode function present in generate module
  path here refers to bip44 path of the wallet address you want to generate. it is in the form of ("m/44'/60'/0'/0/0")
- *createTransaction (userInput, gasLimit)*<br />
  userInput is a dictionary containing parameters provided by the user
  - operationType (Wether you want to only generate raw transaction hash or broadcast and perform actual transaction)
  - senderKey (Your private key)
  - senderAddress (Your ethereum address)
  - recieverAddress (Reciever address to whom you want to send money)
  - amount (Amount to be send in satoshi)
  gasLimit refers to maximum gas amount you are ready to pay. If you want to set it automatically you can pass a negative value

**[bitcoin.js](./bitcoin.js)**  
- *generateKey(rootNode)*<br />
  It only require rootNode for key generation. rootNode can be derieved from your personal mnemonic or else it can be obainted from getMnemonic method of generate.js 
- *generateAddress(rootNode, path)*<br />
  The rootNode is an object required to derieve public key. it can be obtained with help of rootNode function present in generate module
  path here refers to bip44 path of the wallet address you want to generate. it is in the form of ("m/44'/0'/0'/0/0")
- *createTransaction (userInput, fees)*<br />
  userInput is a dictionary containing parameters provided by the user
  - operationType (Wether you want to only generate raw transaction hash or broadcast and perform actual transaction)
  - senderKey (Your private key)
  - senderAddress (Your ethereum address)
  - recieverAddress (Reciever address to whom you want to send money)
  - amount (Amount to be send in satoshi)
  fees refers to maximum amount of miner fee you are ready to pay. If you want to set it automatically you can pass a negative value

**[generate.js](./generate.js)**
 - *menmonic ()*<br />
  generate mnemonic for user if not present 
 - *rootNode ()*<br />
  generate rootNode required for public private key pair derivation