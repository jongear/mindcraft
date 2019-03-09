const Drone = require('./drone')
const log = require('./logger')
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { fork } = require('child_process')
const fs = require('fs')
const Neurosky = require('./bci/neurosky')
const SteeringModel = require('./ml/steeringModel')
const tf = require('@tensorflow/tfjs-node')

const port = 3005
server.listen(port)

log(`listening on port ${port}`)

app.get('/', (req, res) => {
  res.json({ status: 'listening' })
})

const drone = new Drone({ logger: log })
const neurosky = new Neurosky(drone)
let tfModel = null
let eegRecorder = null

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
    eegRecorder = fork('src/ml/eegRecorder')
    eegRecorder.send(direction)

    setTimeout(() => {
      eegRecorder.send('end')
    }, 10000)
  })

  socket.on('train-model', () => {
    const steeringModel = new SteeringModel()
    steeringModel.evaluate().then(model => {
      tfModel = model
      socket.emit('train-model-complete')
    })
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

  socket.on('enable-ultracortex', () => {
    eegRecorder = fork('src/ml/eegRecorder')
    eegRecorder.send('live')

    eegRecorder.on('message', msg => {
      let directions = [0, 0, 0, 0, 0]
      msg.map(m => {
        const tensor = tf.tensor(m, [1, 16])
        const result = tfModel.predict(tensor)
        const resOut = result.dataSync()

        directions[0] += resOut[0]
        directions[1] += resOut[1]
        directions[2] += resOut[2]
        directions[3] += resOut[3]
        directions[4] += resOut[4]
      })

      directions = directions.map(d => d / 100)
      const neutral = directions[0]
      const right = directions[1]
      const left = directions[2]
      const forward = directions[3]
      const backward = directions[4]

      console.log('*****PREDICTION*****')
      console.log(`Neutral: ${neutral}`)
      console.log(`Right: ${right}`)
      console.log(`Left: ${left}`)
      console.log(`Forward: ${forward}`)
      console.log(`Backward: ${backward}`)

      if (neutral >= 0.38) {
      } else if (right >= 0.38) {
        drone.turn({ direction: 'right', speed: 100 }).then(function() {
          log('done rotating', 'right')
        })
      } else if (left >= 0.38) {
        drone.turn({ direction: 'left', speed: 100 }).then(function() {
          log('done rotating', 'left')
        })
      }
    })
  })

  socket.on('disable-ultracortex', () => {
    eegRecorder.send('end')
  })

  socket.on('enable-neurosky', () => {
    neurosky.connect()
  })

  socket.on('disable-neurosky', () => {
    neurosky.disconnect()
  })
})
