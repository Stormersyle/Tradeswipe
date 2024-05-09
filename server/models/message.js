const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  match_id: String,
  sender: String,
  content: String,
  date: Date,
});
module.exports = mongoose.model("messages", messageSchema);
