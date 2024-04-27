const express = require("express");
const auth = require("./auth.js");
const SocketManager = require("./socket_manager.js");

const User = require("./models/user.js");
const Order = require("./models/order.js");
const Match = require("./models/match.js");
const Transaction = require("./models/transaction.js");

const router = express.Router(); //mounted on /api

//after populateCurrentUser: req.user is either a Mongoose User doc (if logged in), or null (if logged out)
//note: req.user._id will be ObjectId type (if logged in!)
router.use(auth.populateCurrentUser);

//login/logout
router.post("/login", auth.login);
router.post("/logout", auth.ensureLoggedIn, auth.logout);

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
router.post("/init_client_socket", auth.ensureLoggedIn, (req, res) => {
  // console.log(req.user, typeof req.user, "user");
  // console.log(req.body, typeof req.body, "body");
  // if (SocketManager.getSocketFromSocketID(req.body.socketid)) console.log("nonempty!");
  SocketManager.addUser(req.user, SocketManager.getSocketFromSocketID(req.body.socketid));
  res.status(200).send({ outcome: "added" });
});

//updates profile information for current user
//chat gpt generated regex, may or may not be correct ...
const validate_profile = (req, res, next) => {
  const { name, is_buyer, is_seller, phone_number, venmo_username } = req.body;
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
  const profile = req.body;
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

  //we also need to tell all of our matches to update their info
  const extract_other_person = (match) => {
    if (match.buyer_id === req.user._id.toString()) return match.seller_id;
    else return match.buyer_id;
  };
  const matches = await Match.find({
    $or: [{ buyer_id: req.user._id.toString() }, { seller_id: req.user._id.toString() }],
  });
  const matched_user_ids = matches.map(extract_other_person); //array of IDs of ppl we're matched with
  for (let ID of matched_user_ids) SocketManager.emit_to_user(ID, "update_matches");
  res.status(200).send({});
});

