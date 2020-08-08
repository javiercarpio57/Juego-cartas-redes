import React from 'react'
import { Link } from 'react-router-dom'

import './style.scss'
import 'rsuite/dist/styles/rsuite-default.css'

import ConfirmButton from './ConfirmButton/ConfirmButton.jsx'

export default class App extends React.Component {
    constructor (props) {
        super(props)

        this.state = {
        }
    }

    render () {
        return (
            <div className= 'main'>
                <Link to="/lobby">
                    <ConfirmButton name='Play'/>
                </Link>
            </div>
        )
    }
}
