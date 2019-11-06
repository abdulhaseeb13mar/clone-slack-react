import React from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";
import { connect } from "react-redux";
import { setChannelUsers } from "../../actions/index";

class Messages extends React.Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref("privateMessages"),
    messagesRef: firebase.database().ref("messages"),
    channelUsersRef: firebase.database().ref("channelUsers"),
    usersRef: firebase.database().ref("users"),
    messages: [],
    messagesLoading: true,
    channelUsersLoading: true,
    channelUsers: [],
    isChannelStarred: false,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    errors: [],
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
    globalMessageCounter: 0
  };

  componentDidMount() {
    this._isMounted = true;
    if (this.state.channel && this.state.user) {
      this.addListener(this.state.channel.id);
      this.addUserStarsListener(this.state.channel.id, this.state.user.uid);
      this.addCounterListener();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.state.channelUsersRef.off();
    this.state.messagesRef.off();
  }

  addCounterListener = () => {
    this.state.channelUsersRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .once("value")
      .then(data => {
        this._isMounted &&
          this.setState({
            globalMessageCounter: data.val().count
          });
      });
  };

  addListener = channelId => {
    this.addMessageListener(channelId);
    if (!this.state.privateChannel) {
      this.addUserListener(channelId);
    }
  };

  addUserStarsListener = (channelId, userId) => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .once("value")
      .then(data => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this._isMounted && this.setState({ isChannelStarred: prevStarred });
        }
      });
  };

  addUserListener = channelId => {
    let loadedUsers = [];
    this.state.channelUsersRef.child(channelId).on("child_added", snap => {
      loadedUsers.push(snap.val());
      this._isMounted &&
        this.setState({
          channelUsers: loadedUsers,
          channelUsersLoading: false,
          uniqueUsers: loadedUsers.length
        });
    });
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this._isMounted &&
        this.setState({
          messages: loadedMessages,
          messagesLoading: false
        });
    });
  };

  getMessagesRef = () => {
    return this.state.privateChannel
      ? this.state.privateMessagesRef
      : this.state.messagesRef;
  };

  handleStar = () => {
    this.setState(
      prevState => ({
        isChannelStarred: !prevState.isChannelStarred
      }),
      () => this.starChannel()
    );
  };

  starChannel = () => {
    if (this.state.isChannelStarred) {
      this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,
          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar
          }
        }
      });
    } else {
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove(err => {
          if (err !== null) {
            console.error(err);
          }
        });
    }
  };

  handleSearchChange = event => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (message.content.match(regex) || message.user.name.match(regex)) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => {
      this._isMounted && this.setState({ searchLoading: false });
    }, 1000);
  };

  checkUniqueUser = () => {
    console.log("check unique user chalra");

    if (
      !this.state.channelUsers.some(
        channelUser => channelUser.id === this.state.user.uid
      )
    ) {
      console.log("if chalra");

      this.state.channelUsersRef
        .child(this.state.channel.id)
        .child(this.state.user.uid)
        .set({
          id: this.state.user.uid,
          name: this.state.user.displayName,
          avatar: this.state.user.photoURL,
          count: 1
        })
        .then(() => {
          this.props.setChannelUsers(this.state.channelUsers);
        })
        .catch(err => {
          this._isMounted &&
            this.setState({
              channelUsersLoading: false,
              errors: this.state.errors.concat(err)
            });
        });
    } else {
      this.state.channelUsersRef
        .child(this.state.channel.id)
        .child(this.state.user.uid)
        .update({ count: this.state.globalMessageCounter + 1 });

      this.setState({
        globalMessageCounter: this.state.globalMessageCounter + 1
      });
    }
  };

  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  displayChannelName = channel =>
    channel ? `${this.state.privateChannel ? "@" : "#"}${channel.name}` : "";

  render() {
    return (
      <React.Fragment>
        <MessagesHeader
          numUser={this.state.uniqueUsers}
          channelName={this.displayChannelName(this.state.channel)}
          handleSearchChange={this.handleSearchChange}
          searchLoading={this.state.searchLoading}
          isPrivateChannel={this.state.privateChannel}
          handleStar={this.handleStar}
          isChannelStarred={this.state.isChannelStarred}
        />

        <Segment>
          <Comment.Group className="messages">
            {this.state.searchTerm
              ? this.displayMessages(this.state.searchResults)
              : this.displayMessages(this.state.messages)}
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={this.state.messagesRef}
          currentChannel={this.state.channel}
          currentUser={this.state.user}
          checkUniqueUser={this.checkUniqueUser}
          isPrivateChannel={this.isPrivateChannel}
          getMessagesRef={this.getMessagesRef}
          countMessages={this.countMessages}
        />
      </React.Fragment>
    );
  }
}

export default connect(
  null,
  { setChannelUsers }
)(Messages);
