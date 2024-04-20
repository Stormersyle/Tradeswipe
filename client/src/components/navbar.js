import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import "../stylesheets/navbar.css";

const Navbar = ({ loggedIn, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const helped_paths = ["/", "/market", "/match", "/profile"];

  if (!loggedIn) {
    return <div className="Navbar u-width-fill"></div>;
  }
  return (
    <div className="Navbar-container u-width-fill">
      <div className="Navbar u-height-fill">
        <div className="left-container u-flex u-justify-start u-align-center u-height-fill">
          <Link to="/" className="nav-link u-mm u-flex u-align-center u-height-fill">
            <img src="/assets/logo.png" id="logo" />
            Tradeswipe
          </Link>
          <div id="white-bar"></div>
          <Link to="/market" className="nav-link u-mm u-flex u-align-center u-height-fill">
            Market
          </Link>
          <Link to="/match" className="nav-link u-mm u-flex u-align-center u-height-fill">
            Match
          </Link>
        </div>

        <div className="right-container u-flex u-justify-end u-align-center u-height-fill">
          {helped_paths.includes(location.pathname) ? (
            <button
              onClick={() => {
                const helpPath = `/help${location.pathname}`;
                navigate(helpPath);
              }}
              className="nav-link u-flex u-align-items u-height-fill "
            >
              <img src="/assets/help.png" className="nav-icon" />
            </button>
          ) : null}
          <Link to="/profile" className="nav-link">
            <img src="/assets/profile.png" className="nav-icon" />
          </Link>
          <button
            onClick={() => {
              googleLogout();
              handleLogout();
            }}
            className="nav-link"
          >
            <img src="/assets/logout.png" className="nav-icon" id="logout-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
