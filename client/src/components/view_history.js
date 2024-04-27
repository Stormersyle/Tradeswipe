import React from "react";

const History = ({ loggedIn }) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [market, setMarket] = useState(""); //market = "live" or "reserve"
  const [dhall, setDhall] = useState("any");
  const [meal, setMeal] = useState("any");

  const openHelp = () => setHelpOpen(true);
  const closeHelp = () => setHelpOpen(false);
  const setLive = () => setMarket("live");
  const setReserve = () => setMarket("reserve");

  if (!loggedIn) return <NotLoggedIn />;

  return (
    <div className="page-container styled-page-container">
      <p className="u-xl">Matches</p>
      <br />
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
          <button className="img-button right-plus u-hide-but-keep-shape">
            <img src="/assets/plus.png" className="market-icon" />
          </button>
        </div>
        <br />
        {market === "reserve" ? (
          <div className="u-flex u-justify-center u-align-center market-dropdown u-wrap">
            <div className="dropdown-menu u-flex u-width-fit">
              <label htmlFor="select-dhall-match" className="u-mm">
                Dining Hall:&nbsp;
              </label>
              <select
                id="select-dhall-match"
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
              <label htmlFor="select-meal-match" className="u-mm">
                Meal:&nbsp;
              </label>
              <select
                id="select-meal-match"
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
          </div>
        ) : null}
        {market === "reserve" ? <br /> : null}
        <MatchBox market={market} dhall={dhall} meal={meal} />
      </div>
    </div>
  );
};

export default History;
