import React from 'react'
import styled from 'styled-components'
import keys from './lib/keys'
import socket from './lib/socket'
import status from './lib/status'

const amount = 100
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.25fr 1fr;
  grid-template-rows: repeat(3, 1fr);
  border: 1px solid black;
  grid-gap: 3px;
  .center {
    display: grid;
    grid-gap: 3px;
  }
  button {
    cursor: pointer;
    text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.05);
    border: 0;
    background: #264653;
    border: 4px solid transparent;
    color: white;
    font-size: 1rem;
    position: relative;
    &:active {
      top: 2px;
    }
    &:hover {
      outline: 0;
      border-color: #ffc600;
    }
    &:focus {
      outline: 0;
      border-color: #ffc600;
    }
    &.takeoff {
      background: #63c2de;
    }
    &.land {
      background: #4dbd74;
    }
    &.emergency {
      background: #e76f51;
      text-transform: uppercase;
    }
    &.rotate {
      background: #fff;
      color: black;
    }
    &.height {
      background: #fff;
      color: black;
    }
    span.symbol {
      display: block;
      font-size: 2rem;
      font-weight: 400;
    }
  }
`

const Title = styled.h1`
  font-size: 1.5rem;
  color: white;
`

export default class FlightControls extends React.Component {
  constructor() {
    super()

    // state
    this.state = {
      status: 'landed',
    }

    this.onKeydown = this.onKeydown.bind(this)
  }

  componentDidMount() {
    socket.on('connect', () => {
      console.log('connected!')

      socket.on('hello', function(data) {
        console.log('hello', data)
      })

      socket.on('didTakeoff', () => {
        console.log('did take off!')
        this.changeStatus(status.FLYING)
      })

      socket.on('didLand', () => {
        console.log('did land!')
        this.changeStatus(status.LANDED)
      })
    })

    document.addEventListener('keydown', this.onKeydown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeydown)
  }

  changeStatus(status) {
    this.setState({
      status: status,
    })
  }

  onKeydown(e) {
    switch (e.which) {
      case keys.SPACE:
        if (this.state.status === 'landed') {
          this.sendCommand('takeoff')()
        } else {
          this.sendCommand('land')()
        }
        break

      case keys.ARROW_RIGHT:
        console.log('RIGHT')

        if (!e.shiftKey) {
          this.sendCommand('move', { directon: 'right' })()
        } else {
          this.sendCommand('turn', { directon: 'right' })()
        }

        break

      case keys.ARROW_LEFT:
        console.log('LEFT')

        if (!e.shiftKey) {
          this.sendCommand('move', { directon: 'left' })()
        } else {
          this.sendCommand('turn', { directon: 'left' })()
        }

        break

      case keys.ARROW_UP:
        console.log('UP')

        if (!e.shiftKey) {
          this.sendCommand('move', { directon: 'forward' })()
        } else {
          this.sendCommand('move', { directon: 'up' })()
        }

        break

      case keys.ARROW_DOWN:
        console.log('DOWN')

        if (!e.shiftKey) {
          this.sendCommand('move', { directon: 'backward' })()
        } else {
          this.sendCommand('move', { directon: 'down' })()
        }

        break
      default:
    }
  }

  sendCommand(command, commandOptions = null) {
    return () => {
      console.log(
        `Sending the command ${command} ${JSON.stringify(commandOptions)}`
      )

      if (commandOptions) {
        socket.emit(command, commandOptions)
      } else {
        socket.emit(command, command)
      }
    }
  }

  render() {
    return (
      <div>
        <Title>Flight Control Center</Title>
        <Grid>
          {/* <h2>
            Status:
            {this.state.status}
          </h2> */}
          <button className="rotate" onClick={this.sendCommand('ccw 90')}>
            <span className="symbol">⟲</span> left 90°
          </button>
          <button
            onClick={this.sendCommand('move', {
              direction: 'forward',
              speed: amount,
            })}
          >
            <span className="symbol">↑</span> forward {amount}cm
          </button>
          <button className="rotate" onClick={this.sendCommand('cw 90')}>
            <span className="symbol">⟳</span> right 90°
          </button>
          <button onClick={this.sendCommand('turn', { direction: 'left' })}>
            <span className="symbol">←</span> left {amount}cm
          </button>
          <div className="center">
            {this.state.status === status.LANDED ? (
              <button className="takeoff" onClick={this.sendCommand('takeoff')}>
                Take Off
              </button>
            ) : (
              <button className="land" onClick={this.sendCommand('land')}>
                Land {this.state.status}
              </button>
            )}
            <button
              className="emergency"
              onClick={this.sendCommand('emergency')}
            >
              emergency
            </button>
          </div>
          <button onClick={this.sendCommand('turn', { direction: 'right' })}>
            <span className="symbol">→</span>
            right {amount}cm
          </button>
          <button
            className="height"
            onClick={this.sendCommand('move', {
              direction: 'up',
              speed: amount,
            })}
          >
            <span className="symbol">⤒</span> raise {amount}cm
          </button>
          <button
            onClick={this.sendCommand('move', {
              direction: 'backward',
              speed: amount,
            })}
          >
            <span className="symbol">↓</span> back {amount}cm
          </button>
          <button
            className="height"
            onClick={this.sendCommand('move', {
              direction: 'down',
              speed: amount,
            })}
          >
            <span className="symbol">⤓</span> lower {amount}cm
          </button>
        </Grid>
      </div>
    )
  }
}
