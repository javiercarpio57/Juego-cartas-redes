import React from 'react'
import { Button } from 'rsuite';

import './style.scss' 

export default class Lobby extends React.Component {
	render(){
		return (
			<div className='background-wood'>
				<h1 className='title-lobby'>Lobby</h1>
				<div className='order-components'>
					<Button size="lg" color='cyan' block>Crear sala</Button>
					<Button size="lg" color='green' block>Unirse a sala</Button>
				</div>
			</div>
		)
	}
}