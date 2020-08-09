import React from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Link } from 'react-router-dom'
import { Button, Modal, InputNumber, Input } from 'rsuite'

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
                <div className= 'inputArea'>
                    <div className= 'inputField'>
                        <Input min={0} />
                    </div>
                </div>
                <div className= 'buttonArea'>
                    <Link to="/lobby">
                        <ConfirmButton name='Play' onClick={this.registerName}/>
                    </Link>
                    <div className='loveLetter'></div>
                </div>                
            </div>
        )
    }
}
