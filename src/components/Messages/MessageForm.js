import React from "react";
import uuidv4 from "uuid/v4";
import firebase from "../../firebase";
import { Segment, Button, Input } from "semantic-ui-react";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
class MessageForm extends React.Component {
  state = {
    storageRef: firebase.storage().ref(),
    uploadTask: null,
    typingRef: firebase.database().ref("typing"),
    uploadState: "",
    percentUploaded: 0,
    message: "",
    loading: false,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    errors: [],
    modal: false,
    emojiPicker: false
  };

  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
  }

  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleKeyDown = event => {
    if (event.keyCode === 13) {
      this.sendMessage();
    }
    if (this.state.message) {
      this.state.typingRef
        .child(this.state.channel.id)
        .child(this.state.user.uid)
        .set(this.state.user.displayName);
    } else {
      this.state.typingRef
        .child(this.state.channel.id)
        .child(this.state.user.uid)
        .remove();
    }
  };

  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };

  handleAddEmoji = emoji => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons}`);
    this.setState({ message: newMessage, emojiPicker: false });
    setTimeout(() => {
      this.messageInputRef.focus();
    }, 0);
  };

  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };

  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL
      }
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };

  sendMessage = () => {
    if (this.state.message) {
      this.setState({ loading: true });
      this.props
        .getMessagesRef()
        .child(this.state.channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
          this.state.typingRef
            .child(this.state.channel.id)
            .child(this.state.user.uid)
            .remove();
        })
        .catch(err => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        });
      if (this.state.errors.length === 0 && !this.props.isPrivateChannel) {
        this.props.checkUniqueUser();
      } else {
        console.log(this.state.errors);
      }
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a message" })
      });
    }
  };

  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private/${this.state.channel.id}`;
    } else {
      return "chat/public";
    }
  };

  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          err => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadUrl => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch(err => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
    if (this.state.errors.length === 0 && !this.props.isPrivateChannel) {
      this.props.checkUniqueUser();
    } else {
      console.log(this.state.errors);
    }
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: "done" });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err)
        });
      });
  };

  render() {
    return (
      <Segment className="message__form">
        {this.state.emojiPicker && (
          <Picker
            set="messenger"
            className="emojiPicker"
            title="Pick your emoji"
            emoji="point_up"
            onSelect={this.handleAddEmoji}
          />
        )}
        <Input
          fluid
          name="message"
          onChange={this.handleChange}
          value={this.state.message}
          onKeyDown={this.handleKeyDown}
          ref={node => (this.messageInputRef = node)}
          style={{ marginBottom: "0.7em" }}
          label={
            <Button
              icon={this.state.emojiPicker ? "close" : "smile outline"}
              content={this.state.emojiPicker ? "close" : null}
              onClick={this.handleTogglePicker}
            />
          }
          labelPosition="left"
          placeholder="Write your message"
          className={
            this.state.errors.some(error => error.message.includes("message"))
              ? "error"
              : ""
          }
        />
        <Button.Group icon widths="2">
          <Button
            onClick={this.sendMessage}
            color="orange"
            disabled={this.state.loading}
            content="Add reply"
            labelPosition="left"
            icon="edit"
          />

          <Button
            color="teal"
            onClick={this.openModal}
            disabled={this.state.uploadState === "uploading"}
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
        <FileModal
          modal={this.state.modal}
          uploadFile={this.uploadFile}
          closeModal={this.closeModal}
        />
        <ProgressBar
          uploadState={this.state.uploadState}
          percentUploaded={this.state.percentUploaded}
        />
      </Segment>
    );
  }
}

export default MessageForm;
