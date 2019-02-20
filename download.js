const path = require("upath");
const fs = require("fs");
const ffprobe = require("node-ffprobe");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const ytdl = require("ytdl-core");
const isUrl = require("is-url");
const chalk = require("chalk");
const ora = require("ora");

let ffmetadata;

let directory;
let options;

/**
 * download
 * @param {String} dir directory, file, file with regex, or youtube url
 * @param {*} op  options
 */
async function download(dir, config, ytVideo) {

	if (typeof dir == undefined) throw "please specify an directory";
	directory = dir;

	//set default value when calling as a module
	options = Object.assign({
		startAt: 0,
		endAt: 0,
		duration: 180,
		full: true,
	}, config);

	//parse time stamps to seconds
	options.startAt = stringToSeconds(options.startAt);
	options.endAt = stringToSeconds(options.endAt);
	options.duration = stringToSeconds(options.duration);

	//sets path variables for ffmpeg
	await checkffmpeg();

	//Download yt videos


	if (ytdl.validateURL(ytVideo)) {
		let title = await getVideoTitle(video);
		title = title.replace(/[/\\?%*:|"<>&]/g, "-"); //make sure there are no illeagale characters
		await downloadVideo(video, path.join(youtubeDir, title + ".mp4"));
		i++;
	}




	//get files
	const fileSpinner = ora(`searching for files...`).start();
	let files = getFiles(directory);
	//check if files are media files
	files = verifyFiles(files);
	if (typeof files === "undefined" || files.length == 0) {
		fileSpinner.fail("no file where found inside " + directory)
		throw "no files where found inside " + directory;
	}
	fileSpinner.succeed(`found ${chalk.blue(files.length)} file(s), start splitting...`)

	//rename files
	files = options.rename ? rename(files) : files;
	let baseDirectory = path.dirname(files[0]);
	let outputDirectory = path.join(baseDirectory, "audio");

	//create folders, delete existing files
	if (!fs.existsSync(outputDirectory))
		fs.mkdirSync(outputDirectory);

	//Split track
	for (let item of files) {
		let seconds = await getFileLength(item);
		let filename = path.basename(item);
		await splitTrack(baseDirectory, outputDirectory, filename, Number(seconds));
	}

	//set metadata name to first file in array if not set
	if (options.name === "") {
		let filename = path.basename(files[0])
		options.name = filename.substr(0, filename.lastIndexOf(".")) || filename;
	}
	//take cover picture
	let cover = "";
	if (options.cover)
		coverPath = await getCoverPicture(files[0], baseDirectory, options.startAt);

	//updating meta data
	if (options.metadata) {
		const metadataSpinner = ora(`searching for files...`).start();
		files = fs.readdirSync(outputDirectory);
		for (let file of files) {
			await writeMusicMetadata(path.join(outputDirectory, file), options.name, coverPath);
		}
		metadataSpinner.succeed(`updated metadata of ${chalk.blue(files.length)} file(s)`);
	}

	if (options.cover) await deleteFile(coverPath);
}


/**
 * Sets the required ffmpeg path to all 
 * packages that require it
 */
function checkffmpeg() {
	ffmpeg.setFfmpegPath(ffmpegPath);
	ffmpeg.setFfprobePath(ffprobePath);
	process.env.FFMPEG_PATH = ffmpegPath;
	ffprobe.FFPROBE_PATH = ffprobePath;
	ffmetadata = require("ffmetadata");
	console.log(chalk.grey("ffmpeg installed at:" + ffmpegPath));
	return ffmpegPath;
}

/**
 * Extracts one clip out of a longer mp3 file using the 
 * seekInput and duration fuction.
 * Gets called when splitting up a larger file smaller ones
 * @param {String} input 
 * @param {String} output 
 * @param {Number} start 
 * @param {Number} duration 
 */
function segmentMp3(input, output, start, duration) {
	return new Promise((resolve, reject) => {
		ffmpeg(input).seekInput(start).duration(duration).save(output)
			.on("end", function (stdout, stderr) {
				resolve();
			}).on('error', function (err, stdout, stderr) {
				reject('Cannot process video: ' + err.message);
			});
	});
};


/**
 * Splits a mp3 file into multiple smaller sized parts and renames them
 * if part is shorter than 30 seconds it gets skipped
 * @param {String} baseDirectory 
 * @param {String} outputDirectory 
 * @param {String} name 
 * @param {Number} duration 
 */
async function splitTrack(baseDirectory, outputDirectory, name, duration) {
	let parts = 0;
	const spinner = ora(`splitting ${name} into ${chalk.blue(parts + 1)} parts`).start();

	//if you dont want seprate clips
	if (options.full) {
		let ext = path.extname(name);
		let newName = path.removeExt(name, ext);
		await segmentMp3(path.join(baseDirectory, name), path.join(outputDirectory, newName + ".mp3"), 0, duration);
		spinner.succeed(`Converted ${chalk.blue(newName)} into mp3`);
		return;
	}

	let durationIndex = options.startAt;

	while ((durationIndex + options.duration) <= (duration - options.endAt)) {
		spinner.text = `splitting ${name} into ${chalk.blue(parts + 1)} parts`;
		await segmentMp3(path.join(baseDirectory, name), path.join(outputDirectory, getSegmentName(name, durationIndex, durationIndex + options.duration)), durationIndex, options.duration);
		durationIndex += options.duration;
		parts++;
	}
	if (((duration - options.endAt) - durationIndex) >= 30) {
		spinner.text = `splitting ${name} into ${chalk.blue(parts + 1)} parts`;
		await segmentMp3(path.join(baseDirectory, name), path.join(outputDirectory, getSegmentName(name, durationIndex, duration - options.endAt)), durationIndex, ((duration - options.endAt) - durationIndex));
		parts++;
	}
	spinner.succeed(`splitted ${name} into ${chalk.blue(parts)} parts`);

}


/**
 * Generates Name for a Segment
 * @param {String} name 
 * @param {Number} start 
 * @param {Number} end 
 */
function getSegmentName(name, start, end) {
	let ext = path.extname(name);
	name = path.removeExt(name, ext);
	return `${name}_${secondsToTimeString(start)}-${secondsToTimeString(end)}.mp3`.replace(/[/\\?%*:|"<>&]/g, '-');
}


/**
 * Converts seconds into a ISO time string 
 * @param {Number} seconds 
 */
function secondsToTimeString(seconds) {
	return new Date(seconds * 1000).toISOString().substr(14, 5).replace(":", ".");

}

/**
 * Returns seconds from strings like 00:00 or 10000
 * @param {String} timeString 
 */
function stringToSeconds(timeString) {
	let seconds = 0;
	if (!isNaN(timeString))
		seconds = timeString;
	else if (typeof timeString === "string" || timeString instanceof String) {
		if (timeString.indexOf(":") > -1) {
			let ms = timeString.split(":");
			seconds = (+ms[0]) * 60 + (+ms[1]);
		}
	} else
		throw timeString + " is not a number, please only use formats like 123 or 1:30";

	return Number(seconds);
}


/**
 * Returns the duration of a given 
 * media file
 * @param {*} file 
 */
function getFileLength(file) {
	return new Promise((resolve, reject) => {
		ffprobe(file, (err, probeData) => {
			if (err) reject(err);
			resolve(probeData.format.duration);
		});
	});
}


/**
 * Writes music meta data and cover to the given file
 * Also sets disc:1 to join all mp3 files into one copilation
 * @param {String} file 
 * @param {String} compilationName 
 * @param {String} cover 
 */
function writeMusicMetadata(file, compilationName, cover) {
	return new Promise((resolve, reject) => {

		let isodate = new Date();
		let data = {
			artist: compilationName,
			genre: "speech",
			disc: 1,
			album: compilationName,
			date: isodate
		};

		let attachments = options.cover ? {
			attachments: [cover]
		} : {};

		ffmetadata.write(file, data, attachments, function (err) {
			if (err) reject(err);
			resolve();
		});
	});
}

/**
 * Promise wrap for deleting a file
 * @param {*} file 
 */
function deleteFile(file) {
	return new Promise((resolve, reject) => {
		fs.unlink(file, function (error) {
			if (error) {
				reject(error);
			}
			resolve();
		});
	});
}



/**
 * Downloads youtube video and saves it as mp4
 * @param {String} url of the youtube video
 * @param {String} dir where the video should be placed
 */
async function downloadVideo(url, dir) {
	return new Promise((resolve, reject) => {
		ytdl(url)
			.pipe(fs.createWriteStream(dir)).on("finish", () => {
				resolve(dir);
			});
	});
}


/**
 * Gets the title of a video
 * @param {} url 
 */
async function getVideoTitle(url) {
	return new Promise((resolve, reject) => {
		ytdl.getInfo(url, (err, info) => {
			if (err) throw reject(err);
			resolve(info.title);
		})
	});
}


module.exports.download = download;
