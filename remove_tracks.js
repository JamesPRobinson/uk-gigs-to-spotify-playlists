const fs = require('fs')
require('dotenv').config()
const sqlite3 = require('sqlite3')
const SpotifyWebApi = require('spotify-web-api-node')
const tools = require('./tools')
const winston = require('winston')

const database_file = './db/gig_playlists.db' // path.parse(__dirname).name + ;
var db = new sqlite3.Database(
  database_file,
  sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE,
  err => {
    if (err) {
      logger.error('Getting error ' + err)
    }
  }
)

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(
      info =>
        `${info.timestamp} ${info.level}: ${info.message}` +
        (info.splat !== undefined ? `${info.splat}` : ' ')
    )
  ),
  transports: [
    //
    // - Write all logs to `combined.log`
    //
    new winston.transports.File({
      filename: 'remove_tracks.log',
      maxFiles: 1,
      maxsize: 10000
    })
  ]
})
var client_id = process.env.SPOTIFY_CLIENT_ID
var client_secret = process.env.SPOTIFY_CLIENT_SECRET

var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret
})

spotifyApi.setRefreshToken(process.env.REFRESH_TOKEN)

async function refresh_token () {
  await spotifyApi.refreshAccessToken().then(
    function (data) {
      logger.debug('The access token has been refreshed!')

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token'])
    },
    function (err) {
      logger.error('Could not refresh access token')
      logger.error(err)
    }
  )
  return spotifyApi
}

async function remove_old_tracks () {
  var today = tools.formatDate(new Date())
  var month_city_playlists = await new Promise((resolve, reject) => {
    db.all('select * from uk_city_playlist', [], (err, rows) => {
      if (err) {
        logger.error(err)
        reject(err)
      }
      resolve(rows)
    })
  })
  for (const month_city of month_city_playlists) {
    spotifyApi = await refresh_token()
    var playlist_id = month_city.playlist_id
    var playlist_index = month_city.uk_city_playlist_id
    logger.info(`removing tracks in ${month_city.name} in ${month_city.month}`)
    var tracks_to_delete = await new Promise((resolve, reject) => {
      db.all(
        'select * from event_track where date(end_date) < ? and uk_city_playlist_id=?',
        [today, playlist_index],
        (err, rows) => {
          if (err) {
            logger.error(err)
            reject(err)
          }
          resolve(rows)
        }
      )
    })
    logger.info(`${tracks_to_delete.length} to delete`)
    if (tracks_to_delete.length > 0) {
      var sublists_to_delete = tools.chunkHundred(tracks_to_delete)
      // constraint max 100 items
      for (const sublist_to_delete of sublists_to_delete) {
        var date_tracks = sublist_to_delete.map(track => {
          return { uri: track.track_uri }
        })

        await spotifyApi
          .removeTracksFromPlaylist(playlist_id, date_tracks)
          .then()
          .catch(err => {
            logger.error(err)
            return -1
          })
      }
      await new Promise((resolve, reject) => {
        db.all(
          'delete from event_track where date(date_collected) < ? and uk_city_playlist_id=?',
          [today, playlist_id],
          (err, rows) => {
            if (err) {
              logger.error(err)
              reject(err)
            }
            resolve(rows)
          }
        )
      })
      logger.info(
        `Removed old tracks from ${month_city.name} ${month_city.month}`
      )
      await tools.sleep(1000)
    }
  }
}

remove_old_tracks()
