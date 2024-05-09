import React, { useState, useEffect, useCallback } from "react";
import { get, post, convertToDisplay, getDateTime, datesEqual } from "../utilities.js";
import Waiting from "./waiting.js";
import ClientSocket from "../client-socket.js";

//given a filter, creates display_order function with this filter
//filter obj has keys market, dhall, type, meal, and date
const create_display_order = (filter) => {
  const datesEqual = (date1, date2) => getDateTime(date1).date === getDateTime(date2).date;
  const isToday = (date) => {
    const today = new Date();
    return datesEqual(date, today);
  };
  const display_order = (order) => {
    if (order.market !== filter.market && filter.market !== "any") return null;
    if (filter.mine === "true" && order.mine === "false") return null;
    if (order.type !== filter.type && filter.type !== "any") return null;
    if (order.dhall !== filter.dhall && filter.dhall !== "any") return null;
    if (filter.market !== "live") {
      if (order.meal !== filter.meal && filter.meal !== "any") return null;
      if (!datesEqual(filter.date, order.date) && filter.date !== "any") return null;
    }

    return (
      <div key={order._id} className="order">
        <div className="linebreak-1"></div>
        <p>
          <b>{order.type === "buy" ? "Swipe Request" : "Swipe Donation"}</b>
        </p>
        <div className="linebreak-0pt5"></div>
        <p>At: {convertToDisplay(order.dhall)}</p>
        <div className="linebreak-0pt5"></div>
        <p>For: {order.market === "live" ? "Right Now" : "Later"}</p>
        <div className="linebreak-0pt5"></div>
        {order.market === "reserve" ? (
          <div className="u-width-fill u-flex-col">
            <p>
              <span className="mobile-hide">Date:&nbsp;</span>
              {isToday(order.date) ? "Today" : getDateTime(order.date).date}
            </p>
            {/* <div className="linebreak-0pt5"></div> */}
            <p>
              <span className="mobile-hide">Time:&nbsp;</span>
              {getDateTime(order.date).time}
            </p>
            {/* <div className="linebreak-0pt5"></div> */}
            <p>
              <span className="mobile-hide">Meal:&nbsp;</span>
              {convertToDisplay(order.meal)}
            </p>
            <div className="linebreak-0pt5"></div>
          </div>
        ) : null}
        <p>ID: {order._id.slice(-3)}</p>
        <div className="linebreak-1"></div>
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

const OrderBox = ({ market, dhall, type, meal, mine, date }) => {
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
  return (
    <div className="order-box">
      {orders.map(
        create_display_order({
          market: market,
          dhall: dhall,
          type: type,
          meal: meal,
          mine: mine,
          date: date,
        })
      )}
    </div>
  );
};

export default OrderBox;
