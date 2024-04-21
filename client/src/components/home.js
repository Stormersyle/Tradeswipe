import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "../stylesheets/home.css";

const Home = ({ handleLogin, loggedIn }) => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <p className="u-block u-huge u-height-fit">
        Welcome to <span className="u-huge tradeswipe-title">Tradeswipe</span>
      </p>
      <div className="linebreak-2"></div>
      <p className="u-block u-ll u-height-fit">The marketplace for MIT meal swipes.</p>
      <br />
      <br />
      {loggedIn ? (
        <div className="u-flex u-justify-center u-align-center">
          <button onClick={() => navigate("/get-started")} className="homepage-button">
            <p className="u-mmm">Setup Account</p>
          </button>
          <button onClick={() => navigate("/market")} className="homepage-button">
            <p className="u-mmm">Trade Now</p>
          </button>
        </div>
      ) : (
        <div className="u-width-fit">
          <GoogleLogin
            onSuccess={handleLogin}
            onError={(err) => console.log(err)}
            id="GoogleLogin"
          />
        </div>
      )}
    </div>
  );
};

export default Home;
