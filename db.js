const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const fs = require("fs");
const pl = require("./playlist");
const path = require("upath")
let db
let adapter

function init(dbPath) {
	adapter = new FileSync(dbPath);
	db = low(adapter);


}
/**
 * check database and folders
 */
async function prepare(config) {
	//check if playlist exisitstiert
	if (!db.has("playlists").value()) db.set("playlists", []).write();
	//check if there is a object for each array
	for (const playlist of config.playlists) {
		//playlist doesnt exist
		if (
			db
			.get("playlists")
			.find({
				link: playlist.link,
			})
			.isEmpty()
			.value()
		) {
			let title = await pl.getPlaylistInformation(playlist.link, 1);
			db.get("playlists")
				.push({
					link: playlist.link,
					title: title.title,
					videos: [],
				})
				.write();
			if (!fs.existsSync(path.join("test/", title.title))) {
				fs.mkdirSync(path.join("test/", title.title));
			}

		}
	}
}

async function checkforNewVideos(playlist) {
	let dlVideos = db.get("playlists").find({
		link: playlist
	}).get("videos").value()

	let listInfo = await pl.getPlaylistInformation(playlist, 9999);
	let newVideos = listInfo.items.map(obj => {
		return obj.url
	})
	return newVideos.filter(v => {
		return !dlVideos.includes(v);
	})
}
async function getPlaylistPath(base, playlist) {
	return path.join(base, db.get("playlists").find({
		link: playlist
	}).get("title").value())
}
module.exports.checkVideos = checkforNewVideos;
module.exports.prepare = prepare;
module.exports.init = init;
module.exports.getPlaylistPath = getPlaylistPath;
