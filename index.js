const fs = require('fs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

let bipseed=""
readline.question('Enter seed length 12 15 18 21 24', (seedlength) => {
	
	let rawdata = fs.readFileSync('english.json');  
	let wordlist = JSON.parse(rawdata);

	for (i = 0; i < seedlength; i++){
		let wordindex = Math.round(Math.random() * (2048) )
		bipseed = bipseed + " " + wordlist[wordindex]
	}
	console.log(bipseed);
  readline.close()
})
