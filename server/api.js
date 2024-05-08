const express = require("express");
const auth = require("./auth.js");
const googleAuth = require("./google_auth.js");
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
router.get("/login/touchstone/redirect", auth.redirectOidc);
router.get("/login/touchstone", auth.loginTouchstone);
router.post("/logout", auth.ensureLoggedIn, auth.logout);

//login needs to be a GET request! basically, how it works: when we visit /api/login/touchstone/redirect, we make a GET request to the server for the page (since webpack redirects requests starting with "/api" to the server), thus triggering auth.redirectOidc

//google login, only for developer testing
router.post("/login/google", googleAuth.login);

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
  // console.log(req.user, typeof req.user, "user");
  // console.log(req.body, typeof req.body, "body");
  // if (SocketManager.getSocketFromSocketID(req.body.socketid)) console.log("nonempty!");
  if (!req.user) return res.send({});
  SocketManager.addUser(req.user, SocketManager.getSocketFromSocketID(req.body.socketid));
  res.send({ outcome: "added" });
});

//updates profile information for current user
//chat gpt generated regex, may or may not be correct ...
const validate_profile = (req, res, next) => {
  const { phone_number, directions } = req.body;
  if (!(typeof phone_number === "string" && typeof directions === "string"))
    return res.send({ ok: false, msg: "inputs wrong type" });

  // const regex_venmo = /^[a-zA-Z0-9_-]{5,30}$/;
  // const regex_phone = /^[\d\s\-\(\)\+]*(?:\d[\d\s\-\(\)\+]*){7,}$/;
  // if ((is_buyer || is_seller) && !regex_phone.test(phone_number)) {
  //   return res.send({ msg: "invalid phone number" });
  // }
  next();
};

