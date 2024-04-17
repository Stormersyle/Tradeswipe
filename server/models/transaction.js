const mongoose = require("mongoose");

const get_meal = () => {
  //figure out which meal it is right now
  const date = new Date(Date.now());
  const estTime = new Date(date.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const hours = estTime.getHours();
  if (7 <= hours && hours <= 10) return "Breakfast"; //7 - 10 am: breakfast
  else if (11 <= hours && hours <= 14) return "Lunch"; //11 am - 3 pm: lunch/brunch
  else if (17 <= hours && hours <= 20) return "Dinner"; //5 pm - 8 pm: dinner
  else if (hours >= 21 || hours <= 1) return "Late-night"; //9 pm - 1 am: late night
  else return "Other"; //not a standard meal time...
};

const TransactionSchema = new mongoose.Schema({
  buyer_id: String,
  seller_id: String,
  meal: { type: String, default: get_meal }, //breakfast, lunch, or dinner
  dining_hall: String, //Maseeh, Next, NV, Simmons, Baker, MCC
  price: Number,
  timestamp: { type: Date, default: Date.now },
});
module.exports = mongoose.model("transactions", TransactionSchema);
