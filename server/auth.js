//modified from catbook
const SocketManager = require("./socket_manager.js");
const User = require("./models/user.js");

const { Issuer } = require("openid-client");
require("dotenv").config();

/* Touchstone (OIDC - OpenID Connect) */

const BASEURL = process.env.BASEURL;
const OIDC_REDIRECT_URI = `${BASEURL}/api/login/touchstone`;

const touchstoneIssuerPromise = Issuer.discover("https://petrock.mit.edu");
let oidcClientPromise = touchstoneIssuerPromise.then(
  (issuer) =>
    new issuer.Client({
      client_id: process.env.TOUCHSTONE_CLIENT_ID,
      client_secret: process.env.TOUCHSTONE_CLIENT_SECRET,
      redirect_uris: [OIDC_REDIRECT_URI],
      response_types: ["code"],
    })
);

const redirectOidc = (req, res) => {
  oidcClientPromise
    .then((client) => {
      // https://www.npmjs.com/package/openid-client has a code challenge, is it necessary?
      const url = client.authorizationUrl({
        scope: "openid profile email",
        state: req.headers.referer,
      });
      res.redirect(url);
    })
    .catch(() => res.status(403).send({}));
};

const getUserInfo = async (req) => {
  const client = await oidcClientPromise;
  const params = client.callbackParams(req);
  const tokenSet = await client.callback(OIDC_REDIRECT_URI, {
    code: params.code,
  });
  const userinfo = await client.userinfo(tokenSet.access_token);
  console.log(userinfo);
  return userinfo;
};

//touchstone version
const getOrCreateUser = (user) => {
  return User.findOne({ kerb: user.sub }).then((existingUser) => {
    if (existingUser) {
      if (user.name) existingUser.name = user.name;
      return existingUser.save();
    }
    console.log(`Creating new user ${user.name} (${user.sub})`);
    const newUser = new User({
      name: user.name,
      kerb: user.sub, //user.sub is the kerb WITH @mit.edu!
      email: user.email,
    });
    return newUser.save();
  });
};

// basically a copy paste of loginGoogle
const loginTouchstone = (req, res) => {
  getUserInfo(req)
    .then((user) => {
      if (!user) return;
      return getOrCreateUser(user);
    })
    .then(async (user) => {
      req.session.user = user;
      const oidcState = req.query.state?.toString();
      const url = oidcState || "/";
      res.redirect(url);
    })
    .catch((err) => {
      console.log(`Failed to login: ${err}`);
      res.status(401).send({ err });
    });
};

//these are universal
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
//CLIENT DOES NOT HAVE ACCESS TO REQ.SESSION!
//so it's perfectly safe to directly call req.user in the server. that is guaranteed to be the actual user object. (but maybe out of date, since we can update profile)

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return res.send({ err: "not logged in" });
  }
  next();
}
// auth.ensureLoggedIn also ensures client is logged in and user is valid
//doesn't send an error

module.exports = {
  loginTouchstone,
  logout,
  populateCurrentUser,
  ensureLoggedIn,
  redirectOidc,
};

//overall: we use Google authentication library to validate logins; use sessions to persist logins
