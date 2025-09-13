import React, { useState } from "react";
import "./EmailInput.css";

const EmailInput = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    onSubmit(email.trim());
  };

  return (
    <div className="email-input-wrapper">
      <form onSubmit={handleSubmit} className="email-form">
        <h2 className="email-title">Enter Your Email <br />and check your reports</h2>
        <input
          type="email"
          placeholder="your.email@example.com"
          className="email-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default EmailInput;
