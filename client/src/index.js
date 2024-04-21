import React, { useState, useEffect, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { get, post } from "./utilities.js";
import ClientSocket from "./client-socket.js";
import "./index.css";
import "./utilities.css";

import Home from "./components/home.js";
import NavBar from "./components/navbar.js";
import Market from "./components/market.js";
import Match from "./components/match.js";
import About from "./components/about.js";
import Help from "./components/help.js";

const GOOGLE_CLIENT_ID = "954844909530-hvosmig1l5f9j86o7vn7cmhh6r3sou05.apps.googleusercontent.com";

const App = () => {
  const [user, setUser] = useState({}); //user = {} if logged out; full object if logged in
  //to checked if logged in: check if user._id is truthy or falsy

  const init = async () => {
    //initializes everything: user data (from current session) and sockets
    const user_doc = await get("/api/who_am_i");
    setUser(user_doc);
  };

  useEffect(() => {
    init();
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    console.log(`Logged in as ${decodedCredential.name}`);
    post("/api/login", { token: userToken }).then(() => init());
  };

  const handleLogout = () => {
    post("/api/logout").then(() => init()); //server handles removing the client socket from the map
    console.log("Logged out successfully!");
  };

  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <NavBar loggedIn={Boolean(user._id)} handleLogout={handleLogout} />
        <Routes>
          <Route
            path="/"
            element={<Home handleLogin={handleLogin} loggedIn={Boolean(user._id)} />}
          />
          <Route path="/market" element={<Market />} />
          <Route path="/match" element={<Match />} />
          <Route path="/about" element={<About />} />
          <Route path="/help/:page" element={<Help />} />
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
module.hot.accept();
