const path = require('path')
const tools = require('../tools')

const logger = tools.getLogger('teardown')
const database_file = path.parse(__dirname).dir + '/db/gig_playlists.db'
const db = tools.getSqlLiteDB(database_file)

async function teardown_playlists () {
  var spotifyApi = await tools.getSpotifyAPI()
  const month_city_playlists = await new Promise((resolve, reject) => {
    db.all('select * from uk_city_playlist', [], (err, rows) => {
      if (err) reject(err)
      resolve(rows)
    })
  })
  spotifyApi = await tools.refreshSpotifyToken(spotifyApi)
  for (const month_city of month_city_playlists) {
    logger.info(`Deleting tracks in ${month_city.name} in ${month_city.month}`)
    for (let f = 0; f < 11; f++) {
      await spotifyApi.getPlaylist(month_city.playlist_id).then(
        async function (data) {
          var tracks = data.body.tracks?.items ?? []
          if (tracks.length > 0) {
            await tools.sleep(1000)
            var uris = tracks.map(x => {
              return { uri: x.track.uri }
            })

            await spotifyApi
              .removeTracksFromPlaylist(month_city.playlist_id, uris)
              .then()
              .catch(err => {
                logger.error('Something went wrong!', err)
                logger.error(tracks)
              })
            await tools.sleep(1000)
          }
        },
        function (err) {
          logger.error('Something went wrong!', err)
        }
      )
    }
    spotifyApi.unfollowPlaylist(month_city.playlist_id).then(
      function (data) {
        logger.info('Playlist successfully unfollowed!')
      },
      function (err) {
        logger.error('Something went wrong!', err)
      }
    )
    await tools.sleep(3000)
  }
}
teardown_playlists();
