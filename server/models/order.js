const mongoose = require("mongoose");
const Order = new mongoose.Schema({
  user_id: String, //user._id of person who made the order
  market: String, //"live" or "reserve"
  type: String, //"buy" or "sell"
  dhall: String, //"maseeh", "nv", "mcc", "baker", "next", "simmons"
  price: Number,
  date: Date,
  meal: String, //"breakfast", "lunch", "dinner", or "late night"
});
module.exports = mongoose.model("orders", Order);
