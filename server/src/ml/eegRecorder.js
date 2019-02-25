const Cyton = require('openbci-cyton')
const k = require('openbci-utilities').constants
const fs = require('fs')
const SteeringModel = require('./steeringModel')

const debug = false
const verbose = true

const cytonBoard = new Cyton({
  boardType: 'daisy',
  debug: debug,
  hardSet: true,
  verbose: verbose
})
const steeringModel = new SteeringModel()

process.on('message', message => {
  console.log(`Message from host: ${message}`)
  const directionIdx = steeringModel.DIRECTION_CLASSES.indexOf(message)

  if (directionIdx > -1) {
    capture(directionIdx)
  } else {
    cytonBoard.disconnect()
  }
})

const capture = (directionIdx, logChannelData = false) => {
  cytonBoard.on('error', err => {
    console.log(err)
  })

  cytonBoard.autoFindOpenBCIBoard().then(portName => {
    if (portName) {
      /**
       * Connect to the board with portName
       * Only works if one board is plugged in
       * i.e. cytonBoard.connect(portName).....
       */
      cytonBoard
        .connect(portName) // Port name is a serial port name, see `.listPorts()`
        .then(() => {
          cytonBoard.streamStart()

          cytonBoard.on('sample', sample => {
            /** Work with sample */

            if (sample.valid) {
              let csv = directionIdx

              sample.channelData.map(cd => {
                csv += ',' + cd.toFixed(8)
              })

              csv += '\n'

              fs.appendFile(`${__dirname}/data/training.csv`, csv, function(
                err
              ) {
                if (err) throw err
              })
            }

            if (logChannelData) {
              for (let i = 0; i < cytonBoard.numberOfChannels(); i++) {
                console.log(
                  `Channel ${i + 1}: ${sample.channelData[i].toFixed(8)} Volts.`
                )
              }
            }
          })
        })
    } else {
      /** Unable to auto find OpenBCI board */
      console.log('Unable to auto find OpenBCI board')
    }
  })
}
