const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema({
  buyer_id: String,
  seller_id: String,
  meal: String, //breakfast, lunch, dinner, or late night
  dhall: String, //Maseeh, Next, NV, Simmons, Baker, MCC
  price: Number,
  date: Date,
});
module.exports = mongoose.model("transactions", TransactionSchema);
