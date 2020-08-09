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
			show: true
		}
		this.close = this.close.bind(this)
	}

	close () {
		this.setState({
			show: false
		})
	}

	render() {
		const { show } = this.state
		return (
            <div className='background-wood spot-organization-vertical max-height'>
				<div className='player-spot-horizontal'>
					<Card name='guard' cardImagen='guard' me={true} users={usuarios} my_user={my_user} />
					<Card name='priest' cardImagen='priest' me={true} users={usuarios} my_user={my_user} />
				</div>
				<div className='spot-organization-horizontal'>
					<div className='player-spot-vertical'>
						<div className='player-2'>
							<Card name = 'player2' cardImagen= 'unknown-card' me={false} />
						</div>
					</div>
					<div className='player-spot-vertical'>
						<div className='player-4'>
							<Card name = 'player4' cardImagen= 'unknown-card' />
						</div>
					</div>
				</div>
				<div className='player-spot-horizontal'>
					<div className='player-3'>
						<Card name = 'player3' cardImagen= 'unknown-card' />
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