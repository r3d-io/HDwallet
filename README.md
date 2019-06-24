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
