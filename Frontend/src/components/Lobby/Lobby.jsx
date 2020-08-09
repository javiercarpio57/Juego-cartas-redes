import React from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import './style.scss' 
import { Button, Modal, InputNumber } from 'rsuite'

import './style.scss' 

const numberInput = { width: '50%' };
// const history = useHistory()
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
			show: false,
			codigoSala: ''
		}
		this.close = this.close.bind(this)
		this.open = this.open.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.sendToServer = this.sendToServer.bind(this)
		this.crearSala = this.crearSala.bind(this)
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

	handleChange (value) {
		this.setState({
			codigoSala: value
		})
	}

	sendToServer () {
		console.log(this.state.codigoSala)
		this.setState({
			show: false
		})
		this.props.history.push('/game')
	}

	crearSala () {
		this.props.history.push('/game');
	}

	render(){
		return (
			<div className='background-wood'>
				<h1 className='title-lobby'>Lobby</h1>
				<div className='order-components'>
					<Button size="lg" color='cyan' block onClick={this.crearSala}>Crear sala</Button>
					<Button size="lg" color='green' block onClick={this.open}>Unirse a sala</Button>
				</div>

				<Modal show={this.state.show} onHide={this.close}>
					<Modal.Header>
						<Modal.Title>Ingresa el código de la sala</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div style={{ display: 'flex', justifyContent: 'center' }}>
							<InputNumber style={numberInput} min={0} placeholder='Código de sala' onChange={this.handleChange} />
						</div>
					</Modal.Body>
					<Modal.Footer>
						<div className='modal-buttons'>
							<Button onClick={this.close} color="red">
								Cancel
							</Button>
							<Button onClick={this.sendToServer} color="green">
								Join
							</Button>
						</div>
					</Modal.Footer>
				</Modal>
			</div>
			)
		}
}