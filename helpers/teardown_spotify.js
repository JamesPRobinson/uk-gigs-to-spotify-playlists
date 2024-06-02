
require("dotenv").config();
const path = require('path'); 
const SpotifyWebApi = require('spotify-web-api-node');
const sqlite3 = require('sqlite3');
const tools = require('../tools');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.json(), 
    winston.format.timestamp() 
  ),
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'teardown_error.log', level: 'error', maxFiles: 1, maxsize:100000 }),
    new winston.transports.File({ filename: 'teardown_combined.log', maxFiles: 1, maxsize:100000 }),
  ],
});

const database_file = path.parse(__dirname).dir + "/db/gig_playlists.db";

var db = new sqlite3.Database(database_file, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE,  (err) => {
    if (err) {
        console.log("Getting error " + err);
    }});


var client_id = process.env.SPOTIFY_CLIENT_ID;
var client_secret = process.env.SPOTIFY_CLIENT_SECRET;

var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret
})

spotifyApi.setRefreshToken(process.env.REFRESH_TOKEN);

async function refresh_token()
{
  await spotifyApi.refreshAccessToken().then(
    function(data) {
        logger.debug('The access token has been refreshed!');

        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
        logger.error('Could not refresh access token', err);
    }
  )
  return spotifyApi;
}

const today = new Date();
async function teardown() {
  const month_city_playlists =  await new Promise((resolve,reject)=>{
    db.all("select * from uk_city_playlist",[],(err,rows)=>{
             if(err)reject(err)
              resolve(rows)
    })
  });
  spotifyApi = await refresh_token();
  for(const month_city of month_city_playlists)
  {
    logger.info(`Deleting tracks in ${month_city.name} in ${month_city.month}`);
    for (let f= 0; f < 11; f++)
    {
      await spotifyApi.getPlaylist(month_city.playlist_id)
      .then(async function(data) {
        var tracks = data.body.tracks?.items ?? [];
        if (tracks.length > 0)
        {
          await tools.sleep(1000);
          var uris = tracks.map(x => {return {"uri": x.track.uri }});
          
          await spotifyApi.removeTracksFromPlaylist(month_city.playlist_id, uris).then()
                .catch(err =>{
                  logger.error('Something went wrong!', err);
                  logger.error(tracks);
                });
          await tools.sleep(1000);
        }
      }, function(err) {
        logger.error('Something went wrong!', err);
      });
    }
    spotifyApi.unfollowPlaylist(month_city.playlist_id)
      .then(function(data) {
        logger.info('Playlist successfully unfollowed!');
      }, function(err) {
        logger.error('Something went wrong!', err);
      });
      await tools.sleep(3000);
  }
}
teardown();