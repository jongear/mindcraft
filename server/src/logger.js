const colors = require('colors')

const log = function(msg) {
  console.log(colors.bold.green('[mini-drone]', msg))
}

module.exports = log
