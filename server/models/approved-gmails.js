const mongoose = require("mongoose");
const gmails = new mongoose.Schema({
  gmail: String,
});
module.exports = mongoose.model("approved-gmails", gmails);
