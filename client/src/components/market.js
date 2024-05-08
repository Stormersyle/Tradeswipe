import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { get, post, convertToDisplay, getDateTime } from "../utilities.js";
import Waiting from "./waiting.js";
import NotLoggedIn from "./not_logged_in.js";
import ClientSocket from "../client-socket.js";

import Help from "./market-help.js";
import PopupForm from "./market-form.js";
import OrderBox from "./market-orders.js";
import MatchBox from "./market-matches.js";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "../stylesheets/market.css";

const DatePopup = ({ date, setDateFilter, setDate }) => {
  const [tempDate, setTempDate] = useState(new Date()); //date selected in the popup

  const closeDatePopup = () => {
    if (date === "any") setDateFilter("none");
    else setDateFilter("selected");
  };

  const submit = () => {
    if (tempDate) setDate(tempDate), setDateFilter("selected");
    else closeDatePopup();
  };

  return (
    <div>
      <dialog open className="popup">
        <p className="u-l">Select Date</p>
        <div className="linebreak-2"></div>
        <div className="input-column">
          <p>Date/Time:</p>
          <DatePicker
            selected={tempDate}
            onChange={(newDate) => setTempDate(newDate)}
            dateFormat="MM/dd/yyyy"
          />
        </div>
        <br />
        <div className="u-width-fill u-flex-center">
          <button onClick={closeDatePopup} className="default-button">
            Cancel
          </button>
          <button onClick={submit} className="default-button">
            Submit
          </button>
        </div>
      </dialog>
    </div>
  );
};

// keep the popup elements' display as a state
const Market = ({ user, loggedIn }) => {
  const [page, setPage] = useState("market"); //"market" or "match"
  const [formOpen, setFormOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [market, setMarket] = useState("any"); //"live" or "reserve"
  const [dhall, setDhall] = useState("any");
  const [type, setType] = useState("any"); //"buy" or "sell"
  const [meal, setMeal] = useState("any"); //"breakfast", "lunch", "dinner", "late night"
  const [mine, setMine] = useState("false"); //"true" or "false"; whether order is mine
  const [date, setDate] = useState("any"); //filter by date
  const [dateFilter, setDateFilter] = useState("any"); //"none", "select", "select new"

  const setPageMarket = () => setPage("market");
  const setPageMatch = () => setPage("match");
  const openForm = () => setFormOpen(true);
  const closeForm = () => setFormOpen(false);
  const openHelp = () => setHelpOpen(true);
  const closeHelp = () => setHelpOpen(false);

  if (!loggedIn) return <NotLoggedIn />;

  return (
    <div className="page-container styled-page-container">
      {page === "market" ? <p className="u-xl">Market</p> : <p className="u-xl">My Matches</p>}
      <br />
      {formOpen ? <PopupForm closeForm={closeForm} market={market} className="form" /> : null}
      {helpOpen ? <Help closeHelp={closeHelp} page={page} /> : null}
      <div className="market-box">
        <div className="u-flex-center">
          <button className="img-button left-help" onClick={openHelp}>
            <img src="/assets/help2.png" className="market-icon" />
          </button>
          <div className="u-flex-center">
            {page === "market" ? (
              <button className="filter-button market-button selected" onClick={setPageMarket}>
                <p className="u-mm">View Market</p>
              </button>
            ) : (
              <button className="filter-button market-button deselected" onClick={setPageMarket}>
                <p className="u-mm">View Market</p>
              </button>
            )}
            {page === "market" ? (
              <button className="filter-button match-button deselected" onClick={setPageMatch}>
                <p className="u-mm">My Matches</p>
              </button>
            ) : (
              <button className="filter-button match-button selected" onClick={setPageMatch}>
                <p className="u-mm">My Matches</p>
              </button>
            )}
          </div>
          {page === "market" ? (
            <button className="img-button right-plus" onClick={openForm}>
              <img src="/assets/plus.png" className="market-icon" />
            </button>
          ) : (
            <button className="img-button right-plus u-hide-but-keep-shape">
              <img src="/assets/plus.png" className="market-icon" />
            </button>
          )}
        </div>
        <br />
        <div className="u-flex u-justify-center u-align-center market-dropdown u-wrap">
          <div className="dropdown-menu u-flex u-width-fit">
            <label htmlFor="select-market" className="u-mm">
              Order For:&nbsp;
            </label>
            <select
              id="select-market"
              value={market}
              onChange={(event) => setMarket(event.target.value)}
            >
              <option value="any">Any</option>
              <option value="live">Now</option>
              <option value="reserve">Later</option>
            </select>
          </div>
          <div className="dropdown-menu u-flex u-width-fit">
            <label htmlFor="select-dhall" className="u-mm">
              Dining Hall:&nbsp;
            </label>
            <select
              id="select-dhall"
              value={dhall}
              onChange={(event) => setDhall(event.target.value)}
            >
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
            <select id="select-type" value={type} onChange={(event) => setType(event.target.value)}>
              <option value="any">Any</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <div className="dropdown-menu u-flex u-width-fit">
            <label htmlFor="select-meal" className="u-mm">
              From:&nbsp;
            </label>
            <select id="select-meal" value={mine} onChange={(event) => setMine(event.target.value)}>
              <option value="false">Anyone</option>
              <option value="true">Only Me</option>
            </select>
          </div>
        </div>
        {market !== "live" ? (
          <div className="u-flex u-justify-center u-align-center market-dropdown u-wrap">
            <div className="dropdown-menu u-flex u-width-fit">
              <label htmlFor="select-meal" className="u-mm">
                Meal:&nbsp;
              </label>
              <select
                id="select-meal"
                value={meal}
                onChange={(event) => setMeal(event.target.value)}
              >
                <option value="any">Any</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="late night">Late Night</option>
              </select>
            </div>
            <div className="dropdown-menu u-flex u-width-fit">
              <label htmlFor="select-date-filter" className="u-mm">
                Filter by date:&nbsp;
              </label>
              <select
                id="select-date-filter"
                value={dateFilter}
                onChange={(event) => {
                  if (event.target.value === "none") setDate("any");
                  setDateFilter(event.target.value);
                }}
              >
                <option value="none">All Dates</option>
                {date === "any" ? null : <option value="selected">Last Selected</option>}
                <option value="select new">Select New</option>
              </select>
            </div>
          </div>
        ) : null}
        {dateFilter === "select new" ? (
          <DatePopup setDateFilter={setDateFilter} setDate={setDate} />
        ) : null}
        <br />
        {page === "market" ? (
          <OrderBox market={market} dhall={dhall} type={type} meal={meal} mine={mine} date={date} />
        ) : (
          <MatchBox market={market} dhall={dhall} type={type} meal={meal} mine={mine} date={date} />
        )}
      </div>
    </div>
  );
};

export default Market;
