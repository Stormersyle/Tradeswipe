import React, { useState, useEffect, StrictMode, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import "./utilities.css";
// important that index.ccs and utilities.css are imported before React components! This is so that the "default" CSS files are compiled first, thus component-specific CSS files have higher precedence

import { get, post } from "./utilities.js";
import ClientSocket from "./client-socket.js";

import Home from "./components/home.js";
import Nav from "./components/nav.js";
import Market from "./components/market.js";
import Info from "./components/info.js";
import Profile from "./components/profile.js";
import History from "./components/view_history.js";
import BackDoor from "./components/backdoor.js";

const GOOGLE_CLIENT_ID = "954844909530-hvosmig1l5f9j86o7vn7cmhh6r3sou05.apps.googleusercontent.com";

const App = () => {
  const [user, setUser] = useState({}); //user = {} if logged out; full object if logged in
  //to checked if logged in: check if user._id is truthy or falsy

  const notify = useCallback((msg) => {
    alert(msg);
  }, []);

  const init = () => {
    get("/api/who_am_i").then((user_doc) => setUser(user_doc));
  };

  useEffect(() => {
    ClientSocket.listen("notif", notify);
    init();
    return () => ClientSocket.remove_listener("notif", notify);
  }, []);
  //in touchstone login: we'll be redirected to an external page, then redirected back AFTER req.session.user is populated. So the client socket is automatically re-initialized in client-socket.js, this time WITH the user logged in.

  const handleGoogleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    console.log(`Logged in as ${decodedCredential.name}`);
    post("/api/login/google", { token: userToken }).then(() => {
      ClientSocket.init_client();
      init();
    });
  }; //whereas: in Google login, no App remount, so we need to re-init client socket explicitly.

  const handleLogout = () => {
    post("/api/logout").then(() => {
      init();
    }); //server handles removing the client socket from the map
    console.log("Logged out successfully!");
  };

  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Nav loggedIn={Boolean(user._id)} handleLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home loggedIn={Boolean(user._id)} />} />
          <Route path="/market" element={<Market user={user} loggedIn={Boolean(user._id)} />} />
          <Route path="/info" element={<Info loggedIn={Boolean(user._id)} />} />
          <Route
            path="/profile"
            element={<Profile user={user} loggedIn={Boolean(user._id)} updateUser={init} />}
          />
          <Route path="/history" element={<History loggedIn={Boolean(user._id)} />} />
          <Route
            path="/backdoor"
            element={
              <BackDoor loggedIn={Boolean(user._id)} handleGoogleLogin={handleGoogleLogin} />
            }
          />
        </Routes>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
