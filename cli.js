#!/usr/bin/env node

const dl = require("./download");
const db = require("./db")
const init = require("./init")
const reset = require("./reset")
const fs = require("fs")
const pkg = require('./package.json');
const sanitize = require("sanitize-filename");
const ora = require('ora');
const path = require("upath")
const meow = require('meow');
const updateNotifier = require('update-notifier');
const configFile = "config.json"
const dbFile = "db.json"
const cli = meow(`
	Usage
	  $ myapp <Download Directory>

	Options
	  --init, -i  create new Directory
	  --update <mins>, -u <min>	check for playlist updates every <min> mins. Default 10min
	  --reset, -r resets database, removes downloaded videos

	Examples
	  $ pl2mp3 --init <Download Directory> // to create a new Directory
	  $ pl2mp3 <Download Directory> // to start watching 
	  $ pl2mp3 -update 20 <Download Directory> // to watch every 20min for changes.
`, {
	flags: {
		init: {
			type: 'boolean',
			alias: 'i'
		},
		reset: {
			type: 'boolean',
			alias: 'r'
		},
		update: {
			type: 'string',
			alias: 'u'
		}
	}
});
let downloading = false;

async function update(basePath) {
	downloading = true;
	let rawdata = fs.readFileSync(path.join(basePath, "config.json"));
	let config = JSON.parse(rawdata);
	/**
	 * Loop through each playlist
	 */

	for (const playlist of config.playlists) {
		let toDownload = await db.checkVideos(playlist.link)
		if (toDownload.length != 0) {

			const spinner = ora(`Downloading Videos to ${basePath}`).start();
			let playlistDir = await db.getPlaylistPath(basePath, playlist.link)
			if (!fs.existsSync(playlistDir)) {
				fs.mkdirSync(sanitize(playlistDir))
			}
			let i = 1;
			for (const video of toDownload) {
				spinner.text = `Downloading ${i}/${toDownload.length} Videos to ${playlistDir}`
				await dl.download(playlistDir, playlist, video)
				db.addVideo(playlist.link, video)
				i++
			}
			spinner.succeed(`Finished Downloading ${toDownload.length} Videos to ${playlistDir}`)
		}
	}
	downloading = false;
}

/**
 * call vitomuci, pass over args, opions and argv
 */
(async () => {
	updateNotifier({
		pkg
	}).notify();
	let basePath = cli.input[0];
	if (cli.input[0] === undefined) {
		console.log("Please specify a download Directory");
		cli.showHelp();
		return
	}
	if (!fs.existsSync(path.join(basePath, configFile))|| !fs.existsSync(path.join(basePath,dbFile))){
		console.log("config.json and db.json missing. Please use the --init option to create a new download directory.")
		cli.showHelp();
		return
	}
	
	if (cli.flags.init) {
		init(cli.input[0]);
		console.log("Run pl2mp3 <directory> to start watching")
		return
	}
	if (cli.flags.reset) {
		await reset(cli.input[0]);
		console.log("Run pl2mp3 <directory> to start watching")
		return
	}
	let updateTime = cli.flags.update || 10;
	let rawdata = fs.readFileSync(path.join(basePath, "config.json"));
	let config = JSON.parse(rawdata);
	db.init(path.join(basePath, "db.json"));
	await db.prepare(basePath, config)
	await update(basePath)
	setInterval(async () => {
		if (downloading) {
			return
		}
		await update(basePath)
	}, updateTime * 60 * 1000);
})();