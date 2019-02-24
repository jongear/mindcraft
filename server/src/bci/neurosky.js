const log = require('../logger')
const thinkgear = require('node-thinkgear-sockets')

class Neurosky {
  constructor(drone) {
    this.client = thinkgear.createClient()
    this.client.on('data', function(data) {
      //log(data)

      const meditation = data.eSense.meditation
      if (meditation > 50) {
        log(`meditation: ${meditation}`)

        if (meditation < 75) {
          drone
            .turn({ direction: 'right', speed: 80, steps: 10 })
            .then(function() {
              log('moved right!')
            })
        } else {
          drone
            .turn({ direction: 'left', speed: 80, steps: 10 })
            .then(function() {
              log('moved left!')
            })
        }
      }

      const attention = data.eSense.attention
      if (attention > 50) {
        log(`attention: ${attention}`)
      }
    })

    this.client.on('blink_data', function(data) {
      console.log(data)

      if (data.blinkStrength > 200) {
        drone.takeoff().then(function() {
          log('did take off!')
        })
      }
    })
  }

  conenct() {
    this.client.connect()
  }
}

module.exports = Neurosky
