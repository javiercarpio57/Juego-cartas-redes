import React from 'react'
import './Game.scss'

import { Modal, Loader, Button, Input } from 'rsuite'
import Card from '../Card/Card.jsx'
import { w3cwebsocket as W3CWebSocket } from "websocket";


const usuarios = ['Javi', 'Guille', 'Gustavo', 'Uri']
const my_user = 'Javi'

let my_code = ''

let cards = [
    'guard','guard','guard','guard',
    'guard','priest','priest','baron',
    'baron','handmaid', 'handmaid','prince',
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
			lastMessage: '',
			is_host: false
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
		console.log("el username que vino a Game es "+this.props.location.state.username);
		console.log("el puerto que vino a Game es "+this.props.location.state.puerto);

		puertoCodigo = this.props.location.state.puerto

		let enlace = 'ws://localhost:'+this.props.location.state.puerto+'/'
		client = new W3CWebSocket(enlace, 'echo-protocol');

		//console.log('Se hizo click');
		
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
				for(i = 1; i<(entradaServer.length)-1; i=i+2){
					console.log("ID: "+entradaServer[i]+" Username: "+entradaServer[i+1])
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
		console.log(event.target.value)
		this.setState({lastMessage: event.target.value})
		//Clean box
		event.target.value = ''
	}

	handleChange(){

	}

	useCard() {

	}

	handleClick(){
	//		this.state.discarded_cards.push(this.Card)
	}

	render() {
		const { show, my_cards } = this.state
		return (
            <div className='background-wood spot-organization-vertical max-height'>
				<div className='player-spot-horizontal'>
					{
						my_cards.map((card, index) => {
							return <Card key={card.name + '_'+ index}
											name={card.name}
											cardImagen={card.name} 
											me={true}
											users={usuarios}
											my_user={my_user}
											enable={card.is_enable}
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
							<Card name = 'player2' cardImagen= 'unknown-card' enable={true} me={false} />
						</div>
						<div className='discard-pile-player-2'>
							<Card name = 'player2' cardImagen= 'guard' enable={true} />							
						</div>
					</div>

					<div className='center-pile-cards' />
					<div className='center-chat'> 
						<div className='center-chat-show'>
							<div>{usuarios[0]}: {this.state.lastMessage}</div>
						</div>
						<div className='center-chat-input'>
							<Input style={{ height: 30, fontSize: 12, width: 200 }} placeholder='Chat' onPressEnter={this.sendChat}/>
						</div>
					</div>

					<div className='player-spot-vertical-right'>
						<div className='discard-pile-player-4'>
							<Card name = 'player4' cardImagen= 'priest' enable={true} />
						</div>
						<div className='player-4-card-2'>
							<Card name = 'player4' cardImagen= 'unknown-card' enable={true} />
						</div>
						<div className='player-4'>
							<Card name = 'player4' cardImagen= 'unknown-card' enable={true} />
						</div>
					</div>
				</div>
				<div className='player-spot-horizontal-top'>
					<div className='discard-pile-player-3'> 
						<Card name = 'player3' cardImagen= 'prince' enable={true} />
					</div>
					<div className='player-3-card-2'>
						<Card name = 'player3' cardImagen= 'unknown-card' enable={true} />
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