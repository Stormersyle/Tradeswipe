//modified from catbook
let io;

//ObjectId automatically converts to a string when used as a key
const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const getAllConnectedUsers = () => Object.values(socketToUserMap);
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.sockets.get(socketid); //updated for SocketIO v4

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];

  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;
  // console.log("added user!");
  // console.log(
  //   "map length",
  //   Object.keys(socketToUserMap).length,
  //   Object.keys(userToSocketMap).length
  // );
};

const removeUser = (user, socket) => {
  if (user) {
    delete userToSocketMap[user._id];
  }
  delete socketToUserMap[socket.id];
};

const emit_to_all = (eventName, data) => {
  if (data === undefined) io.emit(eventName);
  else io.emit(eventName, data);
};

const emit_to_user = (user_id, eventName, data) => {
  const socket = getSocketFromUserID(user_id);
  if (!socket) return; //if the user doesn't have a socket / they disconnected: do nothing
  if (data === undefined) socket.emit(eventName);
  else socket.emit(eventName, data);
};

const { Server } = require("socket.io");
const io_init = (http_server) => {
  //creates a new SocketIO server and ties it to a given HTTP server
  io = new Server(http_server);
  io.on("connection", (socket) => {
    console.log(`socket has connected: ${socket.id}`);
    socket.emit("ready");
    //when a socket disconnects, make sure to remove it!
    socket.on("disconnect", () => {
      // console.log(`socket has disconnected: ${socket.id}`);
      const user = getUserFromSocketID(socket.id);
      removeUser(user, socket);
    });
  });
};

module.exports = {
  init: io_init, //initializer for the SocketIO server

  addUser: addUser, //(user_doc, socket_obj) => adds user w/ this socket
  removeUser: removeUser, //(user_doc, socket_obj) => delete's user w/ this socket

  getSocketFromUserID: getSocketFromUserID, //(user_id) => socket_obj
  getUserFromSocketID: getUserFromSocketID, //(socket_id) => user_doc
  getSocketFromSocketID: getSocketFromSocketID, //(socket_id) => socket_obj
  getAllConnectedUsers: getAllConnectedUsers, //returns array of all connected user_docs

  emit_to_all: emit_to_all,
  emit_to_user: emit_to_user,
};
//generally: good practice to export getter/setter functions that access this file's data, rather than exporting the data directly
//fully encapsulate all socket operations in socket_manager
