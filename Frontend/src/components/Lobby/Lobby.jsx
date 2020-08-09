import React from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import './style.scss' 
import { Button } from 'rsuite'
import { Modal } from 'rsuite'
import { InputNumber } from 'rsuite'

import './style.scss' 

const numberInput = { width: '50%' };
export default class Lobby extends React.Component {
	oka() {
		const client = new W3CWebSocket('ws://localhost:4200/', 'echo-protocol');
		console.log('Se hizo click');
			client.onopen = () => {
				console.log('WebSocket Client Connected');
				function sendNumber() {
					if (client.readyState === client.OPEN) {
						var number = Math.round(Math.random() * 0xFFFFFF);
						client.send(number.toString());
						setTimeout(sendNumber, 1000);
					}
				}
				sendNumber();
		  };
		  client.onclose = function() {
			console.log('echo-protocol Client Closed');
			};
			
			client.onmessage = function(e) {
				if (typeof e.data === 'string') {
					console.log("Del server: '" + e.data + "'");
				}
			};
	  }

	constructor(props) {
		super(props)

		this.state = {
			show: false
		}
		this.close = this.close.bind(this)
		this.open = this.open.bind(this)
	}

	close () {
		this.setState({
			show: false
		})
		
	}

	open () {
		this.setState({
			show: true
		})
		this.oka()
	}

	render(){
		return (
			<div className='background-wood'>
				<h1 className='title-lobby'>Lobby</h1>
				<div className='order-components'>
					<Button size="lg" color='cyan' block>Crear sala</Button>
					<Button size="lg" color='green' block onClick={this.open}>Unirse a sala</Button>
				</div>

				<Modal show={this.state.show} onHide={this.close}>
					<Modal.Header>
						<Modal.Title>Ingresa el código de la sala</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div style={{ textAlign: 'center' }}>
							<InputNumber style={numberInput} defaultValue={100000} min={0} max={999999} placeholder='Código de sala'/>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={this.close} appearance="primary">
							Ok
						</Button>
						<Button onClick={this.close} appearance="subtle">
							Cancel
						</Button>
					</Modal.Footer>
				</Modal>
				</div>
			)
		}
}