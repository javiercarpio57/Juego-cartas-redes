import React from 'react'
import { Modal, Button } from 'rsuite'

export default class _4_Handmaid extends React.Component {
	constructor(props){
        super(props);
        this.state = {
            show: true
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
        this.props.onPlay()
        this.close()
    }
	
	render(){
		return (
            <Modal show={this.state.show} onHide={this.close} onExited={this.close} size='xs' keyboard>
                <Modal.Header>
                    <div style={{ textAlign: 'center' }}>
                        <Modal.Title>HANDMAID</Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    ¿Quieres jugar la carta de Handmaid?
                </Modal.Body>
                <Modal.Footer>
                    <div className='modal-buttons'>
                        <Button onClick={this.close} color="red">
                            Cancel
                        </Button>
                        <Button onClick={this.play} color="green">
                            Do it!
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
		)
	}
}