import { Modal } from 'rsuite';

class Confirm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        show: false
      };
      this.close = this.close.bind(this);
      this.open = this.open.bind(this);
    }
    close() {
      this.setState({ show: false });
    }
    open() {
      this.setState({ show: true });
    }
    render() {
      return (
        <div className="modal-container">
          <ButtonToolbar>
            <Button onClick={this.open}>Play</Button>
          </ButtonToolbar>
  
          <Modal backdrop="static" show={this.state.show} onHide={this.close} size="xs">
            <Modal.Body>
              <Icon
                icon="remind"
                style={{
                  color: '#ffb300',
                  fontSize: 24
                }}
              />
              {'  '}
              
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.close} appearance="primary">
                Ok
              </Button>
              <Button onClick={this.close} appearance="subtle">
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }
  
  ReactDOM.render(<Confirm />);