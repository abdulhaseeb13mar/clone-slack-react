import React from "react";
import {
  Segment,
  Accordion,
  Header,
  Icon,
  Image,
  List
} from "semantic-ui-react";
import firebase from "../../firebase";

class MetaPanel extends React.Component {
  state = {
    channelUsersRef: firebase.database().ref("channelUsers"),
    channel: this.props.currentChannel,
    activeIndex: 0,
    privateChannel: this.props.isPrivateChannel,
    orderedUser: [],
    userRef: firebase.auth().currentUser
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  setActiveIndex = (event, titleProps, activeIndex) => {
    const { index } = titleProps;
    if (index === 1 && activeIndex !== 1) {
      this.calculateTopPoster();
    }
    const newIndex = this.state.activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  calculateTopPoster = () => {
    this.state.channelUsersRef
      .child(this.state.channel.id)
      .once("value")
      .then(snap => {
        const channelUsers = Object.entries(snap.val());
        channelUsers.sort((a, b) => b[1]["count"] - a[1]["count"]);
        this._isMounted &&
          this.setState({
            orderedUser: channelUsers
          });
      });
  };

  formatCount = num => (num > 1 || num === 0 ? `${num} posts` : `${num} post`);

  renderTopUsers = () => {
    return this.state.orderedUser
      .map((channelUser, key) => {
        if (this.state.userRef.uid === channelUser[1].id) {
          channelUser[1].avatar = this.state.userRef.photoURL;
        }
        return (
          <List.Item key={key}>
            {/* <Image avatar src={channelUser[1].avatar} /> */}
            {/* <List.Content> */}
            <List.Header as="a">{channelUser[1].name}</List.Header>
            <List.Description>
              {this.formatCount(channelUser[1].count)}
            </List.Description>
            {/* </List.Content> */}
          </List.Item>
        );
      })
      .slice(0, 5);
  };

  render() {
    if (this.state.privateChannel) return null;

    return (
      <Segment loading={!this.state.channel}>
        <Header as="h3" attached="top">
          {this.state.channel && this.state.channel.name}
        </Header>

        <Accordion styled attached="true">
          <Accordion.Title
            active={this.state.activeIndex === 0}
            index={0}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="info" />
            channel Details
          </Accordion.Title>
          <Accordion.Content active={this.state.activeIndex === 0}>
            {this.state.channel && this.state.channel.details}
          </Accordion.Content>

          <Accordion.Title
            active={this.state.activeIndex === 1}
            index={1}
            onClick={(e, t) =>
              this.setActiveIndex(e, t, this.state.activeIndex)
            }
          >
            <Icon name="dropdown" />
            <Icon name="user circle" />
            Top Posters
          </Accordion.Title>
          <Accordion.Content active={this.state.activeIndex === 1}>
            <List>{this.renderTopUsers()}</List>
          </Accordion.Content>

          <Accordion.Title
            active={this.state.activeIndex === 2}
            index={2}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="pencil alternate" />
            Created By
          </Accordion.Title>
          <Accordion.Content active={this.state.activeIndex === 2}>
            <Header as="h3">
              <Image
                circular
                src={this.state.channel && this.state.channel.createdBy.avatar}
              />
              {this.state.channel && this.state.channel.createdBy.name}
            </Header>
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}

export default MetaPanel;
