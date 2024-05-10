const mongoose = require("mongoose");
const User = new mongoose.Schema({
  name: String,
  email: String,
  kerb: { type: String, default: "" }, //kerb includes @mit.edu,
  googleid: { type: String, default: "" }, //for non-MIT users
  phone_number: { type: String, default: "" },
  venmo_username: { type: String, default: "" },
  is_buyer: { type: Boolean, default: false },
  is_seller: { type: Boolean, default: false },
  directions: { type: String, default: "Here are the directions for how to find me" },
  live_notifs: { type: Boolean, default: true }, //in-app notifs for live orders
  reserve_notifs: { type: Boolean, default: true }, //in-app notifs for reserve orders
  email_notifs: { type: Boolean, default: true }, //email notifs for reserve orders
});
module.exports = mongoose.model("users", User);
