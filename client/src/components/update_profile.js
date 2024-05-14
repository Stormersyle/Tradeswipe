import React, { useRef } from "react";
import { post } from "../utilities.js";

import "../stylesheets/profile.css";

const UpdateNotifs = ({ user, updateUser, closeUpdateNotifs }) => {
  const liveRef = useRef(null),
    reserveRef = useRef(null),
    emailRef = useRef(null);

  const submit_notifs = () => {
    if (liveRef.current && reserveRef.current && emailRef.current) {
      post("/api/update_notifs", {
        live_notifs: liveRef.current.checked,
        reserve_notifs: reserveRef.current.checked,
        email_notifs: emailRef.current.checked,
      }).then(() => {
        updateUser();
        closeUpdateNotifs();
      });
    }
  };

  return (
    <div className="profile-box">
      <p className="u-l u-flex u-justify-center">Notification Settings</p>
      <div className="linebreak-1"></div>
      <div className="input-row">
        <label htmlFor="live-notifs">
          <b>"Live Match" Notifications:&nbsp;</b>
        </label>
        {user.live_notifs ? (
          <input
            id="live-notifs"
            type="checkbox"
            ref={liveRef}
            defaultChecked={true}
            className="checkbox"
          />
        ) : (
          <input id="live-notifs" type="checkbox" ref={liveRef} className="checkbox" />
        )}
      </div>
      <div className="linebreak-1"></div>
      <div className="input-row">
        <label htmlFor="reserve-notifs">
          <b>"Scheduled Match" Notifications:&nbsp;</b>
        </label>
        {user.reserve_notifs ? (
          <input
            id="reserve-notifs"
            type="checkbox"
            ref={reserveRef}
            defaultChecked={true}
            className="checkbox"
          />
        ) : (
          <input id="reserve-notifs" type="checkbox" ref={reserveRef} className="checkbox" />
        )}
      </div>
      <div className="linebreak-1"></div>
      <div className="input-row">
        <label htmlFor="email-notifs">
          <b>Email Notifications:&nbsp;</b>
        </label>
        {user.email_notifs ? (
          <input
            id="email-notifs"
            type="checkbox"
            ref={emailRef}
            defaultChecked={true}
            className="checkbox"
          />
        ) : (
          <input id="email-notifs" type="checkbox" ref={emailRef} className="checkbox" />
        )}
      </div>
      <br />
      <div className="u-flex u-width-fill u-justify-center u-align-center">
        <button onClick={closeUpdateNotifs} className="default-button">
          <p className="u-mm u-block">Cancel</p>
        </button>
        <button onClick={submit_notifs} className="default-button">
          <p className="u-mm u-block">Submit</p>
        </button>
      </div>
    </div>
  );
};

//props:
//user =   {name: String, is_buyer: Boolean, is_seller: Boolean,
//         kerb: String, email: String, phone_number: String, venmo_username: String, googleid: String,
//         directions: String}
//updateUser = func(). Tells App to call "/api/who_am_i" (so that updated user is stored)
const UpdateProfile = ({ user, updateUser, closeUpdateProfile }) => {
  const phoneRef = useRef(null),
    directionsRef = useRef(null);

  const { name, kerb, email, phone_number, venmo_username, directions } = user;
  const create_new_profile = () => {
    let profile = {
      phone_number: phone_number,
      directions: directions,
    };
    if (phoneRef.current) profile.phone_number = phoneRef.current.value;
    if (directionsRef.current) profile.directions = directionsRef.current.value;
    // console.log(profile);
    return profile;
  };
  const submit_profile = () => {
    const new_profile = create_new_profile();
    post("/api/update_profile", new_profile).then(({ ok, msg }) => {
      if (!ok) return alert(msg);
      updateUser();
      closeUpdateProfile();
    }); //no need to validate profile client-side; just do it server-side
  };

  return (
    <div className="profile-box">
      <p className="u-l u-flex u-justify-center">Profile</p>
      <div className="linebreak-1"></div>
      <p>
        <b>Name:&nbsp;</b> {name}
      </p>
      <p>
        <b>Kerb:&nbsp;</b> {kerb}
      </p>
      <div className="linebreak-1"></div>
      <p>
        <b>Email:&nbsp;</b> {email}
      </p>
      <div className="linebreak-1"></div>
      <div className="input-row">
        <label htmlFor="phone_number">
          <b>Phone:&nbsp;</b>
        </label>
        <input id="phone_number" type="text" defaultValue={phone_number} ref={phoneRef} />
      </div>
      <div className="linebreak-1"></div>
      {/* <div className="input-row">
        <label htmlFor="venmo_username">
          <b>Venmo Username:&nbsp;</b>
        </label>
        <input id="venmo_username" type="text" defaultValue={venmo_username} ref={venmoRef} />
      </div>
      <div className="linebreak-1"></div> */}
      <div className="input-col">
        <label htmlFor="directions">
          <b>Directions:&nbsp;</b>
        </label>
        <textarea id="directions" rows="3" ref={directionsRef} defaultValue={directions}></textarea>
      </div>
      <br />
      <div className="u-flex u-width-fill u-justify-center u-align-center">
        <button onClick={closeUpdateProfile} className="default-button">
          <p className="u-mm u-block">Cancel</p>
        </button>
        <button onClick={submit_profile} className="default-button">
          <p className="u-mm u-block">Submit</p>
        </button>
      </div>
    </div>
  );
};

export { UpdateProfile, UpdateNotifs };
