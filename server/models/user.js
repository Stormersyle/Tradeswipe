const mongoose = require("mongoose");
const User = new mongoose.Schema({
  name: String,
  email: String,
  googleid: String,
  phone_number: { type: String, default: "" },
  venmo_username: { type: String, default: "" },
  is_buyer: { type: Boolean, default: false },
  is_seller: { type: Boolean, default: false },
  directions: { type: String, default: "" },
  live_notifs: { type: Boolean, default: false }, //in-app notifs for live orders
  reserve_notifs: { type: Boolean, default: false }, //in-app notifs for reserve orders
  email_notifs: { type: Boolean, default: false }, //email notifs for reserve orders
});
module.exports = mongoose.model("users", User);
