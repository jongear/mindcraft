import React from 'react'
import { BrowserRouter as Router, Link, Route } from 'react-router-dom'
import styled, { injectGlobal } from 'styled-components'
import FlightControls from './FlightControls'
import Training from './Training'

injectGlobal`
  body {
    background-color: #223D51;
    font-family: 'Helvetica', 'Arial', sans-serif;
  }
  `

const PageStyles = styled.div`
  max-width: 500px;
  margin: 0 auto;
`
const StyledNav = styled.nav`
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  li {
    float: left;
  }

  li a {
    display: block;
    text-align: center;
    padding: 16px;
    text-decoration: none;
  }
`

const StyledLink = styled(Link)`
  color: white;
  display: block;
  margin: 0.5em 0;
  font-size: 1rem;
  font-weight: bold;

  &:hover {
    color: #63c2de;
  }
  &.active {
    color: red;
  }
`

export default class App extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (
      <Router>
        <div>
          <PageStyles>
            <StyledNav>
              <ul>
                <li>
                  <StyledLink to="/">Home</StyledLink>
                </li>
                <li>
                  <StyledLink to="/training/">Training</StyledLink>
                </li>
              </ul>
            </StyledNav>
            <Route path="/" exact component={FlightControls} />
            <Route path="/training/" component={Training} />
          </PageStyles>
        </div>
      </Router>
    )
  }
}
