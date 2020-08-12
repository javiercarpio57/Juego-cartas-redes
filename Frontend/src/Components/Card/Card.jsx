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

	chooseCard(name, me, enable) {
		if (me && enable) {
			this.setState({
				playingCard: name
			})
		}
		discardedCards.push(this.props)
	}

	render(){
		const { name, cardImagen, me, users, my_user, enable, jugarCarta } = this.props
		let css = ''
		if (enable) {
			css = `${cardImagen}`
		} else {
			css = `${cardImagen} disable-card`
		}
		return (
			<div>
				<div className={css} onClick={() => this.chooseCard(name, me, enable)} />
				{
					this.state.playingCard === 'guard'
						?
					<_1_Guard handleClose={() => this.setState({ playingCard: null })}
						my_user={my_user}
						users={users}
						jugarCarta={jugarCarta}
					/>
						:
					this.state.playingCard === 'priest'
						?
					<_2_Priest handleClose={() => this.setState({ playingCard: null })}
						my_user={my_user}
						users={users}
						jugarCarta={jugarCarta}
			  		/>
						:
					this.state.playingCard === 'baron'
						?
					<_3_Baron handleClose={() => this.setState({ playingCard: null })}
						my_user={my_user}
						users={users}
						jugarCarta={jugarCarta}
			  		/>
						:
					this.state.playingCard === 'handmaid'
						?
					<_4_Handmaid handleClose={() => this.setState({ playingCard: null })}
						my_user={my_user}
						users={users}
						jugarCarta={jugarCarta}
			  		/>
						:
					this.state.playingCard === 'prince'
						?
					<_5_Prince handleClose={() => this.setState({ playingCard: null })}
						my_user={my_user}
						users={users}
						jugarCarta={jugarCarta}
			  		/>
						:
					this.state.playingCard === 'king'
						?
					<_6_King handleClose={() => this.setState({ playingCard: null })}
						my_user={my_user}
						users={users}
						jugarCarta={jugarCarta}
			  		/>
						:
					this.state.playingCard === 'countess'
						?
					<_7_Countess handleClose={() => this.setState({ playingCard: null })}
						my_user={my_user}
						jugarCarta={jugarCarta}
			  		/>
						:
					this.state.playingCard === 'princess'
						?
					<_8_Princess handleClose={() => this.setState({ playingCard: null })}
						my_user={my_user}
						jugarCarta={jugarCarta}
			  		/>
						:
					null
				}
			</div>
		)
	}
}