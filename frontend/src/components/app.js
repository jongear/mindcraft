import React from 'react'
import { BrowserRouter as Router, Link, Route } from 'react-router-dom'
import styled, { injectGlobal } from 'styled-components'
import FlightControls from './FlightControls'
import Training from './Training'

injectGlobal`
  body {
    background-color: #223D51;
  }
  `

const PageStyles = styled.div`
  max-width: 500px;
  margin: 0 auto;
`

export default class App extends React.Component {
  constructor() {
    super()
  }

  componentDidMount() {
    //document.body.style.background = '#223D51'
  }

  render() {
    return (
      <Router>
        {/* <div style={{ backgroundColor: '#223D51' }}> */}
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/training/">Training</Link>
              </li>
            </ul>
          </nav>

          <PageStyles>
            <Route path="/" exact component={FlightControls} />
            <Route path="/training/" component={Training} />
          </PageStyles>
        </div>
      </Router>
    )
  }
}
