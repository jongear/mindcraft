const Cyton = require("openbci-cyton");
const k = require("openbci-utilities").constants;

const debug = false;
const verbose = true;

let ourBoard = new Cyton({
  boardType: "daisy",
  debug: debug,
  hardSet: true,
  verbose: verbose
});

ourBoard.on("error", err => {
  console.log(err);
});

ourBoard.autoFindOpenBCIBoard().then(portName => {
  if (portName) {
    /**
     * Connect to the board with portName
     * Only works if one board is plugged in
     * i.e. ourBoard.connect(portName).....
     */
    ourBoard
      .connect(portName) // Port name is a serial port name, see `.listPorts()`
      .then(() => {
        ourBoard.streamStart();
        ourBoard.on("sample", sample => {
          /** Work with sample */
          for (let i = 0; i < ourBoard.numberOfChannels(); i++) {
            console.log(
              `Channel ${i + 1}: ${sample.channelData[i].toFixed(8)} Volts.`
            );

            const test = {
              channelData: [
                -0.01203109467400249,
                -0.034090433608345225,
                -0.015022026303056038,
                -0.18750002235174446,
                -0.18750002235174446,
                -0.18750002235174446,
                -0.06488038627867534,
                -0.012354658526737514,
                0.0051704725826349955,
                -0.028057898945557946,
                -0.04886822239973812,
                -0.0261121125354901,
                -0.05287964527364317,
                -0.18750002235174446,
                -0.18750002235174446,
                -0.01937929771891805
              ],
              sampleNumber: 5,
              auxData: {
                lower: { type: "Buffer", data: [0, 0, 0, 0, 0, 0] },
                upper: { type: "Buffer", data: [0, 0, 0, 0, 0, 0] }
              },
              stopByte: 192,
              timestamp: 1546728909524,
              _timestamps: { lower: 1546728909524, upper: 1546728909524 },
              accelData: [0, 0, 0],
              valid: true
            };

            // console.log(
            //   `Channel ${i + 1}: ${sample.channelDataCounts[i].toFixed(
            //     8
            //   )} Volts.`
            // );

            // prints to the console
            //  "Channel 1: 0.00001987 Volts."
            //  "Channel 2: 0.00002255 Volts."
            //  ...
            //  "Channel 16: -0.00001875 Volts."
          }
        });
      });
  } else {
    /** Unable to auto find OpenBCI board */
    console.log("Unable to auto find OpenBCI board");
  }
});

// const ourBoard = new Cyton({
//   // boardType: `daisy`,
//   // hardSet: true,
//   simulate: true
// });

// ourBoard
//   .connect(k.OBCISimulatorPortName) // This will set `simulate` to true
//   .then(boardSerial => {
//     console.log("test");
//     ourBoard.on("ready", () => {
//       /** Start streaming, reading registers, what ever your heart desires  */
//       console.log("hello");
//     });

//     ourBoard.on("sample", sample => {
//       /** Work with sample */
//       console.log("world");
//       for (let i = 0; i < ourBoard.numberOfChannels(); i++) {
//         console.log(
//           `Channel ${i + 1}: ${sample.channelDataCounts[i].toFixed(8)} Volts.`
//         );
//         // prints to the console
//         //  "Channel 1: 0.00001987 Volts."
//         //  "Channel 2: 0.00002255 Volts."
//         //  ...
//         //  "Channel 16: -0.00001875 Volts."
//       }
//     });
//   })
//   .catch(err => {
//     /** Handle connection errors */
//     console.log(err);
//   });
