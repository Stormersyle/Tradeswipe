import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const BackDoor = ({ loggedIn, handleGoogleLogin }) => {
  if (loggedIn) return <div className="page-container">Already logged in!</div>;
  return (
    <div className="page-container">
      <p>
        Only explicitly approved gmails that I've added can sign in via Google; everyone else must
        sign in via Touchstone. For now, this page is only for me to test with multiple accounts.
      </p>
      <br />
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={(err) => console.log(err)}
        id="GoogleLogin"
      />
    </div>
  );
};

export default BackDoor;
