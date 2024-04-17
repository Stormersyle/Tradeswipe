const express = require("express");
const auth = require("./auth.js");
const SocketManager = require("./socket_manager.js");
const Market = require("./market.js");

const User = require("./models/user.js");
const Order = require("./models/order.js");
const Match = require("./models/match.js");
const Transaction = require("./models/transaction.js");
const Directions = require("./models/directions.js");
const Cancel = require("./models/cancel.js");

const router = express.Router(); //mounted on /api

//after populateCurrentUser: req.user is either a Mongoose User doc (if logged in), or null (if logged out)
router.use(auth.populateCurrentUser);

//verify that req.user is valid (if logged in). this is for security reasons
//after this: guaranteed that req.user is either null (if not logged in) or a valid User doc (if logged in)
//so after this: auth.ensureLoggedIn will work perfectly fine
router.use((req, res, next) => {
  if (!req.user) {
    next();
    return;
  }
  User.findById(req.user._id).then((user_doc) => {
    if (!user_doc) {
      res.send({ ok: false });
      return;
    } else next();
  });
});

router.get("/who_am_i", auth.ensureLoggedIn, (req, res) => {
  User.findById(req.user._id).then((user_doc) => res.send(user_doc));
});

//login/logout
router.post("/login", auth.login);
router.post("/logout", auth.logout);

//init client socket
//we need to check if it's logged in first! only add user if logged in.
router.post("/init_client_socket", (req, res) => {
  if (!req.user) {
    res.status(200).send({ outcome: "not added" });
    return;
  }
  // console.log(req.user, typeof req.user, "user");
  // console.log(req.body, typeof req.body, "body");
  console.log(req.body.socketid);
  SocketManager.addUser(req.user, SocketManager.getSocketFromSocketID(req.body.socketid));
  res.status(200).send({ outcome: "added" });
});

module.exports = router;
