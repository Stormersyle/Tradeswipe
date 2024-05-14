import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../utilities.js";
import "../stylesheets/home.css";

const GmailPopup = ({ closeForm, user, updateUser }) => {
  const gmailRef = useRef(null);
  const navigate = useNavigate();

  const submit = () => {
    if (!gmailRef.current) return;
    console.log(user.phone, gmailRef.current.value, user.directions);
    post("/api/update_profile", {
      phone_number: user.phone_number,
      email: gmailRef.current.value,
      directions: user.directions,
    }).then(({ ok, msg }) => {
      if (!ok) alert(msg);
      else {
        navigate("/profile");
        updateUser();
      }
    });
  };

  return (
    <dialog open className="popup">
      <p className="u-l">Email Notice</p>
      <div className="linebreak-2"></div>
      <p className="u-mm">
        Currently, your email is set to a non-gmail address, which is likely to filter out
        Tradeswipe's notifications as spam. Please set your email to your personal gmail
        (recommended), or unsubscribe from email notifications (not recommended, because they're
        very useful for remembering your matches)
      </p>
      <div className="linebreak-2"></div>
      <div className="input-row">
        <label htmlFor="email-input">Gmail:&nbsp;</label>
        <input id="email-input" type="text" ref={gmailRef} />
      </div>
      <br />
      <div className="u-width-fill u-flex-center">
        <button onClick={closeForm} className="default-button">
          Cancel
        </button>
        <button onClick={submit} className="default-button">
          Submit
        </button>
      </div>
    </dialog>
  );
};

const Home = ({ loggedIn, user, updateUser }) => {
  const navigate = useNavigate();
  const [popupOpen, setPopupOpen] = useState(
    Boolean(user.email && user.email.slice(-10) !== "@gmail.com")
  );

  useEffect(
    () => setPopupOpen(Boolean(user.email && user.email.slice(-10) !== "@gmail.com")),
    [user]
  );

  return (
    <div className="home-container">
      {popupOpen ? (
        <GmailPopup closeForm={() => setPopupOpen(false)} user={user} updateUser={updateUser} />
      ) : null}
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
