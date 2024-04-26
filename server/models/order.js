const mongoose = require("mongoose");
const Order = new mongoose.Schema({
  user_id: String, //user._id of person who made the order
  market: String, //"live" or "reserve"
  type: String, //"buy" or "sell"
  dhall: String,
  price: Number,
  date: Date,
  meal: String,
});
module.exports = mongoose.model("orders", Order);
