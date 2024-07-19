const path = require('path')
const tools = require('../tools')
const areas = require('../db/areas.json')
const database_file = path.parse(__dirname).dir + '/db/gig_playlists.db'
const db = tools.getSqlLiteDB(database_file)

db.exec(`drop table if exists uk_city_playlist`)
db.exec(`
    create table if not exists uk_city_playlist (
        uk_city_playlist_id integer primary key,
        month text not null,
        name text not null,
        playlist_id text, 
        postcode text not null,
        constraint unique_name_month_postcode unique (month, name, postcode)
        )
`)
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]
async function create_playlist_tables () {
  var spotifyApi = await tools.getSpotifyAPI()
  spotifyApi = await tools.refreshSpotifyToken(spotifyApi)
  for (const area of areas) {
    for (const month of months) {
      var playlist_name = `${area.name}-${month}`
      var playlist_id = await spotifyApi
        .createPlaylist(playlist_name, {
          description: `Music from the ${month} gigs in ${area.name}.`,
          public: true
        })
        .then(
          function (data) {
            return data.body.id
          },
          function (err) {
            console.log('Something went wrong!', err)
          }
        )
      db.run(
        `INSERT INTO uk_city_playlist(month, name, playlist_id, postcode) VALUES(?, ?, ?, ?)`,
        [month, area.name, playlist_id, area.postcode],
        err => {
          if (err) {
            return console.log(err.message)
          }
        }
      )
      await tools.sleep(3000)
    }
  }
  db.close()
}
create_playlist_tables();
