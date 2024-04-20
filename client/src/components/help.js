import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const Help = () => {
  const { pageName } = useParams();
  const navigate = useNavigate();

  <div className="page-container">
    <p>Help for {pageName}</p>
    <button onClick={() => navigate(`/${pageName}`)} />
  </div>;
};

export default Help;
