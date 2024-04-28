import React from "react";

const Info = ({ loggedIn }) => {
  if (!loggedIn) {
    return (
      <div className="page-container">
        <p className="u-xl">About Tradeswipe</p>
        <br />
        <div id="about-section">
          <p className="u-l u-width-fill">About</p>
          <div className="linebreak-1"></div>
          <p className="u-mm">
            Welcome to Tradeswipe! Tradeswipe is a platform for MIT students to buy/sell and
            receive/donate meal swipes, both in real-time and asynchronously. If you always have
            extra meal swipes and hate to see them go to waste, or if you're in a CFY dorm and would
            like to eat at a dining hall for free/cheap, then this is just the website for you!
          </p>
          <div className="linebreak-2"></div>
          <p className="u-mm">
            Tradeswipe was made with the goal of reducing the massive number of wasted meal swipes
            and helping fix food insecurity at MIT. For a more detailed rundown of the rationale
            behind Tradeswipe, please{" "}
            <a href="/assets/rationale.pdf" target="_blank">
              view this document
            </a>
            .
          </p>
          <br />
        </div>
        <div id="market-match-section">
          <p className="u-l u-width-fill">How It Works</p>
          <div className="linebreak-1"></div>
          <p className="u-mm">
            Tradeswipe has both a live market (for buying/selling swipes in real-time) and a
            reservation market (for buying/selling swipes at a scheduled future time). You can claim
            other people's orders and also place your own.
          </p>
          <div className="linebreak-2"></div>
          <p className="u-mm">
            Once someone claims another person's order, a match is made and the order is taken off
            the market. You meet up with your match at the selected dining hall at the appropriate
            time (either now if it's a live match, or at the scheduled date/time if it's a
            reservation match); then, the seller taps in the buyer, and the buyer pays with either
            cash or Venmo.
          </p>
          <div className="linebreak-2"></div>
          <p className="u-mm">
            When meeting up,{" "}
            <b>
              the seller sets their directions on their profile, and it's up to the buyer to find
              the seller.
            </b>{" "}
            This setup makes it easy for sellers to sell a large number of swipes at once.
          </p>
          <div className="linebreak-2"></div>
          <p className="u-mm">
            Please sign in to begin using the website and for more detailed information.
          </p>
          <br />
        </div>
      </div>
    );
  }
  return (
    <div className="page-container">
      <p className="u-xl">Information & Instructions</p>
      <br />
      <div id="about-section">
        <p className="u-l u-width-fill">About</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          Welcome to Tradeswipe! Tradeswipe is a platform for MIT students to buy/sell and
          receive/donate meal swipes, both in real-time and asynchronously. If you always have extra
          meal swipes and hate to see them go to waste, or if you're in a CFY dorm and would like to
          eat at a dining hall for free/cheap, then this is just the website for you!
        </p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          Tradeswipe was made with the goal of reducing the massive number of wasted meal swipes and
          helping fix food insecurity at MIT. For a more detailed rundown of the rationale behind
          Tradeswipe, please{" "}
          <a href="/assets/rationale.pdf" target="_blank">
            view this document
          </a>
          .
        </p>
        <br />
      </div>
      <div id="setup-section">
        <p className="u-l u-width-fill">Setup Instructions</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          To use Tradeswipe, first you need to setup your account. This is very simple: go to your
          profile, and then check "buyer enabled" and/or "seller enabled" (depending on if you want
          to buy swipes, sell swipes, or both). You must enter your phone number, so that other
          people can reach you if they can't find you or you aren't showing up. If you want to sell
          swipes, you must also enter your Venmo username, so that buyers have the option to pay you
          with Venmo.
        </p>
        <br />
      </div>
      <div id="market-match-section">
        <p className="u-l u-width-fill">How It Works</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          Tradeswipe has both a live market (for buying/selling swipes in real-time) and a
          reservation market (for buying/selling swipes at a scheduled future time). You can claim
          other people's orders and also place your own.
        </p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          Once someone claims another person's order, a match is made and the order is taken off the
          market. You meet up with your match at the selected dining hall at the appropriate time
          (either now if it's a live match, or at the scheduled date/time if it's a reservation
          match); then, the seller taps in the buyer, and the buyer pays with either cash or Venmo.
        </p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          When meeting up,{" "}
          <b>
            the seller sets their directions on their profile, and it's up to the buyer to find the
            seller.
          </b>{" "}
          This setup makes it easy for sellers to sell a large number of swipes at once.
        </p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          For more detailed information, visit the Market and Match pages, and click on the Help
          button (with a ? icon).
        </p>
        <br />
      </div>
      <div id="question-section">
        <p className="u-l u-width-fill">Questions & Feedback</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          If you have any questions or feedback about Tradeswipe, please email{" "}
          <a href="mailto:tradeswipe-mit@gmail.com">tradeswipe-mit@gmail.com</a>. I read and respond
          to all emails.
        </p>
      </div>
      <br />
      <br />
    </div>
  );
};

export default Info;
