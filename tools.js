const axios = require('axios');
const config = require("./config.json");
const fs = require("fs");
const sqlite3 = require('sqlite3');
const SpotifyWebApi = require('spotify-web-api-node');
const winston = require('winston');

module.exports = {
  chunkHundred: function (list) {
    var lists = []
    var length = Math.ceil(list.length / 100)
    length = length > 0 ? length : 1
    let start = 0
    for (let i = 1; i < length + 1; i++) {
      lists.push(list.slice(start, 100 * i))
      start = start + 100
    }
    return lists
  },

  createEntsClient: async function () {
    var axios_client = axios.create({
      baseURL: 'https://api.ents24.com/',
      timeout: 10000,
      headers: {
        Authorization: config.ents.access_token
      }
    });
    try {
      await axios_client.get('/event/genres', {params: {parent_key: "music"}});
    } catch (err) {
      // bad request, refresh header
      if (
        err.response.status == 401 &&
        err.response.statusText == 'Unauthorized'
      ) {
        const form = new FormData();
        form.append('client_id', config.ents.client_id);
        form.append('client_secret', config.ents.client_secret);
        var resp = await axios_client.post('auth/token', form, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        const access_token = resp.data.access_token;
        // save new token
        config.ents.access_token = access_token;
        fs.writeFileSync('./config.json', JSON.stringify(config));
        axios_client = axios.create({
          baseURL: 'https://api.ents24.com/',
          timeout: 10000,
          headers: {
            Authorization: config.ents.access_token
          }
        });
      } else {
        throw err;
      }
    }
    return axios_client;
  },

  formatDate: function (date) {
    return (
      date.getFullYear() +
      '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + date.getDate()).slice(-2)
    )
  },

  formatDateasNum: function (date) {
    return Number(
      date.getFullYear().toString() +
        ('0' + (date.getMonth() + 1)).slice(-2).toString() +
        ('0' + date.getDate()).slice(-2).toString()
    )
  },

  getDaysInMonth: function (day, month, year) {
    var date = new Date(Date.UTC(year, month, 1))
    var days = []
    while (date.getUTCMonth() === month) {
      if (date.getUTCDate() >= day) {
        days.push(new Date(date))
      }
      date.setUTCDate(date.getUTCDate() + 1)
    }
    return days
  },

  getLogger: function (name, _level = 'info') {
    return winston.createLogger({
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
      level: _level,
      transports: [
        new winston.transports.File({
          filename: `${name}.log`,
          maxFiles: 1,
          maxsize: 10000
        })
      ]
    })
  },

  getMonthNumber: function (month) {
    var months = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11
    }
    return months[month]
  },

  getSpotifyAPI: async function () {
    const client_id = config.spotify.client_id;
    const client_secret = config.spotify.client_secret;
    var spotifyApi = new SpotifyWebApi({
      clientId: client_id,
      clientSecret: client_secret
    });
    spotifyApi.setRefreshToken(config.spotify.refresh_token);
    return spotifyApi
  },

  getSqlLiteDB: function (database_file_path) {
    return new sqlite3.Database(
      database_file_path,
      sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE,
      err => {
        if (err) {
          console.log('Getting error ' + err)
        }
      }
    )
  },

  refreshSpotifyToken: async function (spotifyApi) {
    await spotifyApi.refreshAccessToken().then(
      function (data) {
        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body['access_token'])
      }
    )
    return spotifyApi
  },

  shuffleArray: function (unshuffled) {
    return unshuffled
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  },

  sleep: function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  sortArrayByDate: function (array) {
    return array.sort(function (a, b) {
      a = a.startDate.split('/').reverse().join('')
      b = b.startDate.split('/').reverse().join('')
      return a > b ? 1 : a < b ? -1 : 0
    })
  }
}
