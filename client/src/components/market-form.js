import React, { useState, useRef } from "react";
import { post } from "../utilities.js";

import DatePicker from "react-datepicker";

const PopupForm = ({ closeForm }) => {
  // closeForm = method to close the form
  const [type, setType] = useState(""); //type = "buy" or "sell"
  const [market, setMarket] = useState(""); //market = "live" or "reserve"
  const [date, setDate] = useState(new Date());
  const dhallRef = useRef(null);
  const priceRef = useRef(null);
  const quantRef = useRef(null);

  const submit = () => {
    if (dhallRef.current && priceRef.current && quantRef.current) {
      const order = {
        market: market,
        type: type,
        date: date,
        dhall: dhallRef.current.value,
        price: priceRef.current.value,
        quantity: quantRef.current.value,
      };
      post("/api/order", order).then(({ msg }) => {
        closeForm();
        alert(msg);
      });
    }
  };

  return (
    <dialog open className="popup">
      <p className="u-l form-title">Order Form</p>
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
        <label htmlFor="form-market">For:&nbsp;</label>
        <select id="form-market" value={market} onChange={(event) => setMarket(event.target.value)}>
          <option value="">Select</option>
          <option value="live">Now</option>
          <option value="reserve">Later</option>
        </select>
      </div>
      <div className="linebreak-2"></div>
      <div className="input-row">
        <label htmlFor="form-dhall">Dining Hall:&nbsp;</label>
        <select id="form-dhall" ref={dhallRef}>
          <option value="">Select</option>
          <option value="maseeh">Maseeh</option>
          <option value="nv">New Vassar</option>
          <option value="mcc">McCormick</option>
          <option value="baker">Baker</option>
          <option value="simmons">Simmons</option>
          <option value="next">Next</option>
        </select>
      </div>
      <div className="linebreak-2"></div>
      <div className="input-row">
        <label htmlFor="form-price">Price: $</label>
        <input id="form-price" type="number" ref={priceRef} />
      </div>
      <div className="linebreak-2"></div>
      {type === "sell" ? (
        <div className="input-row">
          <label htmlFor="form-quantity">Quantity:&nbsp;</label>
          <input id="form-quantity" type="number" defaultValue="1" ref={quantRef} />
        </div>
      ) : (
        <div className="input-row u-hide">
          <label htmlFor="form-quantity">Quantity:&nbsp;</label>
          <input id="form-quantity" type="number" defaultValue="1" ref={quantRef} />
        </div>
      )}
      {type === "sell" ? <div className="linebreak-2"></div> : null}
      {market === "reserve" ? (
        <div className="input-column">
          <p>Date/Time:</p>
          <DatePicker
            selected={date}
            onChange={(newDate) => setDate(newDate)}
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
        <button onClick={submit} className="default-button">
          Submit
        </button>
      </div>
    </dialog>
  );
};

export default PopupForm;
