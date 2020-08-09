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
                <div className= 'inputArea'>
                    <div className= 'inputField'>
                        Hola
                    </div>
                </div>
                <div className= 'buttonArea'>
                    <Link to="/lobby">
                        <ConfirmButton name='Play'/>
                    </Link>
                    <div className='loveLetter'></div>
                </div>                
            </div>
        )
    }
}
