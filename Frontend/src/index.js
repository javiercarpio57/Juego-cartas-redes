import React from 'react'
import ReactDOM from 'react-dom'
import { Route, Link, BrowserRouter as Router, Switch } from 'react-router-dom'

import App from './components/App.jsx'
import Lobby from './components/Lobby/Lobby.jsx'
import Game from './components/Game/Game.jsx'

const routing = (
    <Router>
        <div>
            <Route exact path='/' component={App} />
            <Route path='/lobby' component={Lobby} />
            <Route path='/game' component={Game} />
        </div>
    </Router>
)

ReactDOM.render(
    routing,
    document.getElementById('root')
)
