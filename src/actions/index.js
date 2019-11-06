import * as actionTypes from "./types";

// User Actions
export const setUser = user => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser: user
    }
  };
};

export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER
  };
};

// Channel Actions

export const setCurrentChannel = channel => {
  return {
    type: actionTypes.SET_CURRENT_CHANNEL,
    payload: {
      currentChannel: channel
    }
  };
};

export const setPrivateChannel = isPrivateChannel => {
  return {
    type: actionTypes.SET_PRIVATE_CHANNEL,
    payload: {
      isPrivateChannel
    }
  };
};

export const setChannelUsers = channelUsers => {
  return {
    type: actionTypes.SET_CHANNEL_USERS,
    payload: { channelUsers }
  };
};

// Color Actions

export const setColors = (primaryColor, secondaryColor) => {
  return {
    type: actionTypes.SET_COLORS,
    payload: {
      primaryColor,
      secondaryColor
    }
  };
};
