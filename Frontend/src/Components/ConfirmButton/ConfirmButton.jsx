import React from 'react'
import { Button } from 'rsuite'
import './ConfirmButtonStyle.scss'

export default class ConfirmButton extends React.Component {
	render(){
		return (
			<div className= 'buttonStyle'>
				<Button>Hello World</Button>
			</div>
		)
	}
}