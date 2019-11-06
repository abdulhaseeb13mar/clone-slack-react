import React from "react";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

class MessagesHeader extends React.Component {
  render() {
    return (
      <Segment clearing>
        {/* Channel Title */}
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {this.props.channelName}
            {!this.props.isPrivateChannel && (
              <Icon
                name={this.props.isChannelStarred ? "star" : "star outline"}
                onClick={this.props.handleStar}
                color={this.props.isChannelStarred ? "yellow" : "black"}
              />
            )}
          </span>
          <Header.Subheader>
            {this.props.numUser
              ? this.props.numUser === 1
                ? `${this.props.numUser} User`
                : `${this.props.numUser} Users`
              : "No User"}
          </Header.Subheader>
        </Header>
        {/* Channel Search Input */}
        <Header floated="right">
          <Input
            loading={this.props.searchLoading}
            size="mini"
            onChange={this.props.handleSearchChange}
            icon="search"
            name="searchTerm"
            placeholder="Search Messages"
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;
