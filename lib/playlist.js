const ytpl = require('ytpl');

async function getPlaylistInformation(url,limit){
    return await getPlaylist(url,limit);
}   
module.exports.getPlaylistInformation = getPlaylistInformation


function getPlaylist(url,limit) {
    return new Promise((resolve, reject) => {
        ytpl(url,{limit:limit}, function(err, playlist) {
            if(err) throw reject(err);
            resolve(playlist)
          });
    });
}