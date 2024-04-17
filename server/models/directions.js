//directions on where to find a user (the seller)
const mongoose = require("mongoose");
const DirectionsSchema = new mongoose.Schema({
  user_id: String,
  directions: String,
});
module.exports = mongoose.model("directions", DirectionsSchema);
