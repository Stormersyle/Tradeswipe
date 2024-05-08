import React from "react";

const Help = ({ closeHelp, page }) => {
  if (page === "market")
    return (
      <dialog open className="popup help">
        <p className="u-l">Market Help</p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          In the Market tab, you can view the "market" for meal swipes, where you can claim someone
          else's orders or place your own. Each order is a swipe request or swipe donation, and is
          either for now (i.e. in real time) or for later (i.e. at a scheduled future time). .
        </p>
        <div className="linebreak-2"></div>
        <p>
          Note that if you claim someone's swipe request, you're offering to <b>donate</b> a swipe
          to them; if you claim someone's donation offer, you're <b>receiving</b> a swipe from them{" "}
        </p>
        <div className="linebreak-2"></div>
        <p>
          Once you claim someone's order or someone claims your order, a match is made and the order
          is taken off the market. You can view your matches on the Match page. If you have a change
          of plans, you can also cancel the orders you've placed.
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
          you have claimed). You should meet up with your match at the selected dining hall when
          it's time to make the trade (either now if the order is "For now", or at the scheduled
          date/time if the order if "For later").
        </p>
        <div className="linebreak-2"></div>
        <p className="u-m">
          Once it's time for both people to meet up,{" "}
          <b className="u-m">
            it is up to the swipe recipient to find the swipe donor. The donor will be shown the
            recipient's directions, so it's very important for the donor to set updated directions
            on their profile
          </b>
          . After both people meet, the donor taps in the recipient, and the recipient is free to
          "tip" or compensate the donor in some way (though this is by no means an obligation; just
          something nice to do).
        </p>
        <div className="linebreak-2"></div>
        <p className="u-m">
          Finally, click "finish" on your match after donation is finished; alternatively, if you
          have a change of plans, you can cancel on your match before you make the donation (though
          this is generally discouraged).{" "}
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
