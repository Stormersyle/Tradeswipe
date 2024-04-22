import React from "react";

const Info = ({ loggedIn }) => {
  if (!loggedIn) {
    return (
      <div className="page-container">
        <p className="u-xl">About Tradeswipe</p>
        <br />
        <div id="about-section">
          <p className="u-mm">
            Welcome to Tradeswipe! Tradeswipe is a platform for MIT students to buy and sell dining
            hall meal swipes, both in real-time and asynchronously. If you always have extra meal
            swipes and hate to see them go to waste, or if you're in a cook-for-yourself dorm and
            would like to eat at a dining hall for cheap, then this is just the website for you!
          </p>
          <div className="linebreak-2"></div>
          <p className="u-mm">
            Tradeswipe is designed to be as convenient and simple to use as possible. The tl;dr of
            how it works is: you can buy/sell swipes on the online market (either for right now, or
            for a future scheduled date/time), and then meet up at the dining hall with the person
            you brought/sold from; then, the seller taps the buyer in and the buyer pays. For more
            detailed information and instructions, please sign in with Google.
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
          Welcome to Tradeswipe! Tradeswipe is a platform for MIT students to buy and sell dining
          hall meal swipes, both in real-time and asynchronously. If you always have extra meal
          swipes and hate to see them go to waste, or if you're in a cook-for-yourself dorm and
          would like to eat at a dining hall for cheap, then this is just the website for you!
        </p>
        <br />
      </div>
      <div id="setup-section">
        <p className="u-l u-width-fill">Setup Instructions</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          To use Tradeswipe, first you need to setup your account. This is very simple: go to your
          profile, and then check "buyer enabled" and/or "seller enabled" (depending on if you want
          to buy swipes, sell swipes, or both). You must enter your phone number. If you want to
          sell swipes, you must also enter your Venmo username.
        </p>
        <br />
      </div>
      <div id="market-match-section">
        <p className="u-l u-width-fill">Market & Matches</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          Tradeswipe supports a market for live orders (i.e. buying/selling swipes in real time) and
          a market for reservation orders (i.e. buying/selling swipes for a specified future
          date/time). On the Market page, you can view these markets, and you can claim other
          people's orders or place your own. Note that if you claim someone's $X buy order, you're{" "}
          <b>selling</b> a swipe for $X; if you claim someone's $X sell order, you're <b>buying</b>{" "}
          a swipe for $X.
        </p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          Once someone claims another person's order, a match is made and the order is taken off the
          market. You can view your matches and pending orders on the "Match" page, and you will
          also be notified of new matches. You will be notified both on the website and via email;{" "}
          <b>
            make sure to unblock{" "}
            <a href="mailto:tradeswipe-mit@gmail.com">tradeswipe-mit@gmail.com</a>
          </b>{" "}
          from your spam!
        </p>
        <br />
      </div>
      <div id="transaction-section">
        <p className="u-l u-width-fill">Making the transaction</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          Once it's time for the buyer and seller to meet up (either immediately if it's a live
          order, or at the arranged date/time if it's a reservation order),{" "}
          <b>it is up to the buyer to find the seller</b>. The seller will need to include how to
          find them on their profile; the buyer does not. After both people meet, the seller taps in
          the buyer, and the buyer pays with either Venmo or cash.
        </p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          Finally: click "finish" on your match after the transaction is done; alternatively, you
          can cancel on your match before you make the transaction (though this is generally
          discouraged). If the person who claims your order cancels, your order will go back on the
          market.
        </p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          For sellers in particular:{" "}
          <b>
            Because it is up to the buyer to find you, it's extremely important to set updated
            directions on your profile whenever you're about to meet up with a buyer.
          </b>{" "}
          Also, note that per MIT dining regulations, you need to also go eat after swiping other
          people in.
        </p>
        <br />
      </div>
      <div id="question-section">
        <p className="u-l u-width-fill">Questions & Feedback</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          If you have any questions or feedback about Tradeswipe, please email{" "}
          <a href="mailto:tradeswipe-mit@gmail.com">tradeswipe-mit@gmail.com</a>. I will read and
          respond to every email.
        </p>
      </div>
    </div>
  );
};

export default Info;
