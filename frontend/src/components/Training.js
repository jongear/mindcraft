import React from 'react'
import styled from 'styled-components'

const Title = styled.h1`
  font-size: 1.5rem;
  color: white;
`

export default class FlightControls extends React.Component {
  constructor() {
    super()

    // state
    this.state = {}
  }

  render() {
    return (
      <div>
        <Title>Flight Training Center</Title>
      </div>
    )
  }
}
