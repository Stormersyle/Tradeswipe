const mongoose = require("mongoose");
const matchSchema = new mongoose.Schema({
  buyer_id: String, //_id of buyer
  seller_id: String, //_id of seller
  ordered_by: String, //"buyer" or "seller"; this tells us who initially placed the order, so we know whether to put it back on the market if someone cancels
  buyer_finished: { type: Boolean, default: false },
  seller_finished: { type: Boolean, default: false },
  market: String, //"live" or "reserve"
  dhall: String, //"maseeh", "nv", "mcc", "baker", "simmons", "next"
  price: Number,
  date: Date,
  meal: String, //"breakfast", "lunch", "dinner", or "late night"
});
module.exports = mongoose.model("matches", matchSchema);
