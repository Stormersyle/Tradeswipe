import React from "react";

const Info = ({ loggedIn }) => {
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
          eat at a dining hall for free, then this is just the website for you!
        </p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          Tradeswipe was made with the goal of reducing the massive number of wasted meal swipes and
          helping fix food insecurity at MIT. It was named Tradeswipe because it was originally
          designed to be a platform for buying and selling swipes; however, due to unexpectedly high
          controversy regarding the idea of selling swipes, the app will be donation-only for at
          least the near future.
        </p>
        <br />
      </div>
      <div id="market-match-section">
        <p className="u-l u-width-fill">How It Works</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          Tradeswipe has a swipe "market", in which you can view people's swipe requests and swipe
          offers. Swipe requests/offers can be either live (i.e. for right now) or asynchronous
          (i.e. for later, at a scheduled date/time). You can claim other people's orders and also
          place your own.
        </p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          Once someone claims another person's order, a match is made and the order is taken off the
          market. You meet up with your match at the selected dining hall at the appropriate time
          (either now if it's "for now", or at the scheduled date/time if it's "for later"); then,
          the donor taps in the recipient.
        </p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          When meeting up,{" "}
          <b>
            the donor sets their directions on their profile, and it's up to the recipient to find
            the donor.
          </b>{" "}
          This setup makes it easy for donors to donate a large number of swipes at once.
        </p>
        <div className="linebreak-2"></div>
        <p className="u-mm">
          You can find additional information about how to use the website by clicking the Help
          button on the Market page (after signing in).
        </p>
        <br />
      </div>
      <div id="question-section">
        <p className="u-l u-width-fill">Questions & Feedback</p>
        <div className="linebreak-1"></div>
        <p className="u-mm">
          If you have any questions or feedback about Tradeswipe, or if you find a bug, please email
          me directly at <a href="mailto:azyuan@mit.edu">azyuan@mit.edu</a>. I read and respond to
          all emails.
        </p>
      </div>
      <br />
      <br />
    </div>
  );
};

export default Info;
