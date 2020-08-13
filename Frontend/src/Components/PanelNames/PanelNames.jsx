import React from 'react'
import './style.scss'

export default class Card extends React.Component {
	render(){
        const { names, pivot } = this.props
        const my_pos = names.indexOf(pivot)
		return (
			<div className='panel-names'>
                <div className='spot-organization-vertical max-height'>
                    <div className='player1 put-color'>
                        <p key={names[my_pos] + '_' + my_pos}>{names[my_pos]}</p>
                    </div>

                    <div className='spot-organization-horizontal'>
                        <div className='player2 put-color'>
                            <p key={names[(my_pos + 1) % 4] + '_' + (my_pos + 1) % 4}>{names[(my_pos + 1) % 4]}</p>
                        </div>
                        <div className='player4 put-color'>
                            <p key={names[(my_pos + 3) % 4] + '_' + (my_pos + 3) % 4}>{names[(my_pos + 3) % 4]}</p>
                        </div>
                    </div>

                    <div className='player3 put-color'>
                        <p key={names[(my_pos + 2) % 4] + '_' + (my_pos + 2) % 4}>{names[(my_pos + 2) % 4]}</p>
                    </div>
                </div>
            </div>
		)
	}
}