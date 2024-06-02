const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3')

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

async function write_playlists () {
  var markdown = ''
  const month_city_playlists = await new Promise((resolve, reject) => {
    db.all('select * from uk_city_playlist', [], (err, rows) => {
      if (err) reject(err)
      resolve(rows)
    })
  })
  for (const month_city of month_city_playlists) {
    console.info(`${month_city.name} in ${month_city.month}`)
    var link = `[${month_city.name}- ${month_city.month}](https://open.spotify.com/playlist/${month_city.playlist_id})\n\n`
    markdown += link
  }
  fs.writeFile('playlist_links.md', markdown, err => {
    if (err) {
      console.error(err)
    } else {
      // file written successfully
    }
  })
}
write_playlists()
