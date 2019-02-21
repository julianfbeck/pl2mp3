const fs = require("fs")
const path = require("upath")
const config = "config.json"
const db = "db.json"

module.exports = (basePath) => {
	console.log(`Creating new installation at ${basePath}`)
	let dbPath = path.join(basePath, db)
	let configPath = path.join(basePath, config)
	if (!fs.existsSync(dbPath) && !fs.existsSync(configPath)) {
		fs.openSync(dbPath, 'w');
		fs.copyFileSync("sampleConfig.json", configPath)
	} else {
		console.log("Files already exist,")
	}

}
