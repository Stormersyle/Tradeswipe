import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { get, post, convertToDisplay, getDateTime } from "../utilities.js";
import Waiting from "./waiting.js";
import NotLoggedIn from "./not_logged_in.js";
import ClientSocket from "../client-socket.js";

import "react-datepicker/dist/react-datepicker.css";
import "../stylesheets/market.css";

import Help from "./market-help.js";
import PopupForm from "./market-form.js";

//given a filter, creates display_order function with this filter
//filter obj has keys market, dhall, type, meal, and day
const create_display_order = (filter) => {
  const display_order = (order) => {
    if (order.market != filter.market) return null;
    if (filter.mine === "true" && order.mine === "false") return null;
    if (order.type != filter.type && filter.type != "any") return null;
    if (order.dhall != filter.dhall && filter.dhall != "any") return null;
    if (filter.market === "reserve") {
      if (order.meal != filter.meal && filter.meal != "any") return null;
      if (getDateTime(order.date).dayOfWeek != filter.day && filter.day != "any") return null;
    }

    return (
      <div key={order._id} className="order">
        <div className="linebreak-1"></div>
        <p>
          {convertToDisplay(order.type)} for: ${order.price.toFixed(2)}
        </p>
        <div className="linebreak-1"></div>
        <p>{convertToDisplay(order.dhall)}</p>
        <div className="linebreak-1"></div>
        {order.market === "reserve" ? (
          <div className="u-width-fill u-flex-col">
            <p>
              <span className="mobile-hide">Date:&nbsp;</span>
              {getDateTime(order.date).date}
            </p>
            <div className="linebreak-1"></div>
            <p>
              <span className="mobile-hide">Time:&nbsp;</span>
              {getDateTime(order.date).time}
            </p>
            <div className="linebreak-1"></div>
            <p>
              <span className="mobile-hide">Meal:&nbsp;</span>
              {convertToDisplay(order.meal)}
            </p>
            <div className="linebreak-1"></div>
          </div>
        ) : null}
        {order.mine === "true" ? (
          <button
            className="cancel-button"
            onClick={() => post("/api/cancel_order", { order_id: order._id })}
          >
            Cancel
          </button>
        ) : (
          <button
            className="claim-button"
            onClick={() => post("/api/claim_order", { order_id: order._id })}
          >
            Claim
          </button>
        )}
      </div>
    );
  };
  return display_order;
};

const OrderBox = ({ market, dhall, type, meal, mine, day }) => {
  const [orders, setOrders] = useState(null);

  const init = useCallback(() => {
    get("/api/orders").then((order_arr) => setOrders(order_arr));
  }, []);

  useEffect(() => {
    init();
    ClientSocket.listen("update_order_book", init);
    return () => ClientSocket.remove_listener("update_order_book", init);
  }, []); //also call init() whenever socket tells us to update

  if (!orders) return <Waiting />;
  if (!market)
    return (
      <div className="u-width-fill ">
        <p className="u-mm select-instructions">
          Select a market (live or reservation) to view orders.
        </p>
      </div>
    );
  if (market === "live")
    return (
      <div className="order-box">
        {orders.map(
          create_display_order({
            market: market,
            dhall: dhall,
            type: type,
            meal: meal,
            mine: mine,
            day: day,
          })
        )}
      </div>
    );
  return (
    <div className="order-box">
      {orders
        .map(
          create_display_order({
            market: market,
            dhall: dhall,
            type: type,
            meal: meal,
            mine: mine,
            day: day,
          })
        )
        .reverse()}
    </div>
  );
};

// keep the popup elements' display as a state
const Market = ({ user, loggedIn }) => {
  const [page, setPage] = useState("market"); //"market" or "match"
  const [formOpen, setFormOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [market, setMarket] = useState("any");
  const [dhall, setDhall] = useState("any");
  const [type, setType] = useState("any"); //"buy" or "sell"
  const [meal, setMeal] = useState("any"); //"breakfast", "lunch", "dinner", "late night"
  const [mine, setMine] = useState("false"); //"true" or "false"; whether order is mine
  const [day, setDay] = useState("any"); //"true" or "false"; whether order is mine

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
          <button className="img-button right-plus" onClick={openForm}>
            <img src="/assets/plus.png" className="market-icon" />
          </button>
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
        {market === "reserve" ? (
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
              <label htmlFor="select-day" className="u-mm">
                Day:&nbsp;
              </label>
              <select id="select-day" value={day} onChange={(event) => setDay(event.target.value)}>
                <option value="any">Any</option>
                <option value="Mon">Monday</option>
                <option value="Tue">Tuesday</option>
                <option value="Wed">Wednesday</option>
                <option value="Thu">Thursday</option>
                <option value="Fri">Friday</option>
                <option value="Sat">Saturday</option>
                <option value="Sun">Sunday</option>
              </select>
            </div>
          </div>
        ) : null}
        <br />
        <OrderBox market={market} dhall={dhall} type={type} meal={meal} mine={mine} day={day} />
      </div>
    </div>
  );
};

export default Market;
