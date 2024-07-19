const tools = require('./tools')

const database_file = './db/gig_playlists.db'
const db = tools.getSqlLiteDB(database_file)
const logger = tools.getLogger('remove_tracks')

async function remove_old_tracks () {
  var spotifyApi = await tools.getSpotifyAPI()
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
    logger.debug('The access token has been refreshed!')
    spotifyApi = await tools.refreshSpotifyToken(spotifyApi)
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
