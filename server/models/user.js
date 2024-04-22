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
});
module.exports = mongoose.model("users", User);
