const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const fs = require('fs');

const adapter = new FileSync('test/db.json')
const db = low(adapter)

let rawdata = fs.readFileSync('test/config.json');  
let config = JSON.parse(rawdata);  

//check if playlist exisitstiert
if(!db.has("playlists").value())
  db.set('playlists', []).write()
//check if there is a object for each array
for (const playlist of config.playlists) {
  //playlist dosnt exists
  if(db.get("playlists").find({name:playlist.name}).isEmpty().value()){
  }
}