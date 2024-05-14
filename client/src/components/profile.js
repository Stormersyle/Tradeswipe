import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../utilities.js";
import ClientSocket from "../client-socket.js";
import { UpdateProfile, UpdateNotifs } from "./update_profile.js";

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

const Profile = ({ user, openUpdateProfile }) => {
  return (
    <div className="profile-box">
      <p className="u-l u-flex u-justify-center">Profile</p>
      <div className="linebreak-1"></div>
      <p className="u-mm">
        <b>Name:</b> {user.name}
      </p>
      <div className="linebreak-1"></div>
      <p className="u-mm">
        <b>Kerb:</b> {user.kerb ? user.kerb : "N/A"}
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
        <b>Directions:</b> {user.directions ? user.directions : "N/A"}
      </p>
      <br />
      <div className="u-flex u-justify-center">
        <button className="default-button" onClick={openUpdateProfile}>
          <p className="u-mm u-block">Update Profile</p>
        </button>
      </div>
    </div>
  );
};

const Notifs = ({ user, openUpdateNotifs }) => {
  return (
    <div className="profile-box">
      <p className="u-l u-flex u-justify-center">Notification Settings</p>
      <div className="linebreak-1"></div>
      <p className="u-mm">
        <b>"Live Match" Notifications:</b> {user.live_notifs ? "On" : "Off"}
      </p>
      <div className="linebreak-1"></div>
      <p className="u-mm">
        <b>"Scheduled Match" Notifications:</b> {user.reserve_notifs ? "On" : "Off"}
      </p>
      <div className="linebreak-1"></div>
      <p className="u-mm">
        <b>Email Notifications:</b> {user.email_notifs ? "On" : "Off"}
      </p>
      <br />
      <div className="u-flex u-justify-center">
        <button className="default-button" onClick={openUpdateNotifs}>
          <p className="u-mm u-block">Update Notifications</p>
        </button>
      </div>
    </div>
  );
};

const StatsBox = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  const init = useCallback(() => {
    get("/api/user_stats").then((stats) => setStats(stats));
  }, []);

  useEffect(() => {
    init();
    ClientSocket.listen("update_transactions", init);
    return () => ClientSocket.remove_listener("update_transactions", init);
  }, []);

  if (!stats) {
    return (
      <div className="profile-box">
        <p className="u-l u-flex u-justify-center">Transaction History</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">Loading Stats</p>
      </div>
    );
  }

  return (
    <div className="profile-box">
      <p className="u-l u-flex u-justify-center">Transaction History</p>
      <div className="linebreak-1"></div>
      <p className="u-mm">
        <b>Total Swipes Received:</b> {stats.bought}
      </p>
      <div className="linebreak-1"></div>
      <p className="u-mm">
        <b>Total Swipes Donated:</b> {stats.sold}
      </p>
      {/* <div className="linebreak-1"></div>
      <p className="u-mm">
        <b>Total Money Saved:</b> ${stats.money_saved.toFixed(2)}
      </p> */}
      <br />
      <div className="u-flex u-justify-center">
        <button className="default-button" onClick={() => navigate("/history")}>
          <p className="u-mm u-block">View Full History</p>
        </button>
      </div>
    </div>
  );
};

const ProfilePage = ({ loggedIn, user, updateUser }) => {
  const [profile, setProfile] = useState("display"); //"display" and "update"
  const [notifs, setNotifs] = useState("display"); //"display" and "update"

  const openUpdateProfile = () => setProfile("update");
  const openUpdateNotifs = () => setNotifs("update");
  const closeUpdateProfile = () => setProfile("display");
  const closeUpdateNotifs = () => setNotifs("display");

  if (!loggedIn) return <NotLoggedIn />;

  return (
    <div className="page-container styled-page-container">
      {profile === "display" ? (
        <Profile user={user} openUpdateProfile={openUpdateProfile} />
      ) : (
        <UpdateProfile
          user={user}
          updateUser={updateUser}
          closeUpdateProfile={closeUpdateProfile}
        />
      )}
      <br />
      {notifs === "display" ? (
        <Notifs user={user} openUpdateNotifs={openUpdateNotifs} />
      ) : (
        <UpdateNotifs user={user} updateUser={updateUser} closeUpdateNotifs={closeUpdateNotifs} />
      )}
      <br />
      <StatsBox />
      <br />
    </div>
  );
};

export default ProfilePage;
