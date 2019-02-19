const fs = require("fs")
const path = require("upath")
const config = "config.json"
const db = "db.json"
const tmp = "tmp"

module.exports = (folder) => {
    console.log(`Creating new installation at ${folder}`)
    let dbPath = path.join(folder, db)
    let configPath = path.join(folder, config)
    let tmpPath = path.join(folder,tmp)
    if (!fs.existsSync(dbPath) && !fs.existsSync(configPath)&& !fs.exists(tmpPath)){
        fs.openSync(dbPath, 'w');
        fs.copyFileSync("sampleConfig.json",configPath)
        fs.mkdirSync(tmpPath)
    }else{
        console.log("Files already exist")
    }
     
}
