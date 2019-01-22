const minidrone = require('minidrone')
const log = require('./logger')

const drone = new minidrone.Drone({
  logger: log
})

log('connecting...')
drone.connect(function() {
  log('setup...')
  drone.setup(function() {
    drone.flatTrim()
    drone.startPing()
    drone.flatTrim()

    log(`Connected to drone ${drone.name}`)
    log('listening...')
  })
})

class Drone {
  constructor() {}

  async takeoff() {
    return new Promise(function(resolve, reject) {
      drone.takeOff(function() {
        log('hovering!')
        resolve()
      })
    })
    drone.flatTrim()
  }

  async land() {
    return new Promise(function(resolve, reject) {
      drone.land(function() {
        log('landed!')
        resolve()
      })
      drone.flatTrim()
    })
  }

  /**
   * Move drone
   * @param {Object}
   * @return {Promise}
   */
  async move({ direction = 'up', speed = 60, steps = 2 }) {
    log(`move...${direction}`)

    return new Promise(function(resolve, reject) {
      // Direction should be: `up`, `down`, `left`, or `right`
      drone[direction]({ speed, steps }, function() {
        log(direction)
        resolve()
      })
    })
  }

  /**
   * Turn left or right
   * @return {Promise}
   */
  async turn({ direction = 'right', speed = 60, steps = 2 }) {
    log(`turn...${direction}`)

    return new Promise(function(resolve, reject) {
      // Turning right or left?
      let methodName = direction === 'right' ? 'turnRight' : 'turnLeft'

      drone[methodName]({ speed, steps }, function() {
        log(`turned ${direction}!`)
        resolve()
      })
    })
  }

  /**
   * Causes the drone to shut off the motors "instantly"
   * Sometimes has to wait for other commands ahead of it to
   * complete... not fully safe yet
   *
   * @return {Promise}
   */
  async emergency() {
    log('emergency...')

    return new Promise(function(resolve, reject) {
      drone.emergency(function() {
        log('emergency!')
        resolve()
      })
    })
  }
}

module.exports = Drone
