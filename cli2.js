const init = require("./init")
const ytpl = require('ytpl');

init("test")

ytpl('UU_aEa8K-EOJ3D6gOs7HcyNg',{limit:1}, function(err, playlist) {
  if(err) throw err;
  console.log(playlist);
});