import React from "react";
import "./BackButton.css";

const BackButton = ({ onClick, className = "" }) => {
  return (
    <div className={`back-button-container ${className}`}>
      <button className="back-button" onClick={onClick}>
        Back
      </button>
    </div>
  );
};

export default BackButton;
