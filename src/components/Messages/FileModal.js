import React from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime from "mime-types";

class FileModal extends React.Component {
  state = {
    file: null,
    authorized: ["image/jpeg", "image/png", "image/jpg"]
  };

  addFile = event => {
    const file = event.target.files[0];
    if (file) {
      this.setState({ file: file });
    }
  };

  sendFile = () => {
    if (this.state.file !== null) {
      if (this.isAuthorized(this.state.file.name)) {
        const metadata = { contentType: mime.lookup(this.state.file.name) };
        this.props.uploadFile(this.state.file, metadata);
        this.props.closeModal();
        this.clearFile();
      }
    }
  };

  isAuthorized = filename =>
    this.state.authorized.includes(mime.lookup(filename));

  clearFile = () => this.setState({ file: null });

  render() {
    return (
      <Modal basic open={this.props.modal} onClose={this.props.closeModal}>
        <Modal.Header>Select an Image File</Modal.Header>
        <Modal.Content>
          <Input
            onChange={this.addFile}
            fluid
            label="File types: jpg, png"
            name="file"
            type="file"
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.sendFile} color="green" inverted>
            <Icon name="checkmark" /> Send
          </Button>
          <Button color="red" inverted onClick={this.props.closeModal}>
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FileModal;
