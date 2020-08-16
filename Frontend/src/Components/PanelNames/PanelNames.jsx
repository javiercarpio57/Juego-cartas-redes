import React from 'react'
import Coin_LL from '../Coin_LL/Coin_LL.jsx'
import { Popover, Message, IconButton, Icon } from 'rsuite'
import './style.scss'

export default class Card extends React.Component {

    GetCoins(num) {
        const coins = []
        for (let i = 0; i < num; i++) {
            coins.push (<Coin_LL />)
        }
        return coins
    }

	render() {
        const { names, pivot, jugador1_alive, jugador2_alive, jugador3_alive, jugador4_alive,
                my_points, points_j2, points_j3, points_j4, player_turn } = this.props
        const my_pos = names.indexOf(pivot)

        const styles = {
            fontStyle: 'italic',
            fontFamily: 'Snell Roundhand'
        }
        const titulo = `Turno de ${player_turn}`

		return (
			<div className='panel-names'>
                <div className='spot-organization-vertical max-height'>
                    <div className='player1 put-color'>
                        <p key={names[my_pos] + '_' + my_pos}>{names[my_pos]}</p>
                        {
                            this.GetCoins(my_points)
                        }
                    </div>

                    <div className='spot-organization-horizontal'>
                        <div className='player2 put-color'>
                            <p key={names[(my_pos + 1) % 4] + '_' + (my_pos + 1) % 4}>{names[(my_pos + 1) % 4]}</p>
                            {
                                this.GetCoins(points_j2)
                            }
                        </div>
                        <div className='player4 put-color'>
                            <p key={names[(my_pos + 3) % 4] + '_' + (my_pos + 3) % 4}>{names[(my_pos + 3) % 4]}</p>
                            {
                                this.GetCoins(points_j4)
                            }
                        </div>
                    </div>

                    <div className='player3 put-color'>
                        <p key={names[(my_pos + 2) % 4] + '_' + (my_pos + 2) % 4}>{names[(my_pos + 2) % 4]}</p>
                        {
                            this.GetCoins(points_j3)
                        }
                    </div>
                </div>

                {
                    !jugador1_alive
                        ?
                    <div className='eliminado-j1'>
                        <Message showIcon type='error' description='Has sido eliminado' />
                    </div>
                        :
                    null
                }

                {
                    !jugador2_alive
                        ?
                    <div className='eliminado-j2'>
                        <Message showIcon type='error' description='Jugador 2 ha sido eliminado' />
                    </div>
                        :
                    null
                }

                {
                    !jugador3_alive
                        ?
                    <div className='eliminado-j3'>
                        <Message showIcon type='error' description='Jugador 3 ha sido eliminado' />
                    </div>
                        :
                    null
                }

                {
                    !jugador4_alive
                        ?
                    <div className='eliminado-j4'>
                        <Message showIcon type='error' description='Jugador 4 ha sido eliminado' />
                    </div>
                        :
                    null
                }

                {
                    player_turn
                        ?
                    <Popover visible style={{ margin: '15px' }}>
                        <h4 style={styles}>{titulo}</h4>
                    </Popover>
                        :
                    null
                }

                <div className='help-btn'>
                    <IconButton size='lg' color="cyan" circle icon={<Icon icon='question' />} />
                </div>
            </div>
		)
	}
}