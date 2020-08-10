import React from 'react'
import ReactDOM from 'react-dom'
import { Route, Link, BrowserRouter as Router, Switch } from 'react-router-dom'

import App from './components/App.jsx'
import Lobby from './components/Lobby/Lobby.jsx'
import Game from './components/Game/Game.jsx'

const routing = (
    <Router>
        <div style={{height: '100%'}}>
            <Route exact path='/' component={App} />
            <Route exact path='/lobby/:name' component={Lobby} />
            <Route path='/game' component={Game} />
        </div>
    </Router>
)

ReactDOM.render(
    routing,
    document.getElementById('root')
)
