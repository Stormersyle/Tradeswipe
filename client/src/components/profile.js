import React from "react";
import { useNavigate } from "react-router-dom";

import NotLoggedIn from "./not_logged_in.js";
import "../stylesheets/profile.css";

// User schema:
//     name: String,
//     email: String,
//     googleid: String,
//     phone_number: { type: String, default: "" },
//     venmo_username: { type: String, default: "" },
//     is_buyer: { type: Boolean, default: false },
//     is_seller: { type: Boolean, default: false },
//     directions: {type: String, default: ""}

const Profile = ({ loggedIn, user }) => {
  const navigate = useNavigate();

  if (!loggedIn) return <NotLoggedIn />;

  return (
    <div className="page-container styled-page-container">
      <div id="profile-box">
        <p className="u-l u-flex u-justify-center">Profile</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          <b>Name:</b> {user.name}
        </p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          <b>Email:</b> {user.email ? user.email : "N/A"}
        </p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          <b>Phone:</b> {user.phone_number ? user.phone_number : "N/A"}
        </p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          <b>Venmo Username:</b> {user.venmo_username ? user.venmo_username : "N/A"}
        </p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          <b>Buyer Enabled:</b> {user.is_buyer ? "Yes" : "No"}
        </p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          <b>Seller Enabled:</b> {user.is_seller ? "Yes" : "No"}
        </p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          <b>Directions:</b> {user.directions ? user.directions : "N/A"}
        </p>
        <br />
        <div className="u-flex u-justify-center">
          <button className="default-button" onClick={() => navigate("/update_profile")}>
            <p className="u-mm u-block">Update Profile</p>
          </button>
        </div>
      </div>
      <br />
      <br />
      <div id="stats-box">
        <p className="u-l u-flex u-justify-center">Transaction History</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          <b>Total Swipes Bought:</b> 120
        </p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          <b>Total Swipes Sold:</b> 2
        </p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          <b>Total Money Saved:</b> $465.75
        </p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          <b>Favorite Dining Hall:</b> Next
        </p>
        <br />
        <div className="u-flex u-justify-center">
          <button className="default-button" onClick={() => navigate("/history")}>
            <p className="u-mm u-block">View Full History</p>
          </button>
        </div>
      </div>
      <br />
    </div>
  );
};

export default Profile;
