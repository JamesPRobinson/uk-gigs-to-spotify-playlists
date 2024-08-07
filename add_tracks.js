const ents = require('./ents/listings')
const tools = require('./tools')

const database_file = './db/gig_playlists.db'
const db = tools.getSqlLiteDB(database_file)
const logger = tools.getLogger('add_tracks')


async function get_gigs_ents24 () {
  const axios_client = await tools.createEntsClient();
  const today = new Date()
  var month_city_playlists = await new Promise((resolve, reject) => {
    db.all('select * from uk_city_playlist', [], (err, rows) => {
      if (err) reject(err)
      resolve(rows)
    })
  });
  for (const month_city of month_city_playlists) {
    var postcode = month_city.postcode
    var month_index = tools.getMonthNumber(month_city.month)

    // iterate through months Jan-Dec of given Location
    // If date is in past, find tracks for same date next year
    var days
    var day_in_month = new Date(today.getUTCFullYear(), month_index, 1) // start from 1st
    if (month_index === today.getUTCMonth()) {
      days = tools.getDaysInMonth(
        today.getDate(),
        month_index,
        day_in_month.getUTCFullYear()
      )
    } else if (day_in_month < today) {
      // if date in past get next year
      days = tools.getDaysInMonth(
        0,
        month_index,
        day_in_month.getUTCFullYear() + 1
      )
    } // date in question is in future
    else {
      days = tools.getDaysInMonth(0, month_index, day_in_month.getUTCFullYear())
    }
    for (const day of days) {
      logger.info(`Processing gigs from ents on ${day} in ${postcode}.`)
      var gigs = await ents.getListings(axios_client, day, postcode);
      console.log(gigs);
      if (gigs?.length > 0) {
        let gig_date = tools.formatDate(today)
        // each day has its own metadata. crush into one to get all artist names that appear in that month's playlist.
        //await gigs_to_spotify_track(gigs, month_city, gig_date)
      }
    }
  }
}

async function gigs_to_spotify_track (gigs, month_city, gig_date) {
  var spotifyApi = await tools.getSpotifyAPI()
  spotifyApi = await tools.refreshSpotifyToken(spotifyApi)
  // don't want same artist showing up multiple times in one playlist.
  var song_uris = []
  for (const gig of gigs) {
    if (!gig.title) {
      var artist_name = gig.headline
      var songs = await spotifyApi.searchTracks(`artist:${gig.headline}`).then(
        function (data) {
          if (data.body.tracks.items) {
            return data.body.tracks.items
          }
        },
        function (err) {
          logger.error(`error getting tracks for ${gig.headline}`, err);
        }
      )
      var top_song = false
      let index_song = 0
      if (songs?.length > 0) {
        outerLoopSongs: while (index_song < songs.length) {
          var artists = songs[index_song]?.artists ?? []
          for (const artist of artists) {
            // eliminate possibility of tribute acts, misnomers etc
            if (artist.name == artist_name) {
              top_song = songs[index_song]
              break outerLoopSongs
            }
          }
          index_song += 1
        }
        if (top_song) {
          try {
            await new Promise((resolve, reject) => {
              db.all(
                'insert into event_track(uk_city_playlist_id, artist_name, date_collected, end_date, genre, start_date, track_name, track_uri, web_link, venue_name) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                  month_city.uk_city_playlist_id,
                  artist_name,
                  gig_date,
                  gig.endDate,
                  gig.genre.join('_'),
                  gig.startDate,
                  top_song.name,
                  top_song.uri,
                  gig.webLink,
                  gig.venue.name
                ],
                (err, rows) => {
                  if (err) reject(err)
                  resolve(rows)
                }
              )
            })
            song_uris.push(top_song.uri)
            await tools.sleep(1000)
          } catch (error) {
            if (error.errno != 19 && error.code != 'SQLITE_CONSTRAINT') {
              throw new Error(
                `unexpected error, expecting insert fail on constraint, received instead ${error}`
              )
            }
          }
        }
      }
    }
  }
  await tools.sleep(1000)
  if (song_uris.length > 0) {
    spotifyApi.addTracksToPlaylist(month_city.playlist_id, song_uris).then(
      function (data) {},
      function (err) {
        logger.error('Something went wrong!', err)
      }
    )
  }
}
get_gigs_ents24();
