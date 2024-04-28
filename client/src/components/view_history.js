import React, { useState, useEffect } from "react";
import { get, convertToDisplay, getDateTime } from "../utilities.js";
import { useNavigate } from "react-router-dom";
import Waiting from "./waiting.js";
import NotLoggedIn from "./not_logged_in.js";
import ClientSocket from "../client-socket.js";
import "../stylesheets/market.css";

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
      <div key={transaction._id} className="match">
        <div className="linebreak-2"></div>
        <p>
          <b>Your role:</b> {convertToDisplay(transaction.my_role)}
        </p>
        <p>
          <b>Price:</b> ${transaction.price.toFixed(2)}
        </p>
        <p>
          <b>Dining Hall:</b> {convertToDisplay(transaction.dhall)}
        </p>
        <p>
          <b>Meal:</b> {convertToDisplay(transaction.meal)}
        </p>
        <p>
          <b>Date/Time:</b> {getDateTime(transaction.date).date}{" "}
          {getDateTime(transaction.date).time}
        </p>
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
    ClientSocket.listen("update_transactions", init);
    return () => ClientSocket.remove_listener("update_transactions", init);
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
  const [market, setMarket] = useState("any");
  const [dhall, setDhall] = useState("any");
  const [meal, setMeal] = useState("any");

  if (!loggedIn) return <NotLoggedIn />;

  return (
    <div className="page-container styled-page-container">
      <p className="u-xl">Transactions</p>
      <br />
      <div className="market-box">
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
              <option value="reserve">Reserve</option>
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
            <label htmlFor="select-meal-history" className="u-mm">
              Meal:&nbsp;
            </label>
            <select
              id="select-meal-history"
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
        <div className="linebreak-1"></div>
        <div className="u-flex u-justify-center">
          <button className="default-button" onClick={() => navigate("/profile")}>
            <p className="u-mm">Return to Profile</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;
