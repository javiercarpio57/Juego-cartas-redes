import React from 'react'
import './Game.scss'

import { Modal, Loader, Button, Input } from 'rsuite'
import Card from '../Card/Card.jsx'
import { w3cwebsocket as W3CWebSocket } from "websocket";

import PanelNames from '../PanelNames/PanelNames.jsx'

let my_user = ''
let my_username = ''
let my_code = ''

let cards = [
    'guard','guard','handmaid','handmaid',
    'handmaid','handmaid','handmaid','handmaid',
    'handmaid','handmaid', 'handmaid','prince',
    'prince','king','countess','princess'
]

const has_to_play_other = ['guard', 'priest', 'baron', 'handmaid', 'princess']
const has_to_play_countess = ['prince', 'king']

let client = null
let puertoCodigo = ''

export default class Game extends React.Component {
	constructor (props) {
		super(props)

		this.state = {
			show: true,
			block: true,
			my_cards: [],
			discarded_cards: [],
			messages_array: [],
			is_host: false,
			connected_users: []
		}
		// this.client = this.client.bind(this);
		this.close = this.close.bind(this)
		this.getNewCard = this.getNewCard.bind(this)
		this.sendChat = this.sendChat.bind(this)
	}

	close () {
        this.setState({
            show: false
        })
        if (client.readyState === client.OPEN) {
            let conectarmeASala = "iniciar"
            client.send(conectarmeASala);
        }

    }

	componentDidMount() {
		self = this
		console.log("el username que vino a Game es: YO "+this.props.location.state.username);
		console.log("el puerto que vino a Game es "+this.props.location.state.puerto);
		my_username = this.props.location.state.username
		puertoCodigo = this.props.location.state.puerto

		let enlace = 'ws://localhost:'+this.props.location.state.puerto+'/'
		client = new W3CWebSocket(enlace, 'echo-protocol');
		
		client.onopen = () => {
			function EstablecerConexion() {
				if (client.readyState === client.OPEN) {
					let conectarmeASala = "conectarmeASala|"+self.props.location.state.username
					client.send(conectarmeASala);
				}
			}
			EstablecerConexion();
		  };
		  
	  	client.onclose = function() {
			console.log('echo-protocol Client Closed');
		};

		client.onmessage = function(e) {
			let mensaje= e.data
			let entradaServer = mensaje.split("|");
			console.log(entradaServer)
			if (typeof e.data === 'string') {
				console.log("El Server Manda: '" + e.data + "'");
			}
			if((entradaServer[0].localeCompare("conectado"))==0){
				console.log("Eres el cliente numero "+entradaServer[1]+" en entrar")
				my_code = entradaServer[1]

				self.setState({
					is_host: my_code == '1'
				})
			}
			//Se ejecuta la primera vez que cuando inicia el juego ahi entran las cartas
			if (entradaServer[0].localeCompare('turno') === 0) {
				console.log("Asignar cartas"+entradaServer);
			}
			if (entradaServer[0].localeCompare('cartas') === 0) {
				const mi_carta = entradaServer[entradaServer.indexOf(my_code) + 1]
				console.log("Tu carta es", mi_carta)
				self.setState({
					show: false
				})
				self.getNewCard(mi_carta)
			}
			if (entradaServer[0].localeCompare('usuarios') === 0) {
				console.log("Lista de Usuarios conectados")
				let i = 0
				const con_u = []
				for(i = 1; i< (entradaServer.length) -1; i = i + 2) {
					con_u.push(entradaServer[i+1])
					console.log("ID: "+entradaServer[i]+" Username: "+entradaServer[i+1])
				}
				self.setState ({
					connected_users: con_u
				})
			}
			if (entradaServer[0].localeCompare('chatc') === 0) {
				console.log("Mensaje para broadcast")
				let mensaje = (entradaServer[1]+": "+entradaServer[2])
				let mensajeArray = self.state.messages_array
				mensajeArray.push({
					mensaje 
				})
				self.setState({
					messages_array: mensajeArray					
				})
				console.log(self.state.messages_array)
			}
			if (entradaServer[0].localeCompare('guard') === 0) {
				console.log("De haber jugado al guard")
				//"guard|"+tu+"|"+rival+"|"+res
				console.log("El que tiro",entradaServer[1])
				console.log("El que recibio",entradaServer[2])
				
				if(entradaServer[1].localeCompare(my_username)==0){
					if(entradaServer[3].localeCompare("true")==0){
						console.log("le atino")
					}else{
						console.log("Fallaste jeje")
					}
				}
				if(entradaServer[2].localeCompare(my_username)==0){
					if(entradaServer[3].localeCompare("true")==0){
						console.log("Te atacaron")
					}else{
						console.log("Te atacaron pero no te afecto")
					}
				}
			}
			if (entradaServer[0].localeCompare('priest') === 0) {
				if(entradaServer[1].localeCompare(my_username) == 0){
					console.log("La carta de " + entradaServer[2] + " es " + entradaServer[3])
				}
				if(entradaServer[2].localeCompare(my_username) == 0){
					console.log(entradaServer[1] + " vio tu carta")
				}				
			}
			if (entradaServer[0].localeCompare('baron') === 0) {
				//"baron|"+tu+"|"+rival+"|"+perdedor

				if(entradaServer[1].localeCompare(my_username) == 0){// Si yo soy el que tiro la carta
					if(entradaServer[3].localeCompare(entradaServer[1]) == 0 ){// Si el perdedor soy yo
						console.log( entradaServer[2] + " tiene una carta mas alta que la tuya, perdiste");
					}else
					if(entradaServer[3].localeCompare(entradaServer[2]) == 0 ){// Si el perdedor es el rival
						console.log("Tu carta es mas alta que la de "+entradaServer[2]+" ganaste");
					}else{
						console.log("Empate");
					}
				}
				if(entradaServer[2].localeCompare(my_username) == 0){// Si yo soy el que recibio la carta
					if(entradaServer[3].localeCompare(entradaServer[1]) == 0 ){// Si yo soy el ganador 
						console.log("Te ataco "+ entradaServer[1] + " pero tu carta es mas alta, ganaste");					
					}else
					if(entradaServer[3].localeCompare(entradaServer[2]) == 0 ){//Si yo soy el que perdedor

						console.log("Te ataco "+ entradaServer[1] + " y tiene una carta mas alta que la tuya, perdiste");
					}else{
						console.log("Empate");
					}
				}
			}if (entradaServer[0].localeCompare('handmaid') === 0) {
				//"baron|"+tu+"|"+rival+"|"+perdedor
				if(entradaServer[1].localeCompare(my_username) == 0){
					console.log("Eres invencible por un turno")
				}else{
					console.log("Cuidado "+ entradaServer[1]+" es invencible por un turno.")
				}
				
				
			}
		};
	}

	getNewCard(newCard) {
		const item = newCard
		cards.splice(cards.indexOf(item), 1)

		const temp_card = this.state.my_cards
		temp_card.push({
			is_enable: true,
			name: item,
		})

		this.setState({
			my_cards: temp_card
		})
		this.checkMyCards()
	}

	clearCards() {
		let tmp_cards = this.state.my_cards

		for (let i = 0; i < tmp_cards.length; i++) {
			tmp_cards[i].is_enable = true
		}

		this.setState({
			my_cards: tmp_cards
		})
	}

	checkMyCards() {
		let tmp_cards = this.state.my_cards

		if (tmp_cards.length === 2) {
			if (has_to_play_other.includes(tmp_cards[0].name) && tmp_cards[1].name === 'countess') {
				tmp_cards[1].is_enable = false
			} else if (has_to_play_other.includes(tmp_cards[1].name) && tmp_cards[0].name === 'countess') {
				tmp_cards[0].is_enable = false
			}

			if (has_to_play_countess.includes(tmp_cards[0].name) && tmp_cards[1].name === 'countess') {
				tmp_cards[0].is_enable = false
			} else if (has_to_play_countess.includes(tmp_cards[1].name) && tmp_cards[0].name === 'countess') {
				tmp_cards[1].is_enable = false
			}
		}

		this.setState({
			my_cards: tmp_cards
		})
	}

	sendChat(event){
		//Send to Server chat
		if(event.target.value !=''){
			console.log(event.target.value)
			this.setState({lastMessage: event.target.value})
			let texto = 'broadcast|'+my_username+'|'+event.target.value
			console.log("el mensaje a enviar es: "+texto)
			client.send(texto);
		}
		//Clean box
		event.target.value = ''
	}

	handleChange(){

	}

	useCard(stringPlay) {
		console.log('TO PLAY:', stringPlay)
	}

	handleClick(){
	//		this.state.discarded_cards.push(this.Card)
	}

	showSome(stringPlay) {
		console.log("Al haber jugado una carta le mandamos al server:")
		console.log(stringPlay)
		client.send(stringPlay);
	}

	render() {
		const { show, my_cards, messages_array, connected_users } = this.state
		return (
            <div className='background-wood spot-organization-vertical max-height'>
				<PanelNames names={connected_users} pivot={my_username} />

				<div className='player-spot-horizontal'>
					{
						my_cards.map((card, index) => {
							return <Card key={card.name + '_'+ index}
										 name={card.name}
										 cardImagen={card.name}
										 me={true}
										 users={connected_users}
										 my_user={my_username}
										 enable={card.is_enable}
										 jugarCarta={this.showSome.bind(this)}
									/>
						})
					}
				</div>
				<div className='spot-organization-horizontal'>
					<div className='player-spot-vertical-left'>
						<div className='player-2'>
							<Card name = 'player2' cardImagen= 'unknown-card' enable={true} />
						</div>
						<div className='player-2-card-2'>
							{/* <Card name = 'player2' cardImagen= 'unknown-card' enable={true} me={false} /> */}
						</div>
						<div className='discard-pile-player-2'>
							{/* <Card name = 'player2' cardImagen= 'guard' enable={true} />							 */}
						</div>
					</div>

					<div className='center-pile-cards' />
					<div className='center-chat'> 
						<div className='center-chat-show'>
							<div className='chat-Size'>{messages_array.map((d) => <li key={d.mensaje}>{d.mensaje}</li>)}</div>
						</div>
						<div className='center-chat-input'>
							<Input style={{ height: 30, fontSize: 12 }} placeholder='Chat' onPressEnter={this.sendChat}/>
						</div>
					</div>

					<div className='player-spot-vertical-right'>
						<div className='discard-pile-player-4'>
							{/* <Card name = 'player4' cardImagen= 'priest' enable={true} /> */}
						</div>
						<div className='player-4-card-2'>
							{/* <Card name = 'player4' cardImagen= 'unknown-card' enable={true} /> */}
						</div>
						<div className='player-4'>
							<Card name = 'player4' cardImagen= 'unknown-card' enable={true} />
						</div>
					</div>
				</div>
				<div className='player-spot-horizontal-top'>
					<div className='discard-pile-player-3'> 
						{/* <Card name = 'player3' cardImagen= 'prince' enable={true} /> */}
					</div>
					<div className='player-3-card-2'>
						{/* <Card name = 'player3' cardImagen= 'unknown-card' enable={true} /> */}
					</div>
					<div className='player-3'>
						<Card name = 'player3' cardImagen= 'unknown-card' enable={true} />
					</div>
				</div>

				<Modal show={show}>
					<Modal.Header closeButton={false}>
						{
							my_code == '1' || this.state.is_host ?
							<Modal.Title>¿Todos los jugadores están unidos?</Modal.Title>
								:
							<Modal.Title>Esperando que el host inicie la partida</Modal.Title>
						}
					</Modal.Header>
					<Modal.Body>
						<div>
							{
								my_code == '1' || this.state.is_host ?
								<div style={{ width: '100%'}}>
									<h5>Invita a tus amigos.</h5>
									<div style={{textAlign: 'center'}}>
										<h6>Código: {puertoCodigo}</h6>
										<br />
									</div>
								</div>
									:
								null
							}
							<p>Usuarios conectados:</p>
							<div className='display-names'>
								{
									this.state.connected_users.map((user, index) => {
										return <p>{user}</p>
									})
								}
							</div>
							<br />
							<div style={{ textAlign: 'center' }}>
								<Loader size="md" />
							</div>
						</div>
					</Modal.Body>
					<Modal.Footer>
						{
							my_code == '1' || this.state.is_host
								?
							<div className='modal-buttons'>
								<Button onClick={this.close} color="green" block>
									Play
								</Button>
							</div>
								:
							null							
						}
					</Modal.Footer>
				</Modal>
			</div>
		)
	}
}