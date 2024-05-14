const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const bodyParser = require("body-parser"); // allow node to automatically parse POST body requests as JSON
const session = require("express-session"); // library that stores info about each connected user
const path = require("path");
require("dotenv").config();
const SocketManager = require("./socket_manager.js");

const app = express();
const server = http.createServer(app);
SocketManager.init(server); //make a new SocketIO server, tied to our HTTP server

//connect to mongoDB
const mongoConnectionURI = process.env.MONGO_SRV;
const databaseName = "Database";
mongoose
  .connect(mongoConnectionURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: databaseName,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));

// set up bodyParser, which allows us to process POST requests
//this parses the body of every POST request into JSON; so in /api, we can directly treat req.body as an object, with each field their correct type!
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set up a session, which will persist login data across requests
const session_secret = process.env.SESSION_SECRET;
app.use(
  session({
    secret: session_secret,
    resave: false,
    saveUninitialized: false,
  })
);

//mount API router on "/api" path
const api = require("./api.js");
app.use("/api", api);

//serve static files when a GET request is made to client/dist
//note: because webpack bundles all the front-end JS/CSS files into bundle.js (which is in client/dist), all static files served to the client are in client/dist
const client_dir = path.resolve(__dirname, "..", "client", "dist");
app.use(express.static(client_dir));
//now: express treats client_dir as the root for static files!
//so when the site requests a static file from filepath, server interprets that as client_dir/filepath
//so for assets: do /assets/name rather than /client/dist/assets/name.

// for get requests to any other route, just send index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(client_dir, "index.html"));
});

//handle errors
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) {
    // 500 means Internal Server Error
    console.log("The server errored when processing a request!");
    console.log(err);
  }

  res.status(status);
  res.send({
    status: status,
    message: err.message,
  });
});

//listen on port 3000
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//purge old orders every minute
const Order = require("./models/order.js");
const purgeOldOrders = async () => {
  console.log("new purge!");
  const orders = await Order.find();
  for (let order of orders) {
    const order_age = Date.now() - Number(order.date);
    if (order.market === "live" && order_age > 3600000) await Order.findByIdAndDelete(order._id);
    if (order.market === "reserve" && order_age > 0) await Order.findByIdAndDelete(order._id);
    // console.log(order_age);
  }
  SocketManager.emit_to_all("update_order_book");
};
setInterval(purgeOldOrders, 60000);

//send scheduled emails for each match ~30 min before meeting up
const mailer = require("./mailer.js");
const Match = require("./models/match.js");

const matchReminders = async () => {
  const matches = await Match.find({ market: "reserve" });
  for (let match of matches) {
    const time_till_match = Number(match.date) - Date.now();
    if (1740000 < time_till_match && time_till_match < 1800000) {
      mailer.sendMatchReminder(match);
      // console.log("reminder: ", match);
    }
    // console.log(time_till_match);
  }
};
setInterval(matchReminders, 60000);
