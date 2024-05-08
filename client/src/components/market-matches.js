import React, { useState, useEffect, useCallback } from "react";
import { get, post, convertToDisplay, getDateTime } from "../utilities.js";
import Waiting from "./waiting.js";
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
      <p>Kerb: {person.kerb}</p>
      <p>Phone Number: {person.phone_number}</p>
      {/* {my_role === "buyer" ? <p>Venmo Username: {person.venmo_username}</p> : null} */}
      {my_role === "buyer" ? <p>Directions: {person.directions}</p> : null}
    </div>
  );
};

//given a filter, creates display_match function with this filter
//filter: properties market, dhall, meal, state, date
//meal, date filters only apply for reserve matches
const create_display_match = (filter) => {
  const datesEqual = (date1, date2) => getDateTime(date1).date === getDateTime(date2).date;
  const display_match = (match) => {
    if (filter.market !== match.market && filter.market !== "any") return null;
    if (filter.dhall !== match.dhall && filter.dhall !== "any") return null;
    if (filter.market !== "live") {
      if (filter.meal !== match.meal && filter.meal !== "any") return null;
      if (!datesEqual(filter.date, match.date) && filter.date !== "any") return null;
    }
    if (match.my_role === "buyer" && match.buyer_finished) return null;
    if (match.my_role === "seller" && match.seller_finished) return null;

    return (
      //leave out price for now
      <div key={match._id} className="match">
        <div className="linebreak-1"></div>
        <p>Your role: {convertToDisplay(match.my_role)}</p>
        <p>Dining Hall: {convertToDisplay(match.dhall)}</p>
        <p>For {convertToDisplay(match.market)}</p>
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

const MatchBox = ({ market, dhall, meal, date }) => {
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
        create_display_match({ market: market, dhall: dhall, meal: meal, date: date, state: state })
      )}
    </div>
  );
};

export default MatchBox;
