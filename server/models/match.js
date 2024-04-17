const mongoose = require("mongoose");
const matchSchema = new mongoose.Schema({
  buyer_id: String, //_id of buyer
  seller_id: String, //_id of seller
  price: Number,
  buyer_finished: { type: Boolean, default: false },
  seller_finished: { type: Boolean, default: false },
  dining_hall: String,
});

module.exports = mongoose.model("matches", matchSchema);
