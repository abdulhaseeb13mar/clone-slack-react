import React from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";
import { connect } from "react-redux";
import { setChannelUsers } from "../../actions/index";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

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
    // user: this.props.currentUser,
    user: firebase.auth().currentUser,
    errors: [],
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
    globalMessageCounter: 0,
    typingRef: firebase.database().ref("typing"),
    typingUsers: [],
    connectedRef: firebase.database().ref(".info/connected"),
    channelUsersAvatars: {}
  };

  componentDidMount() {
    this._isMounted = true;
    if (this.state.channel && this.state.user) {
      this.addListener(this.state.channel.id);
      this.addUserStarsListener(this.state.channel.id, this.state.user.uid);
      if (!this.state.privateChannel) {
        this.addCounterListener();
      } else {
        if (this.state.channel) {
          this.getTheUserAvatars(this.state.channel.id);
        }
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.state.channelUsersRef.off();
    this.state.messagesRef.off();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.messageEnd) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.messageEnd.scrollIntoView({ behavior: "smooth" });
  };

  addCounterListener = () => {
    this.state.channelUsersRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .once("value")
      .then(data => {
        if (data.val() !== null) {
          this._isMounted &&
            this.setState({
              globalMessageCounter: data.val().count
            });
        }
      });
  };

  addListener = channelId => {
    this.addMessageListener(channelId);
    this.addTypingListener(channelId);
    if (!this.state.privateChannel) {
      this.addUserListener(channelId);
    }
  };

  addTypingListener = channelId => {
    let typingUsers = [];
    this.state.typingRef.child(channelId).on("child_added", snap => {
      if (snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        });
        this.setState({ typingUsers });
      }
    });

    this.state.typingRef.child(channelId).on("child_removed", snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key);
      if (index !== -1) {
        typingUsers = typingUsers.filter(user => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });

    this.state.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove(err => {
            if (err !== null) {
              console.error(err);
            }
          });
      }
    });
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

  getTheUserAvatars = id => {
    if (this.state.privateChannel) {
      id = id.split("/")[1];
    }
    let channelUsersAvatars = [];
    this.state.usersRef
      .child(id)
      .once("value")
      .then(data => {
        channelUsersAvatars.push(data.val().avatar);
        this.setState({
          channelUsersAvatars: {
            ...this.state.channelUsersAvatars,
            [id]: data.val().avatar
          }
        });
      });
  };

  addUserListener = channelId => {
    let loadedUsers = [];
    this.state.channelUsersRef.child(channelId).on("child_added", snap => {
      loadedUsers.push(snap.val());

      this.getTheUserAvatars(snap.val().id);

      this._isMounted &&
        this.setState({
          channelUsers: loadedUsers,
          channelUsersLoading: false,
          uniqueUsers: loadedUsers.length
        });
    });
    if (this.state.channelUsers.length > 0) {
      this.fetchChannelUsersAvatars(this.state.channelUsers);
    }
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    if (this.state.privateChannel && this.state.messagesLoading) {
      this.setState({ messagesLoading: false });
    }
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
    if (
      !this.state.channelUsers.some(
        channelUser => channelUser.id === this.state.user.uid
      )
    ) {
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
        channelUsersAvatars={this.state.channelUsersAvatars}
      />
    ));

  displayChannelName = channel =>
    channel ? `${this.state.privateChannel ? "@" : "#"}${channel.name}` : "";

  displayTypingUsers = users =>
    users.length > 0 &&
    users.map(user => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "0.2em"
        }}
        key={user.id}
      >
        <span className="user__typing">{user.name} is typing</span> <Typing />
      </div>
    ));

  displayMessageSkeleton = loading =>
    loading ? (
      <React.Fragment>
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null;

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
            {this.displayMessageSkeleton(this.state.messagesLoading)}
            {this.state.searchTerm
              ? this.displayMessages(this.state.searchResults)
              : this.displayMessages(this.state.messages)}
            {this.displayTypingUsers(this.state.typingUsers)}
            <div ref={node => (this.messageEnd = node)}></div>
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={this.state.messagesRef}
          currentChannel={this.state.channel}
          currentUser={this.state.user}
          checkUniqueUser={this.checkUniqueUser}
          isPrivateChannel={this.state.privateChannel}
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
