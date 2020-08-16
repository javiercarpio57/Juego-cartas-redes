import React from 'react'
import { Modal, Button } from 'rsuite'

export default class _7_Countess extends React.Component {
	constructor(props){
        super(props);
        this.state = {
            show: true,
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

    play(me) {
        const play = `jugar|${me}|princess|${me}`
		this.props.jugarCarta('princess', play)
        this.close()
    }
	
	render(){
        const { my_user } = this.props
		return (
            <Modal show={this.state.show} onHide={this.close} onExited={this.close} size='xs' keyboard>
                <Modal.Header>
                    <div style={{ textAlign: 'center' }}>
                        <Modal.Title>PRINCESS</Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    ¿Quieres jugar la carta de Princess?
                </Modal.Body>
                <Modal.Footer>
                    <div className='modal-buttons'>
                    <Button onClick={this.close} color="red">
                            Cancel
                        </Button>
                        <Button onClick={() => this.play(my_user)} color="green">
                            Do it!
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
		)
	}
}