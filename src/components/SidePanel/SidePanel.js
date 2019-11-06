import React from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";

class SidePanel extends React.Component {
  render() {
    return (
      <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{ background: this.props.primaryColor, fontSize: "1.2rem" }}
      >
        <UserPanel
          primaryColor={this.props.primaryColor}
          currentUser={this.props.currentUser}
        />
        <Starred currentUser={this.props.currentUser} />
        <Channels currentUser={this.props.currentUser} />
        <DirectMessages currentUser={this.props.currentUser} />
      </Menu>
    );
  }
}

export default SidePanel;
