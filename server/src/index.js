const Drone = require('./drone')
const log = require('./logger')
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { fork } = require('child_process')
const fs = require('fs')
const Neurosky = require('./bci/neurosky')

const port = 3005
server.listen(port)

log(`listening on port ${port}`)

app.get('/', (req, res) => {
  res.json({ status: 'listening' })
})

const drone = new Drone({ logger: log })
const neurosky = new Neurosky(drone)

io.on('connection', socket => {
  socket.emit('news', { hello: 'world' })

  socket.on('takeoff', () => {
    console.log('attempting to takeoff')
    log('takeoff')

    drone.takeoff().then(function() {
      log('did take off!')
      socket.emit('didTakeoff')
    })
  })

  socket.on('land', () => {
    drone.land().then(function() {
      log('did land!')
      socket.emit('didLand')
    })
  })

  socket.on('move', moveOptions => {
    drone.move(moveOptions).then(function() {
      log('done moving', moveOptions.direction)
    })
  })

  socket.on('turn', turnOptions => {
    drone.turn(turnOptions).then(function() {
      log('done rotating', turnOptions.direction)
    })
  })

  socket.on('up', () => {
    drone.up().then(function() {
      log('moved up')
    })
  })

  socket.on('down', () => {
    drone.down().then(function() {
      log('moved down')
    })
  })

  socket.on('emergency', () => {
    drone.emergency().then(function() {
      log('emergency')
    })
  })

  socket.on('train-direction', direction => {
    const eegRecorder = fork('src/ml/eegRecorder')
    eegRecorder.send(direction)

    setTimeout(() => {
      eegRecorder.send('end')
    }, 15000)
  })

  socket.on('reset-training', () => {
    fs.writeFile(
      `${__dirname}/ml/data/training.csv`,
      'direction,channel_1,channel_2,channel_3,channel_4,channel_5,channel_6,channel_7,channel_8,channel_9,channel_10,channel_11,channel_12,channel_13,channel_14,channel_15,channel_16\n',
      function(err) {
        if (err) throw err
      }
    )
  })

  socket.on('enable-neurosky', () => {
    neurosky.connect()
  })

  socket.on('disable-neurosky', () => {
    neurosky.disconnect()
  })
})

// const thinkgear = require('node-thinkgear-sockets')
// const client = thinkgear.createClient()

// client.on('data', function(data) {
//   //log(data)

//   const meditation = data.eSense.meditation
//   if (meditation > 50) {
//     log(`meditation: ${meditation}`)

//     if (meditation < 75) {
//       drone.turn({ direction: 'right', speed: 80, steps: 10 }).then(function() {
//         log('moved right!')
//       })
//     } else {
//       drone.turn({ direction: 'left', speed: 80, steps: 10 }).then(function() {
//         log('moved left!')
//       })
//     }
//   }

//   const attention = data.eSense.attention
//   if (attention > 50) {
//     log(`attention: ${attention}`)
//   }
// })

// client.on('blink_data', function(data) {
//   console.log(data)

//   if (data.blinkStrength > 200) {
//     drone.takeoff().then(function() {
//       log('did take off!')
//     })
//   }
// })

// client.connect()
