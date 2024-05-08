import React from "react";

const Help = ({ closeHelp, page }) => {
  if (page === "market")
    return (
      <dialog open className="popup help">
        <p className="u-l">Market Help</p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          Tradeswipe supports a market for live orders (i.e. buying/selling swipes in real-time) and
          a market for reservation orders (i.e. buying/selling swipes for a scheduled future
          date/time).
        </p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          On this page you can view these markets; in each market, you can claim other people's
          orders and also place your own. Note that if you claim someone's $X buy order, you're{" "}
          <b>selling</b> a swipe for $X; if you claim someone's $X sell order, you're <b>buying</b>{" "}
          a swipe for $X.
        </p>
        <div className="linebreak-2"></div>
        <p>
          Once you claim someone's order or someone claims your order, a match is made and the order
          is taken off the market. You can view your matches on the Match page. If you have a change
          of plans, you can also cancel the orders you've placed.
        </p>
        <div className="linebreak-2"></div>
        <p className="u-width-fill">
          <b>Note: if you'd like to donate swipes, simply place a sell order for $0.</b>
        </p>
        <br />

        <button onClick={closeHelp} className="default-button">
          Close
        </button>
      </dialog>
    );
  else {
    return (
      <dialog open className="popup help">
        <p className="u-l">Match Help</p>
        <div className="linebreak-2"></div>
        <p className="u-m">
          This page displays your matches (i.e. people who have claimed your order or whose order
          you have claimed) in both the live and reservation market. You should meet up with your
          match at the selected dining hall when it's time to make the trade (either now for live
          matches, or at the scheduled date/time for reservation matches).
        </p>
        <div className="linebreak-2"></div>
        <p className="u-m">
          Once it's time for the buyer and seller to meet up,{" "}
          <b className="u-m">
            it is up to the buyer to find the seller. The buyer will be shown the seller's
            directions, so it's very important for the seller to set updated directions on their
            profile
          </b>
          . After both people meet, the seller taps in the buyer, and the buyer pays with either
          Venmo or cash. Note that per MIT dining regulations, the seller must also go eat after
          swiping in a group of buyers
        </p>
        <div className="linebreak-2"></div>
        <p className="u-m">
          Finally, click "finish" on your match after the transaction is done; alternatively, if you
          have a change of plans, you can cancel on your match before you make the transaction
          (though this is generally discouraged).{" "}
          <b className="u-m">
            If the person who claims your order cancels, your order will go back on the market
          </b>{" "}
          (with the exception of reservation orders whose scheduled time has already passed).
        </p>
        <br />
        <button onClick={closeHelp} className="default-button">
          Close
        </button>
      </dialog>
    );
  }
};

export default Help;
