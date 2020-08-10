import React from 'react'
import './Game.scss'

import { Modal, Loader, Button } from 'rsuite'
import Card from '../Card/Card.jsx'
import { w3cwebsocket as W3CWebSocket } from "websocket";


const usuarios = ['Javi', 'Guille', 'Gustavo', 'Uri']
const my_user = 'Javi'

let cards = [
    'guard','guard','guard','guard',
    'guard','priest','priest','baron',
    'baron','handmaid', 'handmaid','prince',
    'prince','king','countess','princess'
]

export default class Game extends React.Component {
	constructor (props) {
		super(props)

		this.state = {
			show: true,
			my_cards: []
		}
		this.close = this.close.bind(this)
		this.getNewCard = this.getNewCard.bind(this)
	}

	close () {
		this.setState({
			show: false
		})
	}

	componentDidMount() {
		console.log(this.props.location.state.username);
		console.log(this.props.location.state.puerto);
		this.getNewCard()
	}

	getNewCard() {
		const item = cards[Math.floor(Math.random() * cards.length)];
		cards.splice(cards.indexOf(item), 1)

		const temp_card = this.state.my_cards
		temp_card.push({
			is_enable: true,
			name: item,
		})

		this.setState({
			my_cards: temp_card
		})
		console.log(this.state.my_cards)
		this.checkMyCards()
	}

	checkMyCards() {
		let tmp_cards = this.state.my_cards
		tmp_cards[0].is_enable = false

		this.setState({
			my_cards: tmp_cards
		})
	}

	useCard() {

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
					<Button onClick={this.getNewCard}>
						Recibir carta
					</Button>
					{/* <Card name='priest' cardImagen='priest' me={true} users={usuarios} my_user={my_user} />
					<Card name='baron' cardImagen='baron' me={true} users={usuarios} my_user={my_user} />
					<Card name='handmaid' cardImagen='handmaid' me={true} users={usuarios} my_user={my_user} />
					<Card name='prince' cardImagen='prince' me={true} users={usuarios} my_user={my_user} />
					<Card name='king' cardImagen='king' me={true} users={usuarios} my_user={my_user} />
					<Card name='countess' cardImagen='countess' me={true} users={usuarios} my_user={my_user} />
					<Card name='princess' cardImagen='princess' me={true} users={usuarios} my_user={my_user} /> */}
				</div>
				<div className='spot-organization-horizontal'>
					<div className='player-spot-vertical'>
						<div className='player-2'>
							<Card name = 'player2' cardImagen= 'unknown-card' enable={true} />
						</div>
					</div>
					<div className='player-spot-vertical'>
						<div className='player-4'>
							<Card name = 'player4' cardImagen= 'unknown-card' enable={true} />
						</div>
					</div>
				</div>
				<div className='player-spot-horizontal'>
					<div className='player-3'>
						<Card name = 'player3' cardImagen= 'unknown-card' enable={true} />
					</div>
				</div>


				<Modal show={show}>
					<Modal.Header closeButton={false}>
						<Modal.Title>¿Todos los jugadores están unidos?</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div style={{ textAlign: 'center' }}>
							<Loader size="md" />
						</div>
					</Modal.Body>
					<Modal.Footer>
						<div className='modal-buttons'>
							<Button onClick={this.close} color="green" block>
								Play
							</Button>
						</div>
					</Modal.Footer>
				</Modal>
			</div>
		)
	}
}