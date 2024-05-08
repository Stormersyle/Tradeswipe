import React, { useState, useEffect, useCallback } from "react";
import { get, post, convertToDisplay, getDateTime } from "../utilities.js";
import Waiting from "./waiting.js";
import NotLoggedIn from "./not_logged_in.js";
import ClientSocket from "../client-socket.js";
import "../stylesheets/market.css";

//displays the info of the other person
const MatchInfo = ({ match_id, my_role, state }) => {
  const [person, setPerson] = useState(null); //person = the user we're matched with

  useEffect(() => {
    get("/api/other_person", { match_id: match_id }).then((other_person) =>
      setPerson(other_person)
    );
  }, [state, match_id]);

  if (!person)
    return (
      <div>
        <p>
          <b>Your Match</b>
        </p>
        <p>Loading Information</p>
      </div>
    );

  return (
    <div>
      <p>
        <b>Your Match</b>
      </p>
      <p>Name: {person.name}</p>
      <p>Phone Number: {person.phone_number}</p>
      {my_role === "buyer" ? <p>Venmo Username: {person.venmo_username}</p> : null}
      {my_role === "buyer" ? <p>Directions: {person.directions}</p> : null}
    </div>
  );
};

//given a filter, creates display_match function with this filter
//filter: properties market, dhall, meal, state
const create_display_match = (filter) => {
  const display_match = (match) => {
    if (filter.market !== match.market) return null;
    if (filter.market === "reserve") {
      if (filter.dhall !== match.dhall && filter.dhall !== "any") return null;
      if (filter.meal !== match.meal && filter.meal !== "any") return null;
    }
    if (match.my_role === "buyer" && match.buyer_finished) return null;
    if (match.my_role === "seller" && match.seller_finished) return null;

    return (
      <div key={match._id} className="match">
        <div className="linebreak-1"></div>
        <p>
          Your role: {convertToDisplay(match.my_role)} | Price: ${match.price.toFixed(2)}
        </p>
        <p>Dining Hall: {convertToDisplay(match.dhall)}</p>
        {match.market === "reserve" ? (
          <div>
            <p>
              Date/Time: {getDateTime(match.date).date} {getDateTime(match.date).time}
            </p>
            <p>Meal: {convertToDisplay(match.meal)}</p>
          </div>
        ) : null}
        <div className="linebreak-2"></div>
        <MatchInfo match_id={match._id} my_role={match.my_role} state={filter.state} />
        <div className="linebreak-2"></div>
        <div className="u-flex">
          <button
            className="cancel-match"
            onClick={() => post("/api/cancel_match", { match_id: match._id })}
          >
            Cancel
          </button>
          <button
            className="finish-match"
            onClick={() => post("/api/finish_match", { match_id: match._id })}
          >
            Finish
          </button>
        </div>
      </div>
    );
  };
  return display_match;
};

const MatchBox = ({ market, dhall, meal }) => {
  const [matches, setMatches] = useState(null);
  const [state, setState] = useState(1); //this is # of times it's been re-rendered; point is to force <MatchInfo/> to re-init each time we hear "update_matches"

  const init = useCallback(() => {
    get("/api/matches").then((match_list) => {
      setMatches(match_list);
      setState((c) => c + 1);
    });
  }, []);

  useEffect(() => {
    init();
    ClientSocket.listen("update_matches", init);
    return () => ClientSocket.remove_listener("update_matches", init);
  }, []);

  if (!matches) return <Waiting />;
  if (!market)
    return (
      <div className="u-width-fill ">
        <p className="u-mm select-instructions">
          Select a market (live or reservation) to view orders.
        </p>
      </div>
    );
  return (
    <div className="match-box">
      {matches.map(
        create_display_match({ market: market, dhall: dhall, meal: meal, state: state })
      )}
    </div>
  );
};

const MatchPage = ({ loggedIn }) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [market, setMarket] = useState(""); //market = "live" or "reserve"
  const [dhall, setDhall] = useState("any");
  const [meal, setMeal] = useState("any");

  const openHelp = () => setHelpOpen(true);
  const closeHelp = () => setHelpOpen(false);
  const setLive = () => setMarket("live");
  const setReserve = () => setMarket("reserve");

  if (!loggedIn) return <NotLoggedIn />;

  return (
    <div className="page-container styled-page-container">
      <p className="u-xl">Matches</p>
      <br />
      {helpOpen ? <Help closeHelp={closeHelp} /> : null}
      <div className="market-box">
        <div className="u-flex-center">
          <button className="img-button left-help" onClick={openHelp}>
            <img src="/assets/help2.png" className="market-icon" />
          </button>
          <div className="u-flex-center">
            {market === "live" ? (
              <button className="filter-button live-button selected" onClick={setLive}>
                <p className="u-mm">&nbsp;&nbsp;&nbsp;Live&nbsp;&nbsp;&nbsp;</p>
              </button>
            ) : (
              <button className="filter-button live-button deselected" onClick={setLive}>
                <p className="u-mm">&nbsp;&nbsp;&nbsp;Live&nbsp;&nbsp;&nbsp;</p>
              </button>
            )}
            {market === "reserve" ? (
              <button className="filter-button reserve-button selected" onClick={setReserve}>
                <p className="u-mm">Reserve</p>
              </button>
            ) : (
              <button className="filter-button reserve-button deselected" onClick={setReserve}>
                <p className="u-mm">Reserve</p>
              </button>
            )}
          </div>
          <button className="img-button right-plus u-hide-but-keep-shape">
            <img src="/assets/plus.png" className="market-icon" />
          </button>
        </div>
        <br />
        {market === "reserve" ? (
          <div className="u-flex u-justify-center u-align-center market-dropdown u-wrap">
            <div className="dropdown-menu u-flex u-width-fit">
              <label htmlFor="select-dhall-match" className="u-mm">
                Dining Hall:&nbsp;
              </label>
              <select
                id="select-dhall-match"
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
        ) : null}
        {market === "reserve" ? <br /> : null}
        <MatchBox market={market} dhall={dhall} meal={meal} />
      </div>
    </div>
  );
};

export default MatchPage;
