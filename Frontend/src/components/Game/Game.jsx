import React from 'react'
import './Game.scss'

import { Modal, Loader, Button } from 'rsuite'
import Card from '../Card/Card.jsx'


const usuarios = ['Javi', 'Guille', 'Gustavo', 'Uri']
const my_user = 'Javi'
export default class Game extends React.Component {
	constructor (props) {
		super(props)

		this.state = {
			show: true,
			block: true,
			my_cards: [],
			discarded_cards: []
		}

		this.close = this.close.bind(this)
	}

	close () {
		this.setState({
			show: false
		})
	}

	componentDidMount() {
		console.log(this.props.location.state.client)
	}

	handleClick(){
	//		this.state.discarded_cards.push(this.Card)
	}

	render() {
		const { show, my_cards } = this.state
		return (
            <div className='background-wood spot-organization-vertical max-height'>
				<div className='player-spot-horizontal'>
					<Card name='guard' cardImagen='guard' me={true} users={usuarios} my_user={my_user} />
					{/* <Button onClick={this.close} color="green" block>
						Recibir carta
					</Button> */}
					{ <Card name='priest' cardImagen='priest' me={true} users={usuarios} my_user={my_user}/>
					/*<Card name='baron' cardImagen='baron' me={true} users={usuarios} my_user={my_user} />
					<Card name='handmaid' cardImagen='handmaid' me={true} users={usuarios} my_user={my_user} />
					<Card name='prince' cardImagen='prince' me={true} users={usuarios} my_user={my_user} />
					<Card name='king' cardImagen='king' me={true} users={usuarios} my_user={my_user} />
					<Card name='countess' cardImagen='countess' me={true} users={usuarios} my_user={my_user} />
					<Card name='princess' cardImagen='princess' me={true} users={usuarios} my_user={my_user} /> */}
				</div>
				<div className='spot-organization-horizontal'>
					<div className='player-spot-vertical-left'>
						<div className='player-2'>
							<Card name = 'player2' cardImagen= 'unknown-card' me={false} />
						</div>
						<div className='player-2-card-2'>
							<Card name = 'player2' cardImagen= 'unknown-card' me={false} />
						</div>
						<div className='discard-pile-player-2'>
							<Card name = 'player2' cardImagen= 'guard' />							
						</div>
					</div>
					<div className='player-spot-vertical-right'>
						<div className='discard-pile-player-4'>
							<Card name = 'player4' cardImagen= 'priest' />
						</div>
						<div className='player-4-card-2'>
							<Card name = 'player4' cardImagen= 'unknown-card' />
						</div>
						<div className='player-4'>
							<Card name = 'player4' cardImagen= 'unknown-card' />
						</div>
					</div>
				</div>
				<div className='player-spot-horizontal-top'>
					<div className='discard-pile-player-3'> 
						<Card name = 'player3' cardImagen= 'prince' />
					</div>
					<div className='player-3-card-2'>
						<Card name = 'player3' cardImagen= 'unknown-card' />
					</div>
					<div className='player-3'>
						<Card name = 'player3' cardImagen= 'unknown-card' />
					</div>
				</div>

				<div className='center-pile-cards'>
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