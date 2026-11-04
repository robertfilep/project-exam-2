// src/pages/Contact.js
import React, { useState } from "react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple validation: make sure all fields are filled
    if (!name || !email || !message) {
      setError("Please fill in all fields.");
      setSuccess("");
      return;
    }
    // Simulate a successful form submission (replace this with an API call if needed)
    setSuccess("This is a portfolio demo. Your message has not been sent.");
    setError("");
    // Clear form fields after submission
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="container my-5 narrow-form">
      <h1 className="display-4 text-center mb-4">Contact Us</h1>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <p className="text-muted">
        Demo contact form — messages are not delivered.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="contactName" className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="contactName"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="contactEmail" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="contactEmail"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="contactMessage" className="form-label">
            Message
          </label>
          <textarea
            className="form-control"
            id="contactMessage"
            rows="5"
            placeholder="Your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">
          Preview Message
        </button>
      </form>
    </div>
  );
};

export default Contact;
