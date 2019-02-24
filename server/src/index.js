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
    fs.writeFile(`${__dirname}/ml/data/training.csv`, '', function(err) {
      if (err) throw err
    })
  })

  socket.on('use-neurosky', () => {
    neurosky.conenct()
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
