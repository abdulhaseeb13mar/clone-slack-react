import React from "react";
import { Comment, Image } from "semantic-ui-react";
import moment from "moment";

const isOwnMessage = (message, user) => {
  return message.user.id === user.uid ? "message__self" : "";
};

const isImage = message => {
  return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
};

const timeFromNow = timestamp => moment(timestamp).fromNow();

const Message = props => (
  <Comment>
    <Comment.Avatar src={props.message.user.avatar} />
    <Comment.Content className={isOwnMessage(props.message, props.user)}>
      <Comment.Author as="a">{props.message.user.name}</Comment.Author>
      <Comment.Metadata>
        {timeFromNow(props.message.timestamp)}
      </Comment.Metadata>
      {isImage(props.message) ? (
        <Image src={props.message.image} className="message__image" />
      ) : (
        <Comment.Text>{props.message.content}</Comment.Text>
      )}
    </Comment.Content>
  </Comment>
);

export default Message;
