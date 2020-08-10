import React from 'react'
import _1_Guard from '../_1_Guard/_1_Guard.jsx'
import _2_Priest from '../_2_Priest/_2_Priest.jsx'
import _3_Baron from '../_3_Baron/_3_Baron.jsx'
import _4_Handmaid from '../_4_Handmaid/_4_Handmaid.jsx'
import _5_Prince from '../_5_Prince/_5_Prince.jsx'
import _6_King from '../_6_King/_6_King.jsx'
import _7_Countess from '../_7_Countess/_7_Countess.jsx'
import _8_Princess from '../_8_Princess/_8_Princess.jsx'

var discardedCards = []

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
		discardedCards.push(this.props)
	}

	playGuard(usuario_seleccionado, carta_seleccionada) {
		console.log('GUARD:', usuario_seleccionado, carta_seleccionada)
	}

	playPriest(usuario_seleccionado) {
		console.log('PRIEST:', usuario_seleccionado)
	}

	playBaron(usuario_seleccionado) {
		console.log('BARON:', usuario_seleccionado)
	}

	playHandmaid() {
		console.log('HANDMAID')
	}
	
	playPrince(usuario_seleccionado) {
		console.log('PRINCE:', usuario_seleccionado)
	}

	playKing(usuario_seleccionado) {
		console.log('KING:', usuario_seleccionado)
	}

	playCountess() {
		console.log('COUNTESS')
	}

	playPrincess() {
		console.log('PRINCESS')
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
					this.state.playingCard === 'baron'
						?
					<_3_Baron handleClose={() => this.setState({ playingCard: null })}
						my_user={my_user}
						users={users}
						onPlay={this.playBaron}
			  		/>
						:
					this.state.playingCard === 'handmaid'
						?
					<_4_Handmaid handleClose={() => this.setState({ playingCard: null })}
						my_user={my_user}
						users={users}
						onPlay={this.playHandmaid}
			  		/>
						:
					this.state.playingCard === 'prince'
						?
					<_5_Prince handleClose={() => this.setState({ playingCard: null })}
						users={users}
						onPlay={this.playPrince}
			  		/>
						:
					this.state.playingCard === 'king'
						?
					<_6_King handleClose={() => this.setState({ playingCard: null })}
						my_user={my_user}
						users={users}
						onPlay={this.playKing}
			  		/>
						:
					this.state.playingCard === 'countess'
						?
					<_7_Countess handleClose={() => this.setState({ playingCard: null })}
						onPlay={this.playCountess}
			  		/>
						:
					this.state.playingCard === 'princess'
						?
					<_8_Princess handleClose={() => this.setState({ playingCard: null })}
						onPlay={this.playPrincess}
			  		/>
						:
					null
				}
			</div>
		)
	}
}