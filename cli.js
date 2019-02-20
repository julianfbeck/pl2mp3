#!/usr/bin/env node

const program = require("commander");
const vt = require("./vitomuci");
const chalk = require("chalk");
const notifier = require('node-notifier');
const interactive = require("./interactive");
const db = require("./db")
const fs = require("fs")
const path = require("upath")


const basePath = "./test"

async function update() {
	let rawdata = fs.readFileSync("test/config.json");
	let config = JSON.parse(rawdata);
	/**
	 * Loop through each playlist
	 */
	for (const playlist of config.playlists) {
		let toDownload = await db.checkVideos(playlist.link)
        let playlistPath = await db.getPlaylistPath(basePath, playlist.link)
        
		for (const video of playlistPath) {
            
		}
	}
}

/**
 * call vitomuci, pass over args, opions and argv
 */
(async () => {
	let rawdata = fs.readFileSync("test/config.json");
	let config = JSON.parse(rawdata);
	db.init(path.join(basePath, "db.json"));
	await db.prepare(config)
	await update()
})();
