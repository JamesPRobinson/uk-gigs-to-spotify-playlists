const tools = require('../tools.js')
const logger = tools.getLogger('ents')

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
      // back-off and go to next
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
