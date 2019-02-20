#!/usr/bin/env node

const program = require("commander");
const vt = require("./vitomuci");
const chalk = require("chalk");
const notifier = require('node-notifier');
const interactive = require("./interactive");
const db = require("./db")
const fs = require("fs")



/**
 * call vitomuci, pass over args, opions and argv
 */
const before = Date.now();
(async () => {
    let rawdata = fs.readFileSync("test/config.json");
    let config = JSON.parse(rawdata);
    db.init("test/db.json")
    await db.prepare(config)
})();