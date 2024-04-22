//modified from catbook
const { OAuth2Client } = require("google-auth-library");
const SocketManager = require("./socket_manager.js");
const User = require("./models/user.js");

// create a new OAuth client used to verify google sign-in
//this is ok (not a security risk) because only selected URLs may access this client ID
const CLIENT_ID = "954844909530-hvosmig1l5f9j86o7vn7cmhh6r3sou05.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// accepts a login token from the frontend, and verifies that it's legit
function verify(token) {
  return client
    .verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    .then((ticket) => ticket.getPayload());
}

// gets user from DB, or makes a new account if it doesn't exist yet
//returns a promise resolving to the found/created User document
function getOrCreateUser(user) {
  //user=ticket payload
  // the "sub" field means "subject", which is a unique identifier for each user
  return User.findOne({ googleid: user.sub }).then((existingUser) => {
    if (existingUser) return existingUser;

    const newUser = new User({
      name: user.name,
      googleid: user.sub,
      email: user.email,
    });

    return newUser.save();
  });
}

//when we log in: client makes request to "init_client_socket", letting the server know we have a new addition in the user-socket map
function login(req, res) {
  verify(req.body.token)
    .then((user) => getOrCreateUser(user))
    .then((user_doc) => {
      // persist user in the session
      req.session.user = user_doc;
      res.send(user_doc); //user_doc gets auto-converted into an object before sending
    })
    .catch((err) => {
      console.log(`Failed to log in: ${err}`);
      res.status(401).send({ err });
    });
}

function logout(req, res) {
  const userSocket = SocketManager.getSocketFromUserID(req.user._id);
  if (userSocket) {
    //if it's not null/undefined, delete user's socket when they log out
    SocketManager.removeUser(req.user, userSocket);
  }
  req.session.user = null;
  res.send({});
}

function populateCurrentUser(req, res, next) {
  //populates req.user with current user's document, then passes control to the next middleware. remember: req and res objects remain the same (in identity) throughout all the middleware!
  req.user = req.session.user;
  // if (req.user) console.log(typeof req.user, req.user);
  next();
}
//safe to use req.user in the backend, because this function sets req.user based on what google told us it was. user can't impersonate someone else unless they already have the details

//we populate current user for all api requests: so server always has up-to-date info on whether user is logged in or logged out
//when logged in: api sees req.user = obj; when logged out, api sees req.user = null

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).send({ err: "not logged in" });
  }
  User.findById(req.user._id).then((user_doc) => {
    if (!user_doc) return res.status(401).send({ err: "invalid user" });
  });
  next();
}
// auth.ensureLoggedIn also ensures user is valid

module.exports = {
  login,
  logout,
  populateCurrentUser,
  ensureLoggedIn,
};

//overall: we use Google authentication library to validate logins; use sessions to persist logins