router.post("/update_profile", auth.ensureLoggedIn, validate_profile, async (req, res) => {
  const profile = req.body;
  await User.updateOne(
    { _id: req.user._id },
    {
      $set: {
        phone_number: profile.phone_number,
        // venmo_username: profile.venmo_username,
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

//update notification settings
router.post("/update_notifs", auth.ensureLoggedIn, (req, res) => {
  User.updateOne(
    { _id: req.user._id },
    { $set: { live_notifs: req.body.live_notifs, reserve_notifs: req.body.reserve_notifs } }
  ).then(() => res.send({}));
});

//next functions: for placing order
const validate_order = async (req, res, next) => {
  const { market, type, date, dhall, price, quantity } = req.body;
  if (!(market && type && date && dhall && (price || price === 0) && quantity))
    return res.send({ msg: "not compelete" });
  // const user_doc = await User.findById(req.user._id);
  // if (type === "buy") {
  //   if (!user_doc.is_buyer)
  //     return res.send({ msg: "Not an authorized buyer! Please activate in your profile." });
  // } else {
  //   if (!user_doc.is_seller)
  //     return res.send({ msg: "Not an authorized seller! Please activate in your profile." });
  // }
  req.body.price = Number(Number(price).toFixed(2));
  req.body.quantity = Number(Number(quantity).toFixed(0));
  if (isNaN(req.body.price) || isNaN(req.body.quantity))
    return res.send({ msg: "invalid price/quantity" });
  if (req.body.price < 0 || req.body.price > 20 || req.body.quantity < 1 || req.body.quantity > 10)
    return res.send({
      msg: "Bad price/quantity! Price must be a number from 0 through 20, and quantity must be an integer from 1 through 10.",
    });
  req.body.date = new Date(date);
  if (isNaN(req.body.date.getTime())) return res.send({ msg: "invalid date" });
  if (market === "reserve") {
    const today = Date.now();
    const thirtyDaysLater = Date.now() + 30 * 24 * 3600 * 1000;
    if (req.body.date.getTime() < today)
      return res.send({ msg: "Your reservation order must be for the future!" });
    if (req.body.date.getTime() > thirtyDaysLater)
      return res.send({
        msg: "Your reservation order cannot be for more than 30 days from today.",
      });
  }
  if (market === "live") req.body.date = new Date();
  if (type === "buy") req.body.quantity = 1;
  req.body.meal = get_meal(req.body.date);
  req.body.user_id = req.user._id;
  next();
  return;
};

//place order
router.post("/order", auth.ensureLoggedIn, validate_order, async (req, res) => {
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
  //forst, validate order and user
  const { order_id } = req.body;
  const order = await Order.findById(order_id);
  if (!order) return res.send({ msg: "claim failed!" });
  const user = await User.findById(req.user._id);
  if (order.type === "buy" && !user.is_seller) {
    //claim a buy order; i.e. we're selling
    SocketManager.emit_to_user(
      user._id,
      "notif",
      "Not authorized to sell! Please activate in your profile"
    );
    return res.send({});
  }
  if (order.type === "sell" && !user.is_buyer) {
    SocketManager.emit_to_user(
      user._id,
      "notif",
      "Not authorized to buy! Please activate in your profile"
    );
    return res.send({});
  }

  //now: make the match
  const { user_id, market, type, dhall, price, date, meal } = order;
  await Order.findByIdAndDelete(order_id);
  SocketManager.emit_to_all("update_order_book");
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
  SocketManager.emit_to_user(newMatch.buyer_id, "update_matches");
  SocketManager.emit_to_user(newMatch.seller_id, "update_matches");

  //now make notifications
  const buyer = await User.findById(newMatch.buyer_id);
  const seller = await User.findById(newMatch.seller_id);
  if (newMatch.market === "live") {
    if (seller.live_notifs)
      SocketManager.emit_to_user(
        newMatch.seller_id,
        "notif",
        "New live match! Go to Match page to view."
      );
    if (buyer.live_notifs)
      SocketManager.emit_to_user(
        newMatch.buyer_id,
        "notif",
        "New live match! Go to Match page to view."
      );
  } else {
    if (seller.reserve_notifs)
      SocketManager.emit_to_user(
        newMatch.seller_id,
        "notif",
        "New reservation match! Go to Match page to view."
      );
    if (buyer.reserve_notifs)
      SocketManager.emit_to_user(
        newMatch.buyer_id,
        "notif",
        "New reservation match! Go to Match page to view."
      );
  }

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
  const match = await Match.findById(match_id);
  if (!match) return res.send({});
  await Match.findByIdAndDelete(match_id);
  SocketManager.emit_to_user(match.buyer_id, "update_matches");
  SocketManager.emit_to_user(match.seller_id, "update_matches");

  //notify the other person (if necessary) of the match being cancelled
  const canceled_by = req.user._id.toString() === match.buyer_id ? "buyer" : "seller";
  const buyer = await User.findById(match.buyer_id);
  const seller = await User.findById(match.seller_id);
  if (match.market === "live") {
    if (seller.live_notifs)
      SocketManager.emit_to_user(match.seller_id, "notif", "Live match canceled!");
    if (buyer.live_notifs)
      SocketManager.emit_to_user(match.buyer_id, "notif", "Live match canceled!");
  } else {
    if (seller.reserve_notifs)
      SocketManager.emit_to_user(match.seller_id, "notif", "Reservation match canceled!");
    if (buyer.reserve_notifs)
      SocketManager.emit_to_user(match.buyer_id, "notif", "Reservation match canceled!");
  }

  //now, put the order back on the market if the claimer canceled
  if (canceled_by !== match.ordered_by) {
    if (match.market === "reserve" && match.date.getTime() < Date.now()) return res.send({});
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
    SocketManager.emit_to_all("update_order_book");
  }
  return res.send({});
});

//when a user clicks "finish" on their match
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
      market: match.market,
      meal: match.meal,
      dhall: match.dhall,
      price: match.price,
      date: match.date,
    });
    await newTransaction.save();
    await Match.findByIdAndDelete(match_id);
    SocketManager.emit_to_user(match.buyer_id, "update_transactions");
    SocketManager.emit_to_user(match.seller_id, "update_transactions");
  }
  SocketManager.emit_to_user(match.buyer_id, "update_matches");
  SocketManager.emit_to_user(match.seller_id, "update_matches");
  return res.send({});
});

router.get("/transaction_history", auth.ensureLoggedIn, (req, res) => {
  const process_transaction = (transaction) => {
    return {
      my_role: req.user._id.toString() === transaction.buyer_id ? "buyer" : "seller",
      market: transaction.market,
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

router.get("/user_stats", auth.ensureLoggedIn, async (req, res) => {
  const meal_price = { breakfast: 10.85, lunch: 17, dinner: 19.95, "late night": 19.95, other: 15 };
  const my_transactions = await Transaction.find({
    $or: [{ buyer_id: req.user._id.toString() }, { seller_id: req.user._id.toString() }],
  });
  let bought = 0,
    sold = 0,
    money_saved = 0;
  for (let transaction of my_transactions) {
    if (transaction.buyer_id === req.user._id.toString()) {
      bought++;
      money_saved += Math.max(0, meal_price[transaction.meal] - transaction.price);
    } else {
      sold++;
      money_saved += transaction.price;
    }
  }
  // console.log("money saved", money_saved);
  return res.send({ bought: bought, sold: sold, money_saved: money_saved });
});

module.exports = router;
