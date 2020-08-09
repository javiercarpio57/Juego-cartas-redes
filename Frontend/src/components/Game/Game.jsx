import React from 'react'

import { Modal, Loader, Button } from 'rsuite'

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
            <div className='background-wood'>
				

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