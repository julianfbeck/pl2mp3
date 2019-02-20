const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const fs = require("fs");
const adapter = new FileSync("test/db.json");
const db = low(adapter);
const pl = require("./playlist");
const path = require("upath")
let rawdata = fs.readFileSync("test/config.json");
let config = JSON.parse(rawdata);

/**
 * check database and folders
 */
async function init() {
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

	let listInfo = await pl.getPlaylistInformation(playlist.link, 9999);
	let newVideos = listInfo.items.map(obj => {
		return obj.url
	})
	return newVideos.filter(v => {
		return !dlVideos.includes(v);
	})

}


(async () => {
	await init();
	await checkforNewVideos()
})();
