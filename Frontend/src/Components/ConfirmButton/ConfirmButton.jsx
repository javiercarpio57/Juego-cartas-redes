import React from 'react'
import { Button } from 'rsuite'
import './ConfirmButtonStyle.scss'

export default class ConfirmButton extends React.Component {
	constructor(props){
		super(props);
	}
	
	render(){
		const {name} = this.props

		return (
			<div className= 'buttonStyle'>
				<Button> { name } </Button>
			</div>
		)
	}
}