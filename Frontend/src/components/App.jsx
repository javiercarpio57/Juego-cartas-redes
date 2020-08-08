import React from 'react'
import { Link } from 'react-router-dom'

import './style.scss'
import 'rsuite/dist/styles/rsuite-default.css'

export default class App extends React.Component {
    constructor (props) {
        super(props)

        this.state = {
        }
    }

    render () {
        return (
            <div>
                <h1>App</h1>
                <Link to="/lobby">
                    <button>click</button>
                </Link>
            </div>
        )
    }
}
