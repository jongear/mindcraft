import React from 'react'
import { ProgressBar, Step } from 'react-step-progress-bar'
import 'react-step-progress-bar/styles.css'
import styled from 'styled-components'
import socket from './lib/socket'

const Title = styled.h1`
  font-size: 1.5rem;
  color: white;
`

const TrainingDisplay = styled.div`
  color: white;
  button {
    cursor: pointer;
    text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.05);
    border: 0;
    background: #49b65d;
    border: 4px solid transparent;
    color: white;
    font-size: 1rem;
    position: relative;
    &:active {
      top: 2px;
    }
    &:disabled {
      background: #7fcc8d;
      cursor: not-allowed;
    }
`

const TrainingRow = styled.div`
  width: 500px;
  padding-bottom: 40px;
  span {
    font-size: 1rem;
    font-weight: bold;
  }
`

export default class FlightControls extends React.Component {
  constructor() {
    super()

    this.state = {
      trainingResponse: '',
    }
    this.directions = ['neutral', 'right', 'left', 'forward', 'backward']
    this.directions.map(
      d =>
        (this.state[d] = {
          progress: 0,
          intervalId: null,
        })
    )
  }

  componentDidMount() {
    socket.on('connect', () => {
      console.log('connected!')

      socket.on('train-model-complete', data => {
        this.setState({ trainingResponse: 'Model training complete!' })
      })
    })
  }

  updateProgress(direction) {
    if (this.state[direction].progress < 100) {
      const newPercentage = this.state[direction].progress + 1

      this.setState(prevState => ({
        [direction]: {
          ...prevState[direction],
          progress: newPercentage,
        },
      }))
    } else {
      clearInterval(this.state[direction].intervalId)
      this.setState(prevState => ({
        [direction]: {
          ...prevState[direction],
          intervalId: null,
        },
      }))
    }
  }

  startTraining(direction) {
    return () => {
      this.setState(prevState => ({
        [direction]: {
          ...prevState[direction],
          progress: 0,
        },
      }))

      const intervalId = setInterval(() => {
        this.updateProgress(direction)
      }, 200)

      this.setState(prevState => ({
        [direction]: {
          ...prevState[direction],
          intervalId: intervalId,
        },
      }))

      this.sendCommand('train-direction', direction)
    }
  }

  startModelTraining() {
    return () => {
      this.setState({ trainingResponse: 'Training in progress...' })
      this.sendCommand('train-model')
    }
  }

  sendCommand(command, commandOptions = null) {
    console.log(
      `Sending the command ${command} ${JSON.stringify(commandOptions)}`
    )

    if (commandOptions) {
      socket.emit(command, commandOptions)
    } else {
      socket.emit(command, command)
    }
  }

  render() {
    return (
      <TrainingDisplay>
        <Title>Flight Training Center</Title>

        {this.directions.map(direction => (
          <TrainingRow>
            <span
              style={{ float: 'left', marginRight: '20px', width: '140px' }}
            >
              Train {direction}:
            </span>
            <span style={{ float: 'left', marginRight: '20px' }}>
              <ProgressBar
                percent={this.state[direction].progress}
                width={200}
                filledBackground="linear-gradient(to right, #b2f2ec, #40e0d0)"
              >
                <Step transition="scale">
                  {({ accomplished }) => (
                    <img
                      style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                      width="30"
                      src="https://vignette.wikia.nocookie.net/pkmnshuffle/images/9/9d/Pichu.png/revision/latest?cb=20170407222851"
                    />
                  )}
                </Step>
                <Step transition="scale">
                  {({ accomplished }) => (
                    <img
                      style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                      width="30"
                      src="https://vignette.wikia.nocookie.net/pkmnshuffle/images/9/97/Pikachu_%28Smiling%29.png/revision/latest?cb=20170410234508"
                    />
                  )}
                </Step>
                <Step transition="scale">
                  {({ accomplished }) => (
                    <img
                      style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                      width="30"
                      src="https://orig00.deviantart.net/493a/f/2017/095/5/4/raichu_icon_by_pokemonshuffle_icons-db4ryym.png"
                    />
                  )}
                </Step>
              </ProgressBar>
            </span>
            <button
              style={{ float: 'left', marginTop: '-10px' }}
              onClick={this.startTraining(direction)}
              disabled={this.state[direction].intervalId !== null}
            >
              Start
            </button>
          </TrainingRow>
        ))}

        <TrainingRow style={{ paddingTop: '50px' }}>
          <button onClick={this.startModelTraining()}>Train Model</button>
          <span>{this.state.trainingResponse}</span>
        </TrainingRow>
      </TrainingDisplay>
    )
  }
}
