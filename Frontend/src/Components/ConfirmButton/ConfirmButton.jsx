import React from 'react'
import { Button } from 'rsuite'
import './ConfirmButtonStyle.scss'

export default class ConfirmButton extends React.Component {
	constructor(props){
		super(props);
	}
	
	render(){
		const {buttonname} = this.props

		return (
			<div className= 'buttonStyle'>
				<Button className= 'button'> { buttonname } </Button>
			</div>
		)
	}
}