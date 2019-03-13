const fs = require("fs")
const path = require("upath")
const inquirer = require('inquirer');
const init = require("./init")
const config = "config.json"
const db = "db.json"

module.exports = async (basePath) => {

	let sure = await inquirer.prompt({
		type: 'confirm',
		name: 'reset',
		message: 'Are you sure you want to reset, will reset all downloads'
	})
	if (sure.reset) {
        fs.unlinkSync(path.join(basePath,db))
        console.log("Database has been reset")
        init(basePath)

	}
}
