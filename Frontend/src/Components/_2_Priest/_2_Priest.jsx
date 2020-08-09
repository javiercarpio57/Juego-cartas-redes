import React from 'react'
import { Modal, SelectPicker, Button, Form, FormGroup, FormControl, ControlLabel } from 'rsuite'

const cards = [
    {
        label: 'Priest',
        value: 'Priest'
    },
    {
        label: 'Baron',
        value: 'Baron'
    },
    {
        label: 'Handmaid',
        value: 'Handmaid'
    },
    {
        label: 'Prince',
        value: 'Prince'
    },
    {
        label: 'King',
        value: 'King'
    },
    {
        label: 'Countess',
        value: 'Countess'
    },
    {
        label: 'Princess',
        value: 'Princess'
    }
]
export default class _2_Priest extends React.Component {
	constructor(props){
        super(props);
        this.state = {
            show: true,
            selected: null,
            formValue: {
                'usuario_seleccionado': ''
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

    play() {
        this.props.onPlay(this.state.formValue.usuario_seleccionado, this.state.formValue.carta_seleccionada)
        this.close()
    }
	
	render(){
        const { my_user, users } = this.props

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
                        <Modal.Title>PRIEST</Modal.Title>
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
                            />
                        </FormGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <div className='modal-buttons'>
                        <Button onClick={this.close} color="red">
                            Cancel
                        </Button>
                        <Button onClick={this.play} color="green" 
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