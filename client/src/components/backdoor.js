import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const BackDoor = ({ loggedIn, handleGoogleLogin }) => {
  if (loggedIn) return <div className="page-container">Already logged in!</div>;
  return (
    <div className="page-container">
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={(err) => console.log(err)}
        id="GoogleLogin"
      />
    </div>
  );
};

export default BackDoor;
