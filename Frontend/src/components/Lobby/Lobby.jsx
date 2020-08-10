import React from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket";
import './style.scss' 
import { Button, Modal, InputNumber } from 'rsuite'
import './style.scss' 

const numberInput = { width: '50%' };
let cont = 0;
let puerto = ''
let sockets = []
let PORT = 4200
//let nicknames = ["gusta", "uri", "javier", "lcest", "juan"]
//let username = ''

// const history = useHistory()

const cliente = {
	name: 'Gusta gay',
	codigo: '6'
}
export default class Lobby extends React.Component {
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

	Unirse(puerto,username) {
		let enlace = 'ws://localhost:'+puerto+'/'
		const client = new W3CWebSocket(enlace, 'echo-protocol');
		console.log('Se hizo click');
			client.onopen = () => {
				console.log('Conexion establecida en el puerto'+puerto);
				function EstablecerConexion() {
					if (client.readyState === client.OPEN) {
						let conectarmeASala = "conectarmeASala|"+username
						client.send(conectarmeASala);
					}
				}
				EstablecerConexion();
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
	  

	  preguntar(username) {
		const client = new W3CWebSocket('ws://localhost:4200/', 'echo-protocol');
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
			   
				setTimeout(function(){
					console.log("puerto es"+puerto);
					this.Unirse(puerto,username)
					
				}.bind(this), 5000);
			   
				client.close()
			}.bind(this), 5000);
			
		  
		    client.onclose = function() {
			console.log('echo-protocol Client Closed');
			};
			
			client.onmessage = function(e) {
				if (typeof e.data === 'string') {
					console.log("Del server: '" + e.data + "'");
					puerto = e.data
				}
			};
		cont += 1
	  }

	

	constructor(props) {
		super(props)

		this.state = {
			show: false,
			codigoSala: '',
			username: ''
		}
		this.close = this.close.bind(this)
		this.open = this.open.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.sendToServer = this.sendToServer.bind(this)
		this.crearSala = this.crearSala.bind(this)
		
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
		this.Unirse(this.state.codigoSala,this.state.username)
		this.setState({
			show: false
		})
		this.props.history.push({
			pathname: '/game',
			state: { client: cliente }
		});
	}

	crearSala () {
		this.preguntar(this.state.username)
		this.props.history.push({
			pathname: '/game',
			state: { client: cliente }
		});
	}
	
	render(){
		return (
			<div className='background-wood'>
				<h1 className='title-lobby'> LOBBY DE: {this.state.username}</h1>
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