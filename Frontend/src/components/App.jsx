import React from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Route, Link } from 'react-router-dom'
import { Button, Modal, InputNumber, Input } from 'rsuite'

import './style.scss'
import 'rsuite/dist/styles/rsuite-default.css'

import ConfirmButton from './ConfirmButton/ConfirmButton.jsx'

export default class App extends React.Component {
    constructor (props) {
        super(props)


        this.state = {
            name: ''
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    handleChange(value, event){
        this.setState({name: value})
    }

    handleClick(){
        this.setState(state => (
            {name: this.state.name}
        ))
    }

    render () {
        return (
            <div className= 'main'>
                <div className= 'inputArea'>
                    <div className= 'inputField'>
                        <Input  min={0} placeholder="Default Input" onChange={this.handleChange}/> 
                    </div>
                </div>
                <div className= 'buttonArea'>                    
                    <Link  to="/lobby" onClick={this.handleClick}>
                        <ConfirmButton buttonname='Play'/>
                    </Link>
                    <div className='loveLetter'></div>
                </div>                
            </div>
        )
    }
}
