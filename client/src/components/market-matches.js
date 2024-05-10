import React, { useState, useEffect, useRef, useCallback } from "react";
import { get, post, convertToDisplay, getDateTime } from "../utilities.js";
import Waiting from "./waiting.js";
import ClientSocket from "../client-socket.js";

const ChatBox = ({ match_id, setChat }) => {
  const [person, setPerson] = useState(null); //person = the user we're matched with
  const [messages, setMessages] = useState(null); //array of messages.
  //message obj: {_id: String, match_id: String, sender: String, content: String, date: Date}
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);

  const init = async () => {
    const message_list = await get("/api/messages", { match_id: match_id });
    const other_person = await get("/api/other_person", { match_id: match_id });
    setPerson(other_person);
    setMessages(message_list);
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  };

  const handleNewMessage = useCallback(
    (newMessage) => {
      if (newMessage.match_id !== match_id) return;
      setMessages((currentMessages) => [...currentMessages, newMessage]);
    },
    [match_id]
  );

  useEffect(() => {
    init();
    ClientSocket.listen("new_message", handleNewMessage);
    return () => ClientSocket.remove_listener("new_message", handleNewMessage);
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages]);

  const submit = () => {
    if (!inputRef.current) return;
    post("/api/message", { match_id: match_id, content: inputRef.current.value }).then(
      () => (inputRef.current.value = "")
    );
  };

  const display_message = (message) => {
    const today = new Date();
    const isToday = getDateTime(message.date).date === getDateTime(today).date;
    return (
      <div key={message._id}>
        <p className="u-mm">
          <b>{message.sender}</b>&nbsp;{isToday ? "Today" : getDateTime(message.date).bareDate}
          &nbsp;
          {getDateTime(message.date).time}
        </p>
        <p className="u-mm">{message.content}</p>
        <div className="linebreak-0pt5"></div>
      </div>
    );
  };

  if (!person || !person.name)
    return (
      <dialog open className="popup chat-box">
        <p className="u-mmm form-title">Chat</p>
        <br />
        <p>Finding match...</p>
      </dialog>
    );

  return (
    <dialog open className="popup chat-box">
      <div className="u-flex u-justify-space-between u-align-start">
        <p className="u-mmm form-title">Chatting with: {person.kerb ? person.kerb : person.name}</p>
        <button className="img-button close-chat" onClick={() => setChat(null)}>
          <img src="./assets/close.png" className="x-icon" />
        </button>
      </div>
      <div className="linebreak-2"></div>
      <div className="messages-container" ref={chatBoxRef}>
        {messages ? messages.map(display_message) : <p>No messages yet!</p>}
      </div>
      <div className="linebreak-1"></div>
      <div className="u-flex">
        <input
          type="text"
          ref={inputRef}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          className="u-width-fill u-mm"
        />
        <button className="img-button" onClick={submit}>
          <img src="/assets/send.png" className="send-icon" />
        </button>
      </div>
    </dialog>
  );
};

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
const create_display_match = (filter, setChat) => {
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
        <div className="u-flex u-justify-space-between u-align-end">
          <p>Your role: {convertToDisplay(match.my_role)}</p>
          <button className="img-button" onClick={() => setChat(match._id)}>
            <img src="/assets/chat.png" className="chat-icon" />
          </button>
        </div>
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
  const [chat, setChat] = useState(null); //chat = match id for our open chat; if chat closed, chat=null

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
      {chat ? <ChatBox match_id={chat} setChat={setChat} /> : null}
      {matches.map(
        create_display_match(
          { market: market, dhall: dhall, meal: meal, date: date, state: state },
          setChat
        )
      )}
    </div>
  );
};

export default MatchBox;
