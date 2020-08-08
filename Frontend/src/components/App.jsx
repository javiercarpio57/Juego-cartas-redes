import React from 'react'
import './style.scss'
import 'rsuite/dist/styles/rsuite-default.css'

import Button1 from './Button1/Button1.jsx'

export default class App extends React.Component {
    constructor (props) {
        super(props)

        this.state = {
        }
    }

    render () {
        return (
            <div>
                <Button1 />
            </div>
        )
    }
}
