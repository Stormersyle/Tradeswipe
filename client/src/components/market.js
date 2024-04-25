import React, { useState, useEffect, useRef } from "react";
import "../stylesheets/market.css";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PopupForm = ({ closeForm, market }) => {
  // closeForm = method to close the form; market = "live" or "reserve"
  const [type, setType] = useState(""); //type = "buy" or "sell"
  const [startDate, setStartDate] = useState(new Date());

  return (
    <dialog open id="dialog">
      <p className="u-l form-title">{market === "live" ? "Live" : "Reservation"} Order Form</p>
      <br />
      <div className="input-row">
        <label htmlFor="form-type">Buy/Sell:&nbsp;</label>
        <select id="form-type" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">Select</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>
      <div className="linebreak-2"></div>
      <div className="input-row">
        <label htmlFor="form-dhall">Dining Hall:&nbsp;</label>
        <select id="form-dhall">
          <option value="">Select</option>
          <option value="Maseeh">Maseeh</option>
          <option value="Next">Next</option>
          <option value="Simmons">Simmons</option>
          <option value="Baker">Baker</option>
          <option value="NV">New Vassar</option>
          <option value="MCC">McCormick</option>
        </select>
      </div>
      <div className="linebreak-2"></div>
      <div className="input-row">
        <label htmlFor="form-price">Price: $</label>
        <input id="form-price" type="number" />
      </div>
      <div className="linebreak-2"></div>
      {type === "sell" ? (
        <div className="input-row">
          <label htmlFor="form-quantity">Quantity:&nbsp;</label>
          <input id="form-quantity" type="number" />
        </div>
      ) : null}
      {type === "sell" ? <div className="linebreak-2"></div> : null}
      {market === "reserve" ? (
        <div className="input-column">
          <p>Date/Time:</p>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            timeInputLabel="Time:"
            dateFormat="MM/dd/yyyy h:mm aa"
            showTimeInput
          />
        </div>
      ) : null}
      {market === "reserve" ? <div className="linebreak-2"></div> : null}
      <div className="u-width-fill u-flex-center">
        <button onClick={closeForm} className="default-button">
          Cancel
        </button>
        <button onClick={closeForm} className="default-button">
          Submit
        </button>
      </div>
    </dialog>
  );
};

// keep the form element as a state
const Market = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [market, setMarket] = useState("");
  const [dhall, setDhall] = useState("any");
  const [type, setType] = useState("any"); //type="buy" or "sell"
  const [meal, setMeal] = useState("any"); //"breakfast", "lunch", "dinner", "late Night"

  const openForm = () => {
    if (market) setFormOpen(true);
    else alert("You must select a market before ordering!");
  };
  const closeForm = () => setFormOpen(false);
  const setLive = () => setMarket("live");
  const setReserve = () => setMarket("reserve");

  return (
    <div className="page-container styled-page-container">
      <p className="u-xl">Market</p>
      <br />
      {formOpen ? <PopupForm closeForm={closeForm} market={market} className="form" /> : null}
      <div className="market-box">
        <div className="u-flex-center">
          <button className="img-button left-help">
            <img src="/assets/help2.png" className="market-icon" />
          </button>
          <div className="u-flex-center">
            {market === "live" ? (
              <button className="filter-button live-button selected" onClick={setLive}>
                <p className="u-mm">Live Market</p>
              </button>
            ) : (
              <button className="filter-button live-button deselected" onClick={setLive}>
                <p className="u-mm">Live Market</p>
              </button>
            )}
            {market === "reserve" ? (
              <button className="filter-button reserve-button selected" onClick={setReserve}>
                <p className="u-mm">Reservations</p>
              </button>
            ) : (
              <button className="filter-button reserve-button deselected" onClick={setReserve}>
                <p className="u-mm">Reservations</p>
              </button>
            )}
          </div>
          <button className="img-button right-plus" onClick={openForm}>
            <img src="/assets/plus.png" className="market-icon" />
          </button>
        </div>
        <br />
        <div className="u-flex u-justify-center u-align-center market-dropdown u-wrap">
          <div className="dropdown-menu u-flex u-width-fit">
            <label htmlFor="select-dhall" className="u-mm">
              Dining Hall:&nbsp;
            </label>
            <select id="select-dhall">
              <option value="any">Any</option>
              <option value="maseeh">Maseeh</option>
              <option value="nv">New Vassar</option>
              <option value="mcc">McCormick</option>
              <option value="baker">Baker</option>
              <option value="simmons">Simmons</option>
              <option value="next">Next</option>
            </select>
          </div>
          <div className="dropdown-menu u-flex u-width-fit">
            <label htmlFor="select-type" className="u-mm">
              Order Type:&nbsp;
            </label>
            <select id="select-type">
              <option value="any">Any</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          {market === "reserve" ? (
            <div className="dropdown-menu u-flex u-width-fit">
              <label htmlFor="select-meal" className="u-mm">
                Meal:&nbsp;
              </label>
              <select id="select-meal">
                <option value="any">Any</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Brunch/Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="late Night">Late Night</option>
              </select>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Market;
