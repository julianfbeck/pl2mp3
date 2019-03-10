#!/usr/bin/env node
const dl = require("./download");
const db = require("./db")
const fs = require("fs")
const init = require("./init")
const path = require("upath")
const meow = require('meow');

const cli = meow(`
	Usage
	  $ myapp <Download Directory>

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


async function update(basePath) {
	let rawdata = fs.readFileSync(path.join(basePath, "config.json"));
	let config = JSON.parse(rawdata);
	/**
	 * Loop through each playlist
	 */
	for (const playlist of config.playlists) {
		let toDownload = await db.checkVideos(playlist.link)
		console.log(toDownload)
		let playlistDir = await db.getPlaylistPath(basePath, playlist.link)
		console.log(playlistDir)
		if(!fs.existsSync(playlistDir)){
			console.log(`Creating ${playlistDir} directory`)
			fs.mkdirSync(playlistDir)
		}
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

	let basePath = cli.input[0];
	if(cli.input[0] === undefined){
		console.log("Please specify a download Directory");
        cli.showHelp();
	}
	if (cli.flags.init) {
		init(cli.input[0]);
	}

	let rawdata = fs.readFileSync(path.join(basePath, "config.json"));
	let config = JSON.parse(rawdata);
	db.init(path.join(basePath, "db.json"));
	await db.prepare(basePath, config)
	await update(basePath)
})();