const get_meal = (date) => {
  //figure out which meal it is right now
  //date is a Date object
  const estTime = new Date(date.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const hours = estTime.getHours();
  const day = estTime.getDay(); //Sunday - Saturday is 0 - 6
  if (1 <= day && day <= 5) {
    //weekday
    if (6 <= hours && hours <= 10) return "breakfast"; //7 - 10:59 am: breakfast
    else if (11 <= hours && hours <= 14) return "lunch"; //11 am - 3 pm: lunch/brunch
    else if (16 <= hours && hours <= 20) return "dinner"; //5 pm - 8 pm: dinner
    else if (hours >= 21 || hours <= 1) return "late night"; //9 pm - 1 am: late night
    else return "other"; //not a standard meal time...
  } else {
    if (7 <= hours && hours <= 9) return "breakfast";
    else if (10 <= hours && hours <= 14) return "lunch";
    else if (16 <= hours && hours <= 21) return "dinner";
    else if (hours >= 21) return "late night";
    else return "other";
  }
}; //revise later

const process_order = async (req, res, next) => {
  const { market, type, date, dhall, price, quantity } = req.body;
  const user_doc = await User.findById(req.user._id);
  if (type === "buy") {
    if (!user_doc.is_buyer) {
      res.send({ msg: "Not an authorized buyer! Please activate in your profile." });
      return;
    }
  } else {
    if (!user_doc.is_seller) {
      res.send({ msg: "Not an authorized seller! Please activate in your profile." });
      return;
    }
  }
  req.body.price = Number(Number(price).toFixed(2));
  req.body.quantity = Number(Number(quantity).toFixed(0));
  if (
    req.body.price < 0 ||
    req.body.price > 20 ||
    req.body.quantity < 0 ||
    req.body.quantity > 10 ||
    (!req.body.price && req.body.price !== 0) || //check if it's NaN
    (!req.body.quantity && req.body.quantity !== 0) //check if it's NaN
  ) {
    res.send({ msg: "bad price/quantity" });
    return;
  }
  if (market === "live") req.body.date = new Date(Date.now());
  if (type === "buy") req.body.quantity = 1;
  req.body.meal = get_meal(req.body.date);
  req.body.user_id = req.user._id;
  next();
  return;
};

//place order
router.post("/order", auth.ensureLoggedIn, process_order, async (req, res) => {
  // req.body has: {user_id, market, type, date, dhall, price, meal, quantity}
  const quantity = req.body.quantity;
  // delete req.body.quantity;
  for (let i = 0; i < quantity; i++) {
    const newOrder = new Order(req.body);
    await newOrder.save();
  }
  res.send({ msg: "Order successful!" });
  SocketManager.emit_to_all("update_order_book");
  return;
});

//retrive current orders
router.get("/orders", auth.ensureLoggedIn, (req, res) => {
  const strip_function = (order) => {
    return {
      _id: order._id,
      market: order.market,
      type: order.type,
      date: order.date,
      dhall: order.dhall,
      price: order.price,
      quantity: order.quantity,
      meal: order.meal,
      mine: order.user_id === req.user._id.toString() ? "true" : "false",
    };
  }; //essentially, strip each order of user_id
  Order.find()
    .sort({ date: -1 })
    .then((orders) => res.send(orders.map(strip_function)));
});

//cancel an order
router.post("/cancel_order", auth.ensureLoggedIn, async (req, res) => {
  const { order_id } = req.body;
  const order = await Order.findById(order_id);
  if (!order) return res.send({});
  if (order.user_id === req.user._id) await Order.findByIdAndDelete(order_id);
  SocketManager.emit_to_all("update_order_book");
  return res.send({});
});

//claim an order, which makes a match
router.post("/claim_order", auth.ensureLoggedIn, async (req, res) => {
  const { order_id } = req.body;
  const order = await Order.findById(order_id);
  if (!order) return res.send({ msg: "claim failed!" });
  await Order.findByIdAndDelete(order_id);
  SocketManager.emit_to_all("update_order_book");

  //now: make the match
  const { user_id, market, type, dhall, price, date, meal } = order;
  const newMatch = new Match({
    buyer_id: type === "buy" ? user_id : req.user._id,
    seller_id: type === "sell" ? user_id : req.user._id,
    ordered_by: type === "buy" ? "buyer" : "seller",
    buyer_finished: false,
    seller_finished: false,
    market: market,
    dhall: dhall,
    price: price,
    date: date,
    meal: meal,
  });
  await newMatch.save();
  SocketManager.emit_to_user(user_id, "update_matches");
  SocketManager.emit_to_user(req.user._id, "update_matches");
  return res.send({});
});

//get user's matches
router.get("/matches", auth.ensureLoggedIn, (req, res) => {
  const process_match = (match) => {
    return {
      _id: match._id, //converts to string when sending through HTTP
      my_role: req.user._id.toString() === match.buyer_id ? "buyer" : "seller",
      buyer_finished: match.buyer_finished,
      seller_finished: match.seller_finished,
      market: match.market,
      dhall: match.dhall,
      price: match.price,
      date: match.date,
      meal: match.meal,
    };
  };
  Match.find({
    $or: [{ buyer_id: req.user._id.toString() }, { seller_id: req.user._id.toString() }],
  })
    .sort({ date: 1 })
    .then((matches) => res.send(matches.map(process_match)));
  return;
}); //sort matches from earliest to latest

//get info about the person we're matched with
router.get("/other_person", auth.ensureLoggedIn, async (req, res) => {
  const { match_id } = req.query;
  const match = await Match.findById(match_id);
  if (!match) return res.send({});
  let other_person;
  if (req.user._id.toString() === match.buyer_id) {
    //user is buyer
    other_person = await User.findById(match.seller_id);
  } else {
    //user is seller
    other_person = await User.findById(match.buyer_id);
  }
  return res.send({
    name: other_person.name,
    phone_number: other_person.phone_number,
    venmo_username: other_person.venmo_username,
    directions: other_person.directions,
  });
});

//cancel match
//if match is canceled by the claimer: then the order goes back onto the market
//only exception: if it's a reserve order and the date has already passed
router.post("/cancel_match", auth.ensureLoggedIn, async (req, res) => {
  const { match_id } = req.body;
  const match = Match.findById(match_id);
  if (!match) return res.send({});
  await Match.findByIdAndDelete(match_id);

  //now, put it back on the market if the claimer canceled

  const canceled_by = req.user._id.toString() === match.buyer_id ? "buyer" : "seller";
  if (canceled_by !== match.ordered_by) {
    const currentDate = new Date();
    if (match.market === "reserve" && match.date < currentDate) return res.send({});
    const newOrder = new Order({
      user_id: match.ordered_by === "buyer" ? match.buyer_id : match.seller_id,
      market: match.market,
      type: match.ordered_by === "buyer" ? "buy" : "sell",
      dhall: match.dhall,
      price: match.price,
      date: match.date,
      meal: match.meal,
    });
    await newOrder.save();
  }
  return res.send({});
});

// buyer_id: String,
// seller_id: String,
// meal: String, //breakfast, lunch, or dinner
// dhall: String, //Maseeh, Next, NV, Simmons, Baker, MCC
// price: Number,
// date: Date,
//finish match
router.post("/finish_match", auth.ensureLoggedIn, async (req, res) => {
  const { match_id } = req.body;
  const match = await Match.findById(match_id);
  if (!match) return res.send({});
  let { buyer_finished, seller_finished } = match;
  if (req.user._id.toString() === match.buyer_id) {
    await Match.updateOne({ _id: match_id }, { $set: { buyer_finished: true } });
    buyer_finished = true;
  } else {
    await Match.updateOne({ _id: match_id }, { $set: { seller_finished: true } });
    seller_finished = true;
  }
  if (buyer_finished && seller_finished) {
    const newTransaction = new Transaction({
      buyer_id: match.buyer_id,
      seller_id: match.seller_id,
      meal: match.meal,
      dhall: match.dhall,
      price: match.price,
      date: match.date,
    });
    await newTransaction.save();
    await Match.findByIdAndDelete(match_id);
  }
  SocketManager.emit_to_user(match.buyer_id, "update_matches");
  SocketManager.emit_to_user(match.seller_id, "update_matches");
  SocketManager.emit_to_user(match.buyer_id, "update_transactions");
  SocketManager.emit_to_user(match.seller_id, "update_transactions");
  return res.send({});
});

router.get("/transaction_history", auth.ensureLoggedIn, (req, res) => {
  const process_transaction = (transaction) => {
    return {
      my_role: req.user._id.toString() === transaction.buyer_id ? "buyer" : "seller",
      meal: transaction.meal,
      dhall: transaction.dhall,
      price: transaction.price,
      date: transaction.date,
    };
  };
  Transaction.find({
    $or: [{ buyer_id: req.user._id.toString() }, { seller_id: req.user._id.toString() }],
  })
    .sort({ date: -1 })
    .then((transactions) => res.send(transactions.map(process_transaction)));
  return; //sort transactions from latest to oldest
});

module.exports = router;
