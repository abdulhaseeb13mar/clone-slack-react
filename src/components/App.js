import React from "react";
import { Grid } from "semantic-ui-react";
import "./App.css";
import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";
import { connect } from "react-redux";

const App = props => (
  <Grid
    columns="equal"
    className="app"
    style={{ background: props.secondaryColor }}
  >
    <ColorPanel
      key={props.currentUser && props.currentUser.name}
      currentUser={props.currentUser}
    />
    <SidePanel
      key={props.currentUser && props.currentUser.uid}
      currentUser={props.currentUser}
      primaryColor={props.primaryColor}
    />
    <Grid.Column style={{ marginLeft: 320 }}>
      <Messages
        key={props.currentChannel && props.currentChannel.id}
        currentChannel={props.currentChannel}
        currentUser={props.currentUser}
        isPrivateChannel={props.isPrivateChannel}
      />
    </Grid.Column>
    <Grid.Column width={4}>
      <MetaPanel
        key={props.currentChannel && props.currentChannel.name}
        currentChannel={props.currentChannel}
        isPrivateChannel={props.isPrivateChannel}
      />
    </Grid.Column>
  </Grid>
);

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  primaryColor: state.colors.primaryColor,
  secondaryColor: state.colors.secondaryColor
});
export default connect(mapStateToProps)(App);
