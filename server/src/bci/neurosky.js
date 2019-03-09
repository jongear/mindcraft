const log = require('../logger')
const thinkgear = require('node-thinkgear-sockets')

let droneFlying = false
let drone = null
class Neurosky {
  constructor(inputDrone) {
    drone = inputDrone
    droneFlying = false
  }

  connect() {
    this.client = thinkgear.createClient()

    console.log(this.client)
    this.client.on('data', function(data) {
      log(data)

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
        if (droneFlying) {
          drone.land().then(function() {
            droneFlying = false
            log('did land!')
          })
        } else {
          drone.takeoff().then(function() {
            droneFlying = true
            log('did take off!')
          })
        }
      }
    })
    this.client.connect()
  }

  disconnect() {
    this.client = null
  }
}

module.exports = Neurosky
