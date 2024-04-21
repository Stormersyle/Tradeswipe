import React from "react";

const About = () => {
  return (
    <div className="page-container">
      <p className="u-xl">About</p>
      <br />
      <p className="u-mm">
        Welcome to Tradeswipe! Tradeswipe is a platform for MIT students to buy and sell dining hall
        meal swipes in real-time. If you always have extra meal swipes left over that you hate to
        see go to waste, or if you're in a cook-for-yourself dorm and would like to eat at the
        dining hall for less than MIT's exorbitant prices, then this is just the website for you!
      </p>
      <div className="linebreak-2"></div>
      <p className="u-mm">
        The primary goal of Tradeswipe is to be as simple, convenient, and easy to use as possible.
        You make an account, set your buyer/seller permissions (currently, the authorization is just
        comparing the phone number and venmo to a regex; when this site is actually released, there
        will be more extensive authorizaiton processes), and you're all set to start.
      </p>
      <div className="linebreak-2"></div>
      <p className="u-mm">
        Then, you check into a dining hall, select whether you're buying or selling, and place
        either a market or limit order. A limit order is where you get to choose your own price,
        whereas a market order is based on a calculated market price for the dining hall you're at
        (which in a real scenario, would vary based on supply/demand), and a limit order is where
        you set an upper/lower bound for your buy/sell price. Note that if you make a market order,
        there can be slight slippages (like in the real stock market), but it should be
        approximately the market price you ordered at.
      </p>
      <div className="linebreak-2"></div>
      <p className="u-mm">
        Then, you get matched with someone, and the buyer will receive directions on how to find the
        seller. The seller swipes the buyer in, the buyer pays (in either cash or Venmo), and the
        transaction is logged once both people confirm it. You can also cancel your order during the
        matching process, or cancel your match once matched. For increased efficiency, you can also
        place several sell orders at once; each one will be executed after you finish the previous
        transaction.
      </p>
      <div className="linebreak-2"></div>
      <p className="u-mm">
        Finally, you can also view the current market at each dining hall on the View Markets page,
        and can also view your past transaction history.
      </p>
    </div>
  );
};

export default About;
