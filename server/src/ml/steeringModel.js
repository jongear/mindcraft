const tf = require('@tensorflow/tfjs-node')
const fs = require('fs')
const parse = require('csv-parse')

class SteeringModel {
  constructor() {
    this.numDirections = 5
    this.numChannels = 16
    this.DIRECTION_CLASSES = ['neutral', 'left', 'right', 'forward', 'backward']
  }

  csvTransform(row) {
    const values = [
      parseFloat(row.channel_1),
      parseFloat(row.channel_2),
      parseFloat(row.channel_3),
      parseFloat(row.channel_4),
      parseFloat(row.channel_5),
      parseFloat(row.channel_6),
      parseFloat(row.channel_7),
      parseFloat(row.channel_8),
      parseFloat(row.channel_9),
      parseFloat(row.channel_10),
      parseFloat(row.channel_11),
      parseFloat(row.channel_12),
      parseFloat(row.channel_13),
      parseFloat(row.channel_14),
      parseFloat(row.channel_15),
      parseFloat(row.channel_16),
      parseInt(row.direction)
    ]

    return values
  }

  createModel() {
    const model = tf.sequential()
    model.add(
      tf.layers.dense({
        units: 1,
        activation: 'sigmoid',
        inputShape: [this.numChannels]
      })
    )
    model.add(tf.layers.dense({ units: 175 }))
    model.add(tf.layers.dense({ units: 150 }))
    model.add(tf.layers.dense({ units: 350 }))
    model.add(
      tf.layers.dense({ units: this.numDirections, activation: 'softmax' })
    )

    const optimizer = tf.train.adam()
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    })

    // model.compile({
    //   optimizer: tf.train.adam(),
    //   loss: "sparseCategoricalCrossentropy",
    //   metrics: ["accuracy"]
    // });

    return model
  }

  async evaluate(useTestData = false) {
    const model = this.createModel()

    const readFile = filePath => {
      return new Promise((resolve, reject) => {
        const output = []
        const parser = parse({
          delimiter: ',',
          columns: true,
          skip_empty_lines: true
        })
        // Use the readable stream api
        parser.on('readable', () => {
          let record
          while ((record = parser.read())) {
            output.push(this.csvTransform(record))
          }
        })
        // Catch any error
        parser.on('error', err => {
          console.error(err.message)

          reject(err)
        })
        // When we are done, test that the parsed output matched what expected
        parser.on('end', () => {
          resolve(output)
        })
        fs.createReadStream(filePath).pipe(parser)
      })
    }

    const raw = await readFile(`${__dirname}/data/training.csv`)

    const shuffled = raw.slice()
    tf.util.shuffle(shuffled)

    const numTestExamples = Math.round(raw.length * 0.1)
    const numTrainExamples = raw.length - numTestExamples
    const train = shuffled.slice(0, numTrainExamples)
    const test = shuffled.slice(numTrainExamples)

    function flatOneHot(idx) {
      // TODO(bileschi): Remove 'Array.from' from here once tf.data supports typed
      // arrays https://github.com/tensorflow/tfjs/issues/1041
      // TODO(bileschi): Remove '.dataSync()' from here once tf.data supports
      // datasets built from tensors.
      // https://github.com/tensorflow/tfjs/issues/1046
      return Array.from(tf.oneHot([idx], 5).dataSync())
    }

    const trainX = tf.data.array(train.map(r => r.slice(0, 16)))
    const testX = tf.data.array(test.map(r => r.slice(0, 16)))
    // TODO(we should be able to just directly use tensors built from oneHot here
    // instead of converting to tensor and back using datasync & Array.from.
    // This causes an internal disposal error however.
    // See https://github.com/tensorflow/tfjs/issues/1071
    //
    // const trainY = tf.data.array(train.map(r => tf.oneHot([r[4]], 3)));
    // const testY = tf.data.array(test.map(r => tf.oneHot([r[4]], 3)));
    const trainY = tf.data.array(train.map(r => flatOneHot(r[16])))
    const testY = tf.data.array(test.map(r => flatOneHot(r[16])))
    // Recombine the X and y portions of the data.
    let trainDataset = tf.data.zip([trainX, trainY])
    let testDataset = tf.data.zip([testX, testY])

    trainDataset = trainDataset.batch(32)
    testDataset = testDataset.batch(32)
    model.summary()
    await model.fitDataset(trainDataset, {
      epochs: 20,
      validationData: testDataset,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          console.log(`Epoch: ${epoch} - loss: ${logs.loss.toFixed(3)}`)
          console.log(logs)
        }
      }
    })

    return model
  }
}

module.exports = SteeringModel
