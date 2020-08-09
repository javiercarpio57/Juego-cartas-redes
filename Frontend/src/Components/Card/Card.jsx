import React from 'react'
import _1_Guard from '../_1_Guard/_1_Guard.jsx'
import _2_Priest from '../_2_Priest/_2_Priest.jsx'

export default class Card extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			playingCard: null
		}
	}

	chooseCard(name, me) {
		if (me) {
			this.setState({
				playingCard: name
			})
		}
	}

	playGuard(usuario_seleccionado, carta_seleccionada) {
		console.log('GUARD:', usuario_seleccionado, carta_seleccionada)
	}

	playPriest(usuario_seleccionado) {
		console.log('PRIEST:', usuario_seleccionado)
	}
	
	render(){
		const { name, cardImagen, me, users, my_user } = this.props

		return (
			<div>
				<div className={cardImagen} onClick={() => this.chooseCard(name, me)} />
				{
					this.state.playingCard === 'guard'
						?
					<_1_Guard handleClose={() => this.setState({ playingCard: null })}
							  my_user={my_user}
							  users={users}
							  onPlay={this.playGuard}
					/>
						:
					this.state.playingCard === 'priest'
						?
					<_2_Priest handleClose={() => this.setState({ playingCard: null })}
						my_user={my_user}
						users={users}
						onPlay={this.playPriest}
			  		/>
						:
					null
				}
			</div>
		)
	}
}