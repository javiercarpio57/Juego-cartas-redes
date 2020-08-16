import React from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import './style.scss' 
import { Button, Modal, InputNumber, Loader } from 'rsuite'
import './style.scss' 

const numberInput = { width: '50%' };
let cont = 0;
let puerto = ''
let sockets = []
var port = ''
//let nicknames = ["gusta", "uri", "javier", "lcest", "juan"]
//let username = ''

export default class Lobby extends React.Component {
	constructor(props) {
		super(props)
	
		this.state = {
			show: false,
			codigoSala: '',
			username: '',
			mostrar_backdrop: false
		}
		this.close = this.close.bind(this)
		this.open = this.open.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.sendToServer = this.sendToServer.bind(this)
		this.crearSala = this.crearSala.bind(this)
	}

	convertStrToBin(mensaje) {
		let output = ""
		for (let i = 0; i < mensaje.length; i++) {
			output += input[i].charCodeAt(0).toString(2) + " ";
		}
		return output
	}
	
	convertBinToStr(mensaje){
		let respuesta = parseInt(mensaje,2).toString(10);
	}

	preguntar(username) {
		const client = new W3CWebSocket('ws://172.31.30.254:4200/', 'echo-protocol');
		console.log('Se hizo click en crear sala');
		client.onopen = () => {
			console.log('WebSocket Client Connected');
			function sendText() {
				if (client.readyState === client.OPEN) {
					let conectarmeASala = "dondeConecto|"+username
					client.send(conectarmeASala);
				}
			}
			sendText();
		};
		setTimeout(function(){
	
			client.close()
		}.bind(this), 5000);
		
		
		client.onclose = function() {
		console.log('echo-protocol Client Closed');
		};
		
		client.onmessage = function(e) {
			if (typeof e.data === 'string') {
				console.log("Del server: '" + e.data + "'");
				port = e.data
			}
		};
		cont += 1
		setTimeout(function(){   
			console.log("antes del return tenemoooos: "+port)
			return port
		}.bind(this), 5000);
	}

	
	componentDidMount() {
		this.setState({
			username: this.props.match.params.name
		})
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
		
		this.props.history.push({
			pathname: '/game',
			state: { 
				username: this.state.username, 
				puerto: this.state.codigoSala,
				es_host: false
			}
		});
	}

	crearSala () {
		this.setState ({
			mostrar_backdrop: true
		})
		console.log(this.state.mostrar_backdrop)

		port = this.preguntar(this.state.username)
	
		// TO DO: del server debemos devolvernos el puerto en el cual nos conectamos
		setTimeout(function(){   
			console.log("Mandando este username desde Lobby: "+this.state.username)
			console.log("Mandando este puerto desde Lobby: "+port)
			this.props.history.push({
				pathname: '/game',
				state: { 
					username: this.state.username,
					puerto: port,
					es_host: true
				}
			});
			self.setState({
				mostrar_backdrop: false
			})
		}.bind(this), 12000);
	}
	
	render() {
		const style = {
			fontStyle: 'italic',
			fontFamily: 'Snell Roundhand'
		}
		return (
			<div className='background-wood'>
				<h1 style={style} className='title-lobby'> Lobby de {this.state.username}</h1>
				<div className='order-components'>
					<Button style={style} size="lg" color='cyan' block onClick={this.crearSala}>Crear sala</Button>
					<Button style={style} size="lg" color='green' block onClick={this.open}>Unirse a sala</Button>
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

				{
					this.state.mostrar_backdrop
						?
					<Loader inverse backdrop content='Cargando...' vertical />
						:
					null
				}

			</div>
			)
		}
}