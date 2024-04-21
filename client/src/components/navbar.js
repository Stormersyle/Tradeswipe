import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import "../stylesheets/navbar.css";

const Navbar = ({ loggedIn, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const helped_paths = ["/", "/market", "/match", "/profile"];

  if (!loggedIn) {
    return (
      <div className="Navbar">
        <div className="nav-container u-flex u-justify-start u-align-center u-height-fill">
          <Link
            to="/"
            className="nav-link u-mmm u-flex u-align-center u-height-fill"
            id="tradeswipe-nav"
          >
            <img src="/assets/logo.png" id="logo" />
            Tradeswipe
          </Link>
          <Link to="/about" className="nav-link u-mmm u-flex u-align-center u-height-fill">
            About
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="Navbar">
      <div className="nav-container u-flex u-justify-start u-align-center u-height-fill">
        <Link
          to="/"
          className="nav-link u-mmm u-flex u-align-center u-height-fill"
          id="tradeswipe-nav"
        >
          <img src="/assets/logo.png" id="logo" />
          Tradeswipe
        </Link>
        <Link to="/market" className="nav-link u-mmm u-flex u-align-center u-height-fill">
          Market
        </Link>
        <Link to="/match" className="nav-link u-mmm u-flex u-align-center u-height-fill">
          Match
        </Link>
        <Link to="/about" className="nav-link u-mmm u-flex u-align-center u-height-fill">
          About
        </Link>
      </div>

      <div className="nav-container u-flex u-justify-end u-align-center u-height-fill">
        <Link to="/" className="nav-button">
          <img src="/assets/home.png" className="nav-icon" />
        </Link>
        <button
          onClick={() => {
            if (!helped_paths.includes(location.pathname)) {
              alert("Help is not available for this page.");
              return;
            }
            const helpPath = `/help${location.pathname}`;
            navigate(helpPath);
          }}
          className="nav-button u-flex u-align-items u-height-fill "
        >
          <img src="/assets/help.png" className="nav-icon" />
        </button>
        <Link to="/profile" className="nav-button">
          <img src="/assets/profile.png" className="nav-icon" />
        </Link>
        <button
          onClick={() => {
            googleLogout();
            handleLogout();
          }}
          className="nav-button"
        >
          <img src="/assets/logout.png" className="nav-icon" id="logout-icon" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
