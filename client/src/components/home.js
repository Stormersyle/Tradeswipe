import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "../stylesheets/home.css";

const Home = ({ handleLogin, loggedIn }) => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <p className="u-block u-xl">
        Welcome to <span>Tradeswipe</span>
      </p>
      <p className="u-block u-mm">The marketplace for MIT meal swipes.</p>
      {loggedIn ? (
        <div className="u-flex u-justify-center u-align-center">
          <button onClick={() => navigate("/get-started")}>Get Started</button>
          <button onClick={() => navigate("/market")}>Trade Now</button>
        </div>
      ) : (
        <div className="login">
          <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} />
        </div>
      )}
    </div>
  );
};

export default Home;
