const fs = require("fs")
const path = require("upath")
const config = "config.json"
const db = "db.json"

module.exports = (basePath) => {
	console.log(`Creating new installation at ${basePath}`)
	let dbPath = path.join(basePath, db)
	let configPath = path.join(basePath, config)

	if (!fs.existsSync(basePath))
		fs.mkdirSync(basePath)
	if (!fs.existsSync(configPath))
		fs.copyFileSync("sampleConfig.json", configPath)
	if (!fs.existsSync(dbPath))
		fs.openSync(dbPath, 'w');

}