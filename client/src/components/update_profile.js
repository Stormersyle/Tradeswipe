import React, { useRef } from "react";
import { post } from "../utilities.js";

import "../stylesheets/profile.css";

const UpdateNotifs = ({ user, updateUser, closeUpdateNotifs }) => {
  const liveRef = useRef(null),
    reserveRef = useRef(null);

  const submit_notifs = () => {
    if (liveRef.current && reserveRef.current) {
      post("/api/update_notifs", {
        live_notifs: liveRef.current.checked,
        reserve_notifs: reserveRef.current.checked,
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
          <b>Live Match Notifications:&nbsp;</b>
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
          <b>Reserve Match Notifications:&nbsp;</b>
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

//chat gpt generated regex, may or may not be correct ...
const validate_profile = (profile) => {
  const { name, is_buyer, is_seller, phone_number, venmo_username } = profile;
  for (let x of [name, phone_number, venmo_username]) {
    if (typeof x !== "string") return false;
  }
  if (!(typeof is_buyer === "boolean" && typeof is_seller === "boolean")) return false;

  const regex_name = /^[A-Za-z]+ [A-Za-z]+$/;
  const regex_venmo = /^[a-zA-Z0-9_-]{5,30}$/;
  const regex_phone = /^[\d\s\-\(\)\+]*(?:\d[\d\s\-\(\)\+]*){7,}$/;

  if (!regex_name.test(name)) {
    alert("Invalid name. Please input it as: [firstname lastname]");
    return false;
  }
  if ((is_buyer || is_seller) && !regex_phone.test(phone_number)) {
    alert(
      "Invalid phone number. All buyers and sellers are required to input a valid phone number."
    );
    return false;
  }
  if (is_seller && !regex_venmo.test(venmo_username)) {
    alert("Invalid Venmo username. All sellers are required to input a valid Venmo username.");
    return false;
  }
  return true;
  //rules: everyone must have a valid name (you can't change ur email)
  //all buyers and sellers must have a valid phone number
  //all sellers must have a valid venmo
};

//props:
//user =   {name: String, is_buyer: Boolean, is_seller: Boolean,
//         email: String, phone_number: String, venmo_username: String, googleid: String, directions: String}
//updateUser = func(). Tells App to call "/api/who_am_i" (so that updated user is stored)

const UpdateProfile = ({ user, updateUser, closeUpdateProfile }) => {
  const nameRef = useRef(null),
    phoneRef = useRef(null),
    buyerRef = useRef(null),
    sellerRef = useRef(null),
    venmoRef = useRef(null),
    directionsRef = useRef(null);

  const { name, is_buyer, is_seller, email, phone_number, venmo_username, directions } = user;
  const create_new_profile = () => {
    let profile = {
      name: name,
      phone_number: phone_number,
      is_buyer: is_buyer,
      is_seller: is_seller,
      venmo_username: venmo_username,
      directions: directions,
    };
    if (nameRef.current) profile.name = nameRef.current.value;
    if (phoneRef.current) profile.phone_number = phoneRef.current.value;
    if (buyerRef.current) profile.is_buyer = buyerRef.current.checked;
    if (sellerRef.current) profile.is_seller = sellerRef.current.checked;
    if (venmoRef.current) profile.venmo_username = venmoRef.current.value;
    if (directionsRef.current) profile.directions = directionsRef.current.value;
    // console.log(profile);
    return profile;
  };
  const submit_profile = () => {
    const new_profile = create_new_profile();
    if (validate_profile(new_profile))
      post("/api/update_profile", new_profile).then(() => {
        updateUser();
        closeUpdateProfile();
      });
  };

  return (
    <div className="profile-box">
      <p className="u-l u-flex u-justify-center">Profile</p>
      <div className="linebreak-1"></div>
      <div className="input-row">
        <label htmlFor="name">
          <b>Name:&nbsp;</b>
        </label>
        <input id="name" type="text" defaultValue={name} ref={nameRef} />
      </div>
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
      <div className="input-row">
        <label htmlFor="venmo_username">
          <b>Venmo Username:&nbsp;</b>
        </label>
        <input id="venmo_username" type="text" defaultValue={venmo_username} ref={venmoRef}></input>
      </div>
      <div className="linebreak-1"></div>
      <div className="input-row">
        <label htmlFor="is_buyer">
          <b>Buyer Enabled:&nbsp;</b>
        </label>
        {is_buyer ? (
          <input
            id="is_buyer"
            type="checkbox"
            ref={buyerRef}
            defaultChecked={true}
            className="checkbox"
          />
        ) : (
          <input id="is_buyer" type="checkbox" ref={buyerRef} className="checkbox" />
        )}
      </div>
      <div className="linebreak-1"></div>
      <div className="input-row">
        <label htmlFor="is_seller">
          <b>Seller Enabled:&nbsp;</b>
        </label>
        {is_seller ? (
          <input
            id="is_seller"
            type="checkbox"
            ref={sellerRef}
            defaultChecked={true}
            className="checkbox"
          />
        ) : (
          <input id="is_seller" type="checkbox" ref={sellerRef} className="checkbox" />
        )}
      </div>
      <div className="linebreak-1"></div>
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
