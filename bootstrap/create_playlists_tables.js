const path = require('path')
const sqlite3 = require('sqlite3')
const SpotifyWebApi = require('spotify-web-api-node')
const tools = require('../tools')
require('dotenv').config()

const areas = require('../db/areas.json')

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
      console.log('The access token has been refreshed!')

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token'])
    },
    function (err) {
      console.log('Could not refresh access token', err)
    }
  )
  return spotifyApi
}

const database_file = path.parse(__dirname).dir + '/db/gig_playlists.db'

var db = new sqlite3.Database(
  database_file,
  sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE,
  err => {
    if (err) {
      console.log('Getting error ' + err)
    }
  }
)

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
  spotifyApi = await refresh_token()
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

create_playlist_tables()
