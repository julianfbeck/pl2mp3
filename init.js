const fs = require("fs")
const path = require("upath")
const config = "config.json"
const db = "db.json"

module.exports = (folder) => {
	console.log(`Creating new installation at ${folder}`)
	let dbPath = path.join(folder, db)
	let configPath = path.join(folder, config)
	if (!fs.existsSync(dbPath) && !fs.existsSync(configPath)) {
		fs.openSync(dbPath, 'w');
		fs.copyFileSync("sampleConfig.json", configPath)
	} else {
		console.log("Files already exist")
	}

}
