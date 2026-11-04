import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { notifySessionChange } from "../session";
import { request } from "../api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (submitting) return;
    setSubmitting(true);
    try {
      const data = await request("/auth/login?_holidaze=true", {
        method: "POST",
        body: JSON.stringify({ ...form, email: form.email.trim() }),
      });
      // Store token and username
      localStorage.setItem("token", data.data.accessToken);
      localStorage.setItem("username", data.data.name);

      // If an avatar exists in the response, store its URL
      if (data.data.avatar && data.data.avatar.url) {
        localStorage.setItem("avatarUrl", data.data.avatar.url);
      } else {
        localStorage.removeItem("avatarUrl");
      }

      // Navigate to the home page
      notifySessionChange();
      const destination = location.state?.from;
      navigate(
        typeof destination === "string" &&
          destination.startsWith("/") &&
          !destination.startsWith("//")
          ? destination
          : "/",
        { replace: true },
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-5 narrow-form">
      <h1 className="display-4 text-center mb-4">Login</h1>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            autoComplete="current-password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
            required
            minLength="8"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Logging in…" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
