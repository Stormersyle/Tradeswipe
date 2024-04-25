import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import "../stylesheets/navbar.css";

const Navbar = ({ loggedIn, handleLogout }) => {
  const navigate = useNavigate();

  if (!loggedIn) {
    return (
      <div className="Navbar">
        <div className="nav-container u-flex u-justify-start u-align-center u-height-fill">
          <Link to="/" className="nav-link u-flex u-align-center u-height-fill" id="tradeswipe-nav">
            <img src="/assets/logo.png" id="logo" />
            <p className="u-mmm" id="tradeswipe-title">
              Tradeswipe
            </p>
          </Link>
          <Link to="/info" className="nav-link u-mmm u-flex u-align-center u-height-fill">
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
          <p className="u-mmm" id="tradeswipe-title">
            Tradeswipe
          </p>
        </Link>
        <Link to="/market" className="nav-link u-mmm u-flex u-align-center u-height-fill">
          Market
        </Link>
        <Link to="/match" className="nav-link u-mmm u-flex u-align-center u-height-fill">
          Match
        </Link>
      </div>

      <div className="nav-container u-flex u-justify-end u-align-center u-height-fill">
        <Link to="/" className="nav-button">
          <img src="/assets/home.png" className="nav-icon" />
        </Link>
        <Link to="/info" className="nav-button">
          <img src="/assets/info.png" className="nav-icon" />
        </Link>
        <Link to="/profile" className="nav-button">
          <img src="/assets/profile.png" className="nav-icon" />
        </Link>
        <button
          onClick={() => {
            googleLogout();
            handleLogout();
            navigate("/");
          }}
          className="nav-button"
        >
          <img src="/assets/logout.png" className="nav-icon" id="logout-icon" />
        </button>
      </div>
    </div>
  );
};

const HamburgerMenu = ({ loggedIn, handleLogout }) => {
  const navigate = useNavigate();
  if (!loggedIn) {
    return (
      <div className="hamburger-container u-width-fill">
        <div className="hamburger-menu">
          <input id="menu__toggle" type="checkbox" />
          <label className="menu__btn" htmlFor="menu__toggle">
            <span></span>
          </label>

          <ul className="menu__box">
            <li>
              <a className="menu__item first-menu-item" href="/">
                Home
              </a>
            </li>
            <li>
              <a className="menu__item" href="/info">
                About
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="hamburger-container u-width-fill">
      <div className="hamburger-menu">
        <input id="menu__toggle" type="checkbox" />
        <label className="menu__btn" htmlFor="menu__toggle">
          <span></span>
        </label>

        <ul className="menu__box">
          <li>
            <a className="menu__item first-menu-item" href="/">
              Home
            </a>
          </li>
          <li>
            <a className="menu__item" href="/profile">
              Profile
            </a>
          </li>
          <li>
            <a className="menu__item" href="/market">
              Market
            </a>
          </li>
          <li>
            <a className="menu__item" href="/match">
              Match
            </a>
          </li>
          <li>
            <a className="menu__item" href="/info">
              Info
            </a>
          </li>
          <li>
            <button
              onClick={() => {
                googleLogout();
                handleLogout();
                navigate("/");
                location.reload();
              }}
              className="menu__item u-flex u-justify-start u-width-fill"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

const Nav = ({ loggedIn, handleLogout }) => {
  return (
    <div className="u-width-fill u-height-fit u-flex-column">
      <div className="u-width-fill u-height-fit u-flex u-justify-center">
        <Navbar loggedIn={loggedIn} handleLogout={handleLogout} />
      </div>
      <HamburgerMenu loggedIn={loggedIn} handleLogout={handleLogout} />
    </div>
  );
};

export default Nav;
