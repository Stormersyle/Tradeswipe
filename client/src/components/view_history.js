import React, { useState, useEffect } from "react";
import { get, post, convertToDisplay, getDateTime } from "../utilities.js";
import { useNavigate } from "react-router-dom";
import Waiting from "./waiting.js";
import NotLoggedIn from "./not_logged_in.js";
import ClientSocket from "../client-socket.js";
import "../stylesheets/market.css";

const Help = ({ closeHelp }) => {
  return (
    <dialog open className="popup help">
      <p className="u-l">History Help</p>
      <div className="linebreak-2"></div>
      <p className="u-mm">
        Tradeswipe supports a market for live orders (i.e. buying/selling swipes in real time) and a
        market for reservation orders (i.e. buying/selling swipes for a specified future date/time).
        On the Market page, you can view these markets, and you can claim other people's orders or
        place your own. Note that if you claim someone's $X buy order, you're <b>selling</b> a swipe
        for $X; if you claim someone's $X sell order, you're <b>buying</b> a swipe for $X.
      </p>
      <div className="linebreak-2"></div>
      <p className="u-mm">
        Once someone claims another person's order, a match is made and the order is taken off the
        market. You can view your matches and pending orders on the "Match" page, and you will also
        be notified of new matches. You will be notified both on the website and via email;{" "}
        <b>
          make sure to unblock{" "}
          <a href="mailto:tradeswipe-mit@gmail.com">tradeswipe-mit@gmail.com</a>
        </b>{" "}
        from your spam!
      </p>
      <br />
      <button onClick={closeHelp} className="default-button">
        Close
      </button>
    </dialog>
  );
};

// my_role: req.user._id.toString() === transaction.buyer_id ? "buyer" : "seller",
// meal: transaction.meal,
// dhall: transaction.dhall,
// price: transaction.price,
// date: transaction.date,

//given a filter, creates display_transaction function with this filter
//filter: properties market, dhall, meal
const create_display_transaction = (filter) => {
  const display_transaction = (transaction) => {
    if (filter.market !== transaction.market && filter.market !== "any") return null;
    if (filter.dhall !== transaction.dhall && filter.dhall !== "any") return null;
    if (filter.meal !== transaction.meal && filter.meal !== "any") return null;

    return (
      <div key={match._id} className="transaction">
        <div className="linebreak-2"></div>
        <p>Your role: {convertToDisplay(match.my_role)}</p>
        <p>Price: ${match.price.toFixed(2)}</p>
        <p>Dining Hall: {convertToDisplay(match.dhall)}</p>
        <p>
          Date/Time: {getDateTime(match.date).date} {getDateTime(match.date).time}
        </p>
        <p>Meal: {convertToDisplay(match.meal)}</p>
        <div className="linebreak-2"></div>
      </div>
    );
  };
  return display_transaction;
};

const HistoryBox = ({ market, dhall, meal }) => {
  const [transactions, setTransactions] = useState(null);

  useEffect(() => {
    const init = () => {
      get("/api/transaction_history").then((transactions) => setTransactions(transactions));
    };
    init();
    ClientSocket.listen("update_history", init);
    return () => ClientSocket.remove_listener("update_history", init);
  }, []);

  if (!transactions) return <Waiting />;
  return (
    <div className="match-box">
      {transactions.map(create_display_transaction({ market: market, dhall: dhall, meal: meal }))}
    </div>
  );
};

const History = ({ loggedIn }) => {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const [market, setMarket] = useState(""); //market = "live" or "reserve"
  const [dhall, setDhall] = useState("any");
  const [meal, setMeal] = useState("any");

  const openHelp = () => setHelpOpen(true);
  const closeHelp = () => setHelpOpen(false);

  if (!loggedIn) return <NotLoggedIn />;

  return (
    <div className="page-container styled-page-container">
      <p className="u-xl">Matches</p>
      <br />
      {helpOpen ? <Help closeHelp={closeHelp} /> : null}
      <div className="match-box">
        <div className="u-flex-center">
          <button className="img-button left-help" onClick={openHelp}>
            <img src="/assets/help2.png" className="market-icon" />
          </button>
          <button className="img-button right-plus u-hide-but-keep-shape">
            <img src="/assets/plus.png" className="market-icon" />
          </button>
        </div>
        <br />
        <div className="u-flex u-justify-center u-align-center market-dropdown u-wrap">
          <div className="dropdown-menu u-flex u-width-fit">
            <label htmlFor="select-market-history" className="u-mm">
              Market:&nbsp;
            </label>
            <select
              id="select-market-history"
              value={market}
              onChange={(event) => setMarket(event.target.value)}
            >
              <option value="any">Any</option>
              <option value="live">Live</option>
              <option value="reserve">Reservation</option>
            </select>
          </div>
          <div className="dropdown-menu u-flex u-width-fit">
            <label htmlFor="select-dhall-history" className="u-mm">
              Dining Hall:&nbsp;
            </label>
            <select
              id="select-dhall-history"
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
            <label htmlFor="select-meal-match" className="u-mm">
              Meal:&nbsp;
            </label>
            <select
              id="select-meal-match"
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
        </div>
        <br />
        <HistoryBox market={market} dhall={dhall} meal={meal} />
        <br />
        <button className="default-button" onClick={() => navigate("/profile")}>
          <p className="u-mm">Return to Profile</p>
        </button>
      </div>
    </div>
  );
};

export default History;
