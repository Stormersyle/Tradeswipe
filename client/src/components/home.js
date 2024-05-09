import React from "react";
import { useNavigate } from "react-router-dom";
import "../stylesheets/home.css";

const Home = ({ loggedIn }) => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <p className="u-block u-huge u-height-fit u-width-fit u-text-center">
        <span className="u-huge tradeswipe-title">Tradeswipe</span>
      </p>
      <div className="linebreak-2"></div>
      <p className="u-block u-ll u-height-fit u-width-fit u-text-center">
        The marketplace for MIT meal swipes.
      </p>
      <br />
      <br />
      {loggedIn ? (
        <div className="u-flex u-justify-center u-align-center">
          {/* <button onClick={() => navigate("/info")} className="default-button">
            <p className="u-mmm">About</p>
          </button> */}
          <button onClick={() => navigate("/market")} className="default-button">
            <p className="u-mmm">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Trade Now&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </p>
          </button>
        </div>
      ) : (
        <div className="u-width-fit">
          <a href="api/login/touchstone/redirect">
            <div className="default-button touchstone-button u-flex u-justify-start u-align-center">
              <img src="/assets/mit.png" className="mit-logo" />
              <p className="u-mmm touchstone-text">&nbsp;&nbsp;Touchstone Login&nbsp;</p>
            </div>
          </a>
        </div>
      )}
    </div>
  );
};

export default Home;
