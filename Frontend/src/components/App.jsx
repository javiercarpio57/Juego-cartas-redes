import React from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Route, Link } from 'react-router-dom'
import { Button, Input, InputGroup, Icon, Alert } from 'rsuite'

import './style.scss'
import 'rsuite/dist/styles/rsuite-default.css'

export default class App extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            name: null
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    handleChange(value, event){
        this.setState({name: value})
    }

    handleClick(){
        if (this.state.name) {
            Alert.closeAll()
            this.setState(state => (
                {name: this.state.name}
            ))

            this.props.history.push({
                pathname: `/lobby/${this.state.name}`,
                state: { 
                    username: this.state.name
                }
            });
        } else {
            Alert.error('Debes ingresar un nombre para jugar', 5000)
        }
    }

    render () {
        const styles = {
            marginBottom: 10,
            fontStyle: 'italic',
            fontFamily: 'Snell Roundhand'
        }

        return (
            <div className= 'main'>
                <div className='loveLetter' />

                <div className='name-input-btn'>
                    <InputGroup size='lg' inside style={styles}>
                        <Input placeholder="Ingresa tu usuario"
                               onChange={this.handleChange} />
                        <InputGroup.Button>
                            <Icon icon="avatar" />
                        </InputGroup.Button>
                    </InputGroup>

                    <Button style={{ fontStyle: 'italic', fontFamily: 'Snell Roundhand' }} color="green" block onClick={this.handleClick}>
                        Play
                    </Button>
                </div>
            </div>
        )
    }
}
