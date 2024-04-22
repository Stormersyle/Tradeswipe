const express = require("express");
const auth = require("./auth.js");
const SocketManager = require("./socket_manager.js");

const User = require("./models/user.js");
const Order = require("./models/order.js");
const Match = require("./models/match.js");
const Transaction = require("./models/transaction.js");
const Cancel = require("./models/cancel.js");

const router = express.Router(); //mounted on /api

//after populateCurrentUser: req.user is either a Mongoose User doc (if logged in), or null (if logged out)
router.use(auth.populateCurrentUser);

//login/logout
router.post("/login", auth.login);
router.post("/logout", auth.ensureLoggedIn, auth.logout);

//verify that req.user is valid (if logged in). this is for security reasons
//after this: guaranteed that req.user is either null (if not logged in) or a valid User doc (if logged in)
//so after this: auth.ensureLoggedIn will work perfectly fine
const verify_user = (req, res, next) => {
  if (!req.user) {
    next();
    return;
  }
};

//gets data of the user (based on req.user);
//sends back empty document if req.user=null (i.e. logged out)
router.get("/who_am_i", (req, res) => {
  if (!req.user) {
    res.send({});
    return;
  }
  User.findById(req.user._id).then((user_doc) => res.send(user_doc));
});

//init client socket
//we need to check if it's logged in first! only add user if logged in.
router.post("/init_client_socket", (req, res) => {
  if (!req.user) {
    res.status(200).send({ outcome: "not added" });
    return;
  }

  // console.log(req.user, typeof req.user, "user");
  // console.log(req.body, typeof req.body, "body");
  // if (SocketManager.getSocketFromSocketID(req.body.socketid)) console.log("nonempty!");
  SocketManager.addUser(req.user, SocketManager.getSocketFromSocketID(req.body.socketid));
  res.status(200).send({ outcome: "added" });
});

//updates profile information for current user
//chat gpt generated regex, may or may not be correct ...
const validate_profile = (req, res, next) => {
  const { name, is_buyer, is_seller, phone_number, venmo_username } = req.body.new_profile;
  for (let x of [name, phone_number, venmo_username]) {
    if (typeof x !== "string") {
      res.status(403).send({ msg: "wrong type" });
      return;
    }
  }
  if (!(typeof is_buyer === "boolean" && typeof is_seller === "boolean")) {
    res.status(403).send({ msg: "wrong type" });
    return;
  }

  const regex_name = /^[A-Za-z]+ [A-Za-z]+$/;
  const regex_venmo = /^[a-zA-Z0-9_-]{5,30}$/;
  const regex_phone = /^[\d\s\-\(\)\+]*(?:\d[\d\s\-\(\)\+]*){7,}$/;

  if (!regex_name.test(name)) {
    res.status(403).send({ msg: "invalid name" });
    return;
  }
  if ((is_buyer || is_seller) && !regex_phone.test(phone_number)) {
    res.status(403).send({ msg: "invalid email" });
    return;
  }
  if (is_seller && !regex_venmo.test(venmo_username)) {
    res.status(403).send({ msg: "invalid venmo" });
    return;
  }
  next();
  //rules: everyone must have a valid name (you can't change ur email)
  //all buyers and sellers must have a valid phone number
  //all sellers must have a valid venmo
};

router.post("/update_profile", auth.ensureLoggedIn, validate_profile, async (req, res) => {
  const profile = req.body.new_profile;
  await User.updateOne(
    { _id: req.user._id },
    {
      $set: {
        name: profile.name,
        is_buyer: profile.is_buyer,
        is_seller: profile.is_seller,
        phone_number: profile.phone_number,
        venmo_username: profile.venmo_username,
        directions: profile.directions,
      },
    }
  );
  res.status(200).send({});
});

module.exports = router;
