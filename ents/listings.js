const tools = require('../tools.js')
const winston = require('winston')

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
      filename: 'ents.log',
      maxFiles: 1,
      maxsize: 10000
    })
  ]
})

module.exports = {
  getListings: async function (client, day, postcode) {
    var gigs = []
    var gig_date = tools.formatDate(day)
    var response = await client
      .get('event/list', {
        params: {
          location: `postcode:${postcode}`,
          radius_distance: 30,
          distance_unit: 'mi',
          results_per_page: 100,
          //genre: genre,
          date_from: gig_date,
          date_to: gig_date
        }
      })
      .then(response => {
        return response
      })
      .catch(err => {
        logger.error(err)
      })
    await tools.sleep(500)
    if (response?.status != 200) {
      // back-off
      await tools.sleep(5000)
      return gigs
    }
    gigs = gigs.concat(response['data'])
    let collected_all_gigs = false

    while (!collected_all_gigs) {
      var next_page_code = response.headers['x-next-page']
      response = await client.get('event/list', {
        params: {
          location: `postcode:${postcode}`,
          radius_distance: 30,
          distance_unit: 'mi',
          results_per_page: 100,
          //genre: genre,
          date_from: gig_date,
          date_to: gig_date,
          page: next_page_code
        }
      })
      await tools.sleep(500)
      if (response.data.length) {
        gigs = gigs.concat(response['data'])
      } else {
        collected_all_gigs = true
        break
      }
    }
    return gigs
  }
}
