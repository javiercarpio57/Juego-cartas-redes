import React from 'react'
import { Modal, SelectPicker, Button, Form, FormGroup, FormControl, ControlLabel } from 'rsuite'

const cards = [
    {
        label: 'Priest',
        value: 'Priest',
        cardValue: '2'
    },
    {
        label: 'Baron',
        value: 'Baron',
        cardValue: '3'
    },
    {
        label: 'Handmaid',
        value: 'Handmaid',
        cardValue: '4'
    },
    {
        label: 'Prince',
        value: 'Prince',
        cardValue: '5'
    },
    {
        label: 'King',
        value: 'King',
        cardValue: '6'
    },
    {
        label: 'Countess',
        value: 'Countess',
        cardValue: '7'
    },
    {
        label: 'Princess',
        value: 'Princess',
        cardValue: '8'
    }
]
const SIN_EFECTO = 'Jugar sin efecto'

export default class _1_Guard extends React.Component {
	constructor(props){
        super(props);
        this.state = {
            show: true,
            selected: null,
            formValue: {
                'usuario_seleccionado': '',
                'carta_seleccionada': ''
            }
        }
        this.close = this.close.bind(this)
        this.open = this.open.bind(this)
        this.play = this.play.bind(this)
    }

    componentDidMount() {
        this.open()
    }
    
    close() {
        this.setState({ show: false })
        this.props.handleClose()
    }

    open() {
        this.setState({ show: true })
    }

    play(m) {
        const carta = this.state.formValue.carta_seleccionada.toLowerCase()
        let play
        if (this.state.formValue.usuario_seleccionado === SIN_EFECTO) {
            play = `sinEfecto|${m}|guard`
        } else {
            play = `jugar|${m}|guard|${this.state.formValue.usuario_seleccionado}|${carta}`
        }
        this.props.jugarCarta('guard', play)
        this.close()
    }
	
	render(){
        const { my_user, users, disabled } = this.props

        const all_users = []
        for (let i = 0; i < users.length; i++) {
            if (my_user !== users[i]) {
                all_users.push({
                    label: users[i],
                    value: users[i]
                })
            }
        }

		return (
            <Modal show={this.state.show} onHide={this.close} onExited={this.close} size='xs' keyboard>
                <Modal.Header>
                    <div style={{ textAlign: 'center' }}>
                        <Modal.Title>GUARD</Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body>

                    <Form fluid formValue={this.state.formValue} onChange={formValue => this.setState({ formValue })}>
                        <FormGroup>
                            <ControlLabel>Escoge un usuario</ControlLabel>
                            <FormControl name='usuario_seleccionado'
                                        accepter={SelectPicker}
                                        data={all_users}
                                        style={{ width: '100%' }}
                                        placeholder='Escoge un usuario'
                                        disabledItemValues={disabled}
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Escoge una carta</ControlLabel>
                            <FormControl name='carta_seleccionada'
                                        accepter={SelectPicker}
                                        data={cards}
                                        style={{ width: '100%' }}
                                        placeholder='Escoge una carta'
                            />
                        </FormGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <div className='modal-buttons'>
                        <Button onClick={this.close} color="red">
                            Cancel
                        </Button>
                        <Button onClick={() => this.play(my_user)} color="green" 
                                disabled={this.state.formValue.carta_seleccionada === '' || this.state.formValue.usuario_seleccionado === ''}
                        >
                            Do it!
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
		)
	}
}