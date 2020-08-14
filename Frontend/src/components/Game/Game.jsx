import React from 'react'
import './Game.scss'

import { Modal, Loader, Button, Input, Notification } from 'rsuite'
import Card from '../Card/Card.jsx'
import { w3cwebsocket as W3CWebSocket } from "websocket";

import PanelNames from '../PanelNames/PanelNames.jsx'

let my_user = ''
let my_username = ''
let my_code = ''

let cards = [
    'guard', 'guard', 'guard', 'guard',
    'guard', 'priest', 'priest', 'baron',
    'baron', 'handmaid', 'handmaid', 'prince',
    'prince', 'king', 'countess', 'princess'
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
			connected_users: [],
			alive: true
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
			if (entradaServer[0].localeCompare('turnoactual') === 0) {
				console.log("Cartas del siguiente usuario"+entradaServer);
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

// ======================= JUEGO DE CARTAS =============================

			// ==================== GUARD ====================
			if (entradaServer[0].localeCompare('guard') === 0) {
				console.log("De haber jugado al guard")
				//"guard|"+tu+"|"+rival+"|"+res
				console.log("El que tiro",entradaServer[1])
				console.log("El que recibio",entradaServer[2])

				const titleNotification = `${entradaServer[1]} jugó a GUARD`
				let bodyNotification = ''
				let my_icon = ''
				
				if(entradaServer[1].localeCompare(my_username) == 0) {
					if(entradaServer[3].localeCompare("true") == 0){
						bodyNotification = `Acertaste contra ${entradaServer[2]}. Lo has eliminado.`
						my_icon = 'success'
						console.log("le atino")
					}else{
						bodyNotification = `Fallaste contra ${entradaServer[2]}.`
						my_icon = 'error'
						console.log("Fallaste jeje")
					}
				} else if (entradaServer[2].localeCompare(my_username) == 0) {
					if(entradaServer[3].localeCompare("true") == 0) {
						bodyNotification = `${entradaServer[1]} te ha atacado. Te han eliminado.`
						my_icon = 'error'
						self.setState ({
							alive: false
						})
						console.log("Te atacaron")
					} else {
						bodyNotification = `${entradaServer[1]} te ha atacado pero ha fallado.`
						my_icon = 'warning'
						console.log("Te atacaron pero no te afecto")
					}
				} else {
					my_icon = 'info'
					if(entradaServer[3].localeCompare("true") == 0) {
						bodyNotification = `${entradaServer[1]} ha atacado a ${entradaServer[2]}. ${entradaServer[2]} ha sido eliminado.`
					} else {
						bodyNotification = `${entradaServer[1]} ha atacado a ${entradaServer[2]}. ${entradaServer[2]} sigue en el juego.`
					}
				}

				console.log("ANTES DE DISCARD CARDSSS")
				console.log(self.state.discarded_cards)
				self.discardCards(entradaServer[0], entradaServer[1])
				console.log("DESPUES DE DISCARD CARDS")
				console.log(self.state.discarded_cards)

				self.ShowNotification (titleNotification, bodyNotification, my_icon)
			}
			
			// ==================== PRIEST ====================
			if (entradaServer[0].localeCompare('priest') === 0) {
				const titleNotification = `${entradaServer[1]} jugó a PRIEST`
				let bodyNotification = ''
				let my_icon = ''

				if (entradaServer[1].localeCompare(my_username) == 0) {
					bodyNotification = `La carta de ${entradaServer[2]} es ${entradaServer[3]}`
					my_icon = 'success'
					console.log("La carta de " + entradaServer[2] + " es " + entradaServer[3])
				} else if (entradaServer[2].localeCompare(my_username) == 0) {
					bodyNotification = `${entradaServer[1]} vio tu carta`
					my_icon = 'warning'
					console.log(entradaServer[1] + " vio tu carta")
				} else {
					bodyNotification = `${entradaServer[1]} vio la carta de ${entradaServer[2]}`
					my_icon = 'info'
				}
				self.ShowNotification(titleNotification, bodyNotification, my_icon)
			}
			
			// ==================== BARON ====================
			if (entradaServer[0].localeCompare('baron') === 0) {
				const titleNotification = `${entradaServer[1]} jugó a BARON`
				let bodyNotification = ''
				let my_icon = ''

				if (entradaServer[1].localeCompare(my_username) == 0) {// Si yo soy el que tiro la carta
					if (entradaServer[3].localeCompare(entradaServer[1]) == 0) {// Si el perdedor soy yo
						bodyNotification = `${entradaServer[2]} tiene una carta más alta que la tuya, perdiste`
						my_icon = 'error'
						self.setState ({
							alive: false
						})
						console.log( entradaServer[2] + " tiene una carta mas alta que la tuya, perdiste");
					} else if (entradaServer[3].localeCompare(entradaServer[2]) == 0) {// Si el perdedor es el rival
						bodyNotification = `Tu carta es más alta que la de ${entradaServer[2]}, ganaste`
						my_icon = 'success'
						console.log("Tu carta es mas alta que la de "+entradaServer[2]+" ganaste");
					} else {
						bodyNotification = `Has empatado contra ${entradaServer[2]}`
						my_icon = 'warning'
						console.log("Empate");
					}
				} else if (entradaServer[2].localeCompare(my_username) == 0) {// Si yo soy el que recibio la carta
					if (entradaServer[3].localeCompare(entradaServer[1]) == 0) {// Si yo soy el ganador 
						bodyNotification = `Te atacó ${entradaServer[1]} pero tu carta es más alta, ganaste`
						my_icon = 'success'
						console.log("Te ataco "+ entradaServer[1] + " pero tu carta es mas alta, ganaste");					
					} else if(entradaServer[3].localeCompare(entradaServer[2]) == 0){//Si yo soy el que perdedor
						bodyNotification = `Te atacó ${entradaServer[1]}, y tiene una carta más alta que la tuya, perdiste`
						my_icon = 'error'
						self.setState ({
							alive: false
						})
						console.log("Te ataco "+ entradaServer[1] + " y tiene una carta mas alta que la tuya, perdiste");
					} else {
						bodyNotification = `Has empatado contra ${entradaServer[2]}`
						console.log("Empate")
						my_icon = 'warning'
					}
				} else {
					bodyNotification = `${entradaServer[1]} ha empatado contra ${entradaServer[2]}`
					my_icon = 'info'
				}
				self.ShowNotification(titleNotification, bodyNotification, my_icon)
			}
			

			//==================== HANDMAID ====================
			if (entradaServer[0].localeCompare('handmaid') === 0) {
				const titleNotification = `${entradaServer[1]} jugó a HANDMAID`
				let bodyNotification = ''
				let my_icon = ''

				if(entradaServer[1].localeCompare(my_username) == 0){
					bodyNotification = 'Eres invencible por un turno'
					my_icon = 'success'
					console.log("Eres invencible por un turno")
				}else{
					bodyNotification = `Cuidado ${entradaServer[1]} es invencible por un turno.`
					my_icon = 'warning'
					console.log("Cuidado "+ entradaServer[1]+" es invencible por un turno.")
				}
				self.ShowNotification(titleNotification, bodyNotification, my_icon)
			}
// ======================================================================

		};
	}

	ShowNotification (title, description, my_icon) {
		Notification[my_icon] ({
			title,
			placement: 'bottomEnd',
			duration: 10000,
			description: <div style={{width: '250px'}}><p>{description}</p></div>
		})
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

	showSome(cardName, stringPlay) {
		console.log("Al haber jugado una carta le mandamos al server:")
		console.log(stringPlay)
		client.send(stringPlay)		
	}

	discardCards(cardName, player){
		let obj = {
			name: cardName,
			player: player
		}
		let array_descartadas = this.state.discarded_cards
		array_descartadas.push(obj)
		this.setState(
			{
				discarded_cards: array_descartadas
			}
		)
	}


	render() {
		const { show, my_cards, messages_array, connected_users, alive, discarded_cards } = this.state
		const my_pos = connected_users.indexOf(my_username)
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
										 alive={alive}
									/>
						})
					}
					<div className='player-1-card-2'>
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
											alive={alive}
										/>
							})
						}
						
					</div>
					<div className='discard-pile-player-1'>
						{
							discarded_cards.map((card,index) => {
								if(card.player==my_username){
									return <Card key={card.name + '_'+ index}
									name={card.name}
									cardImagen={card.name}
									me={true}
									users={connected_users}
									my_user={my_username}
									enable={true}
									alive={false}
									/>
								}
								else{
									return null
								}
							})
						}
					</div>
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
							{
								discarded_cards.map((card,index) => {
									if(card.player==connected_users[(my_pos + 1) % 4]){
										return <Card key={card.name + '_'+ index}
										name={card.name}
										cardImagen={card.name}
										me={false}
										users={connected_users}
										my_user={my_username}
										enable={true}
										alive={false}
										/>
									}
									else{
										return null
									}
								})
							}
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
							{
								discarded_cards.map((card,index) => {
									if(card.player==connected_users[(my_pos + 3) % 4]){
										return <Card key={card.name + '_'+ index}
										name={card.name}
										cardImagen={card.name}
										me={false}
										users={connected_users}
										my_user={my_username}
										enable={true}
										alive={false}
										/>
									}
									else{
										return null
									}
								})
							}
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
						{
								discarded_cards.map((card,index) => {
									if(card.player==connected_users[(my_pos + 2) % 4]){
										return <Card key={card.name + '_'+ index}
										name={card.name}
										cardImagen={card.name}
										me={false}
										users={connected_users}
										my_user={my_username}
										enable={true}
										alive={false}
										/>
									}
									else{
										return null
									}
								})
							}
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