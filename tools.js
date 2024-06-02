module.exports = {
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

  shuffleArray: function (unshuffled) {
    return unshuffled
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  },

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

  sortArrayByDate: function (array) {
    return array.sort(function (a, b) {
      a = a.startDate.split('/').reverse().join('')
      b = b.startDate.split('/').reverse().join('')
      return a > b ? 1 : a < b ? -1 : 0
    })
  },

  sleep: function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
