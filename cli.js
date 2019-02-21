#!/usr/bin/env node

const dl = require("./download");
const db = require("./db")
const fs = require("fs")
const init = require("./init")
const path = require("upath")
const meow = require('meow');

const cli = meow(`
	Usage
	  $ myapp <input>

	Options
	  --init, -i  create new Directory
	  --update <mins>, -u <min>	 update every <min> mins

	Examples
	  $ myapp unicorns --init
`, {
	flags: {
		init: {
			type: 'boolean',
			alias: 'i'
		},
		update: {
			type: 'string',
			alias: 'u'
		}
	}
});


const basePath = "./test"

async function update() {
	let rawdata = fs.readFileSync("test/config.json");
	let config = JSON.parse(rawdata);
	/**
	 * Loop through each playlist
	 */
	for (const playlist of config.playlists) {
		let toDownload = await db.checkVideos(playlist.link)
		console.log(toDownload)
		let playlistDir = await db.getPlaylistPath(basePath, playlist.link)

		for (const video of toDownload) {
			let result = await dl.download(playlistDir, playlist, video)
			db.addVideo(playlist.link, video)
		}
	}
}

/**
 * call vitomuci, pass over args, opions and argv
 */
(async () => {
	console.log(cli.input[0], cli.flags)
	if (cli.input[0] === undefined) {
		console.log("Pleace specify a path")
		return
	}
	if (cli.flags.init) {
		init(cli.input[0]);
	}
	
	let rawdata = fs.readFileSync("test/config.json");
	let config = JSON.parse(rawdata);
	db.init(path.join(basePath, "db.json"));
	await db.prepare(config)
	await update()
})();
