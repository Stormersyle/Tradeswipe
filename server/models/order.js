const mongoose = require("mongoose");
const Order = new mongoose.Schema({
  user_id: String, //user._id of person who made the order
  type: String, //"bid" or "ask"
  price: Number,
  dining_hall: String,
});
module.exports = mongoose.model("orders", Order);
