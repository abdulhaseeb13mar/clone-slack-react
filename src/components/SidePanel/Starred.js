import React from "react";
import { Menu, Icon } from "semantic-ui-react";
import { setCurrentChannel, setPrivateChannel } from "../../actions/index";
import { connect } from "react-redux";
import firebase from "../../firebase";

class Starred extends React.Component {
  state = {
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    starredChannels: [],
    activeChannel: ""
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }

  addListeners = userId => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_added", snap => {
        const starredChannel = { id: snap.key, ...snap.val() };
        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel]
        });
      });

    this.state.usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", snap => {
        const channelToRemove = { id: snap.key, ...snap.val() };
        console.log(channelToRemove);

        const filteredChannels = this.state.starredChannels.filter(channel => {
          return channel.id !== channelToRemove.id;
        });
        console.log(filteredChannels);

        this.setState({ starredChannels: filteredChannels });
      });
  };

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
  };

  displayChannels = starredChannels =>
    starredChannels.length > 0 &&
    starredChannels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        # {channel.name}
      </Menu.Item>
    ));

  setActiveChannel = channel => {
    this.setState({ activeChannel: channel.id });
  };

  render() {
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> STARRED
          </span>{" "}
          ({this.state.starredChannels.length}){" "}
        </Menu.Item>
        {this.displayChannels(this.state.starredChannels)}
      </Menu.Menu>
    );
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Starred);
