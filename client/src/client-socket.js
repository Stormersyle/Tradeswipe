//encapsulate all client socket code inside here
//whenever we load the page, a socket connection is automatically made! (Don't wait for App to call init)
//And whenever we load the page, tell server to init_client_socket; server decides whether we're logged in

import io from "socket.io-client";
import { post } from "./utilities.js";
const endpoint = window.location.hostname + ":" + window.location.port;
const socket = io(endpoint);

const init_client = () => {
  console.log("socket.id", socket.id);
  post("/api/init_client_socket", { socketid: socket.id });
};

//this way: whenever the page refreshes and there's a new socket, we'll wait for the server to be ready, then initialize client socket!
//so: no need to deal with sockets useEffect hook of App
socket.on("ready", init_client);

const listen = (eventName, handler) => socket.on(eventName, handler);

const remove_listener = (eventName, handler) => socket.off(eventName, handler);

const emit = (eventName, data) => {
  if (data === undefined) socket.emit(eventName);
  else socket.emit(eventName, data);
};

//emit with an acknowledgement callback
const emit_with_ack = (eventName, data, ackCallBack) => socket.emit(eventName, data, ackCallBack);

const client_socket = {
  listen: listen,
  emit: emit,
  emit_with_ack: emit_with_ack,
  remove_listener: remove_listener,
  init_client: init_client,
  socket: socket,
};

export default client_socket;
