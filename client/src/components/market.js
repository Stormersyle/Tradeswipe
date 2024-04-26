import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { get, post, convertToDisplay, getDateTime } from "../utilities.js";
import Waiting from "./waiting.js";
import NotLoggedIn from "./not_logged_in.js";
import ClientSocket from "../client-socket.js";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../stylesheets/market.css";

// use controlled components this time, not refs
const PopupForm = ({ closeForm, market }) => {
  // closeForm = method to close the form; market = "live" or "reserve"
  const [type, setType] = useState(""); //type = "buy" or "sell"
  const [date, setDate] = useState(new Date());
  const dhallRef = useRef(null);
  const priceRef = useRef(null);
  const quantRef = useRef(null);
  const navigate = useNavigate();

  const validate_order = ({ type, date, dhall, price, quantity }) => {
    price = Number(price);
    quantity = Number(quantity);
    if (!(type && date && dhall && price && quantity)) {
      alert("Form not complete!");
      return false;
    }
    if (price < 0 || price > 20) {
      alert("Price must be at leaast $0 and at most $20!");
      return false;
    }
    if (quantity < 1 || quantity > 10) {
      alert("Quantity must be an integer from 1 through 10!");
      return false;
    }
    return true;
  };

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
      if (!validate_order(order)) return;
      post("/api/order", order).then(({ msg }) => {
        closeForm();
        alert(msg);
      });
    }
  };

  return (
    <dialog open className="popup">
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

const Help = ({ closeHelp }) => {
  return (
    <dialog open className="popup help">
      <p className="u-l">Market</p>
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

//filter obj has keys market, dhall, type, meal
const create_display_order = (filter) => {
  //creates display_order function with this filter
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
          <button className="claim-button">Claim</button>
        )}
      </div>
    );
  };
  return display_order;
};

const OrderBox = ({ market, dhall, type, meal, mine, day }) => {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    const init = () => {
      get("/api/orders").then((order_arr) => setOrders(order_arr));
    };
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
  const [formOpen, setFormOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [market, setMarket] = useState("");
  const [dhall, setDhall] = useState("any");
  const [type, setType] = useState("any"); //type="buy" or "sell"
  const [meal, setMeal] = useState("any"); //"breakfast", "lunch", "dinner", "late night"
  const [mine, setMine] = useState("false"); //"true" or "false"; whether order is mine
  const [day, setDay] = useState("any"); //"true" or "false"; whether order is mine

  const openForm = () => {
    if (market) setFormOpen(true);
    else alert("You must select a market before ordering!");
  };
  const closeForm = () => setFormOpen(false);
  const openHelp = () => setHelpOpen(true);
  const closeHelp = () => setHelpOpen(false);
  const setLive = () => setMarket("live");
  const setReserve = () => setMarket("reserve");

  if (!loggedIn) return <NotLoggedIn />;

  return (
    <div className="page-container styled-page-container">
      <p className="u-xl">Market</p>
      <br />
      {formOpen ? <PopupForm closeForm={closeForm} market={market} className="form" /> : null}
      {helpOpen ? <Help closeHelp={closeHelp} /> : null}
      <div className="market-box">
        <div className="u-flex-center">
          <button className="img-button left-help" onClick={openHelp}>
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
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
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
