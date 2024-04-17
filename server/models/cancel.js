//order cancels
const mongoose = require("mongoose");
const cancelSchema = new mongoose.Schema({
  user_id: String,
  order_type: String, //bid or ask
});
module.exports = mongoose.model("cancels", cancelSchema);
