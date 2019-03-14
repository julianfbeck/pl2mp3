
# pl2mp3  [![npm version](https://badge.fury.io/js/pl2mp3 .svg)](https://badge.fury.io/js/pl2mp3 )
<p >
  <img width="700" src="https://rawcdn.githack.com/jufabeck2202/cliconcat/c0d161db214b84e279c5dc29acecaf7f64337150/cliconcat.svg">
</p>

>  Watch Youtube Playlists and automatically download and convert Videos to mp3

**pl2mp3** watches YouTube Playlists to automatically download newly added videos and convert them to mp3. Ideal for music or podcast playlists. 

Install **pl2mp3** globally

```shell
npm install -g pl2mp3
```
## Usage
```shell
   Easily join media files in the CLI

  Usage
    $ cliconcat <input> <output file>
 
  Options
    -f, --folder join all audio in folder alphabetically
    -o, --output name of the output file
 
  Examples
    $ cliconcat 1.mp3 2.mp3 3.mp3 -o /path/to/output.mp3
    $ cliconcat -f /audiofolder -o /path/to/output.mp3 
```
## Usage: 
### Specify each file:
```shell
    $ cliconcat 1.mp3 2.mp3 3.mp3 -o /path/to/output.mp3
```
### Concat a folder of media Files:
```shell
    $ cliconcat -f /audiobook -o /path/to/output.mp3 
```
### Options:
**-f, --folder:** folder with audio files, cliconcat will concat all files alphabetically

**-o, --output :** Path and name of the Joined media file

## License

MIT © [Julian Beck](https://github.com/jufabeck2202)