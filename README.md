
# pl2mp3  [![npm version](https://badge.fury.io/js/pl2mp3 .svg)](https://badge.fury.io/js/pl2mp3 )

>  Watches YouTube Playlists and automatically download and convert videos to mp3

**pl2mp3** will watch multiple YT playlists to download newly added videos and convert them to MP3. Ideal for music or podcast playlists.

Install **pl2mp3**:

```shell
npm install -g pl2mp3
```
## Usage:
```shell
Usage
  $ pl2mp3 <Download Directory>

Options
  --init, -i  create a new download Directory
  --update <mins>, -u <min>   check for playlist updates every <min> mins. Default 10min
  --reset, -r resets database, removes downloaded videos

Examples
  $ pl2mp3 --init <Download Directory> // to create a new download Directory
  $ pl2mp3 <Download Directory> // to start watching for new videos
  $ pl2mp3 --update 20 <Download Directory> // to watch every 20min for changes.
```
## Setup:
### Setup Download folder:
* In order to use **pl2mp3** you first have to create a download Directory. This Directory will be used by pl2mp3 to download and convert new videos. Run following command to create a new download Directory

```shell
pl2mp3 --init <Directory name>
```
* This will create a new directory with a *db.json* file and a *config.json* file.
### Setup config.json:
* After runing the --init command, **pl2mp3** created a *config.json* file. The *config.json* file is used to specify the playlists you want to download and other options.
* When adding new playlists to the config.json, make sure that the Youtube playlists are **public**.
#### Sample config:
* Following config will download and watch two Playlists.
```json
{
  "playlists": [
      {
          "link": "https://www.youtube.com/playlist?list=PLfpHPxe91z9NEwLMsxfmAehlZnoTzRFB8"
      },
      {
          "link": "https://www.youtube.com/playlist?list=PLfpHPxe91z9OsVABLuXljh78LwiP8ToXq"
      }
  ]
}
```
#### Split option:
* You can add the following option to split mp3s into smaller clips
```json
{
  "playlists": [
      {
          "link": "https://www.youtube.com/playlist?list=PLfpHPxe91z9NEwLMsxfmAehlZnoTzRFB8",
          "split":true,
          "split-duration":"03:00"
      }
  ]
}
```
*This will split every mp3 file into 3 min clips, with proper names.

### Start pl2mp3
* After creating a Download Directory and customizing the config.json you can start **pl2mp3**. Run following command to start watching:
```shell
pl2mp3 <Directory name>
```
* **pl2mp3** will create a seperate folder for each playlist and will start downloading and converting all videos inside the playlists. 
* After that **pl2mp3** will look every 10 min for newly added videos to download them too. You can change the time by using the `--update <min>` flag.

## About
ICS © [Julian Beck](https://github.com/jufabeck2202)