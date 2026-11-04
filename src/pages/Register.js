import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../api";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    avatarUrl: "",
    avatarAlt: "",
    bannerUrl: "",
    bannerAlt: "",
    venueManager: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (submitting) return;
    if (!/^[a-zA-Z0-9_]+$/.test(form.name.trim())) {
      setError("Use only letters, numbers, and underscores in your name.");
      return;
    }
    if (!/^[^@\s]+@stud\.noroff\.no$/i.test(form.email.trim())) {
      setError("Use your stud.noroff.no email address.");
      return;
    }
    setSubmitting(true);

    // Build the payload. Only include optional fields if they have a value.
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      bio: form.bio.trim() || undefined,
      avatar: form.avatarUrl.trim()
        ? { url: form.avatarUrl.trim(), alt: form.avatarAlt.trim() || "" }
        : undefined,
      banner: form.bannerUrl.trim()
        ? { url: form.bannerUrl.trim(), alt: form.bannerAlt.trim() || "" }
        : undefined,
      venueManager: form.venueManager,
    };

    try {
      await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSuccess("Registration successful. Redirecting to login...");

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-5 narrow-form">
      <h1 className="display-4 text-center mb-4">Register</h1>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="alert alert-success">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="form-control"
            value={form.name}
            onChange={handleChange}
            required
          />
          <small className="form-text text-muted">
            Use only letters, numbers, and underscores.
          </small>
        </div>
        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
          />
          <small className="form-text text-muted">
            Must be a valid stud.noroff.no email address.
          </small>
        </div>
        {/* Password */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
            required
            minLength="8"
          />
          <small className="form-text text-muted">
            Password must be at least 8 characters long.
          </small>
        </div>
        {/* Bio */}
        <div className="mb-3">
          <label htmlFor="bio" className="form-label">
            Bio
          </label>
          <textarea
            name="bio"
            id="bio"
            className="form-control"
            rows="3"
            value={form.bio}
            onChange={handleChange}
            maxLength="160"
          ></textarea>
          <small className="form-text text-muted">
            Optional: A brief description about yourself (max 160 characters).
          </small>
        </div>
        {/* Avatar URL */}
        <div className="mb-3">
          <label htmlFor="avatarUrl" className="form-label">
            Avatar URL
          </label>
          <input
            type="url"
            name="avatarUrl"
            id="avatarUrl"
            className="form-control"
            value={form.avatarUrl}
            onChange={handleChange}
          />
        </div>
        {/* Avatar Alt Text */}
        <div className="mb-3">
          <label htmlFor="avatarAlt" className="form-label">
            Avatar Alt Text
          </label>
          <input
            type="text"
            name="avatarAlt"
            id="avatarAlt"
            className="form-control"
            value={form.avatarAlt}
            onChange={handleChange}
            maxLength="120"
          />
          <small className="form-text text-muted">
            Optional: Alt text for your avatar.
          </small>
        </div>
        {/* Banner URL */}
        <div className="mb-3">
          <label htmlFor="bannerUrl" className="form-label">
            Banner URL
          </label>
          <input
            type="url"
            name="bannerUrl"
            id="bannerUrl"
            className="form-control"
            value={form.bannerUrl}
            onChange={handleChange}
          />
        </div>
        {/* Banner Alt Text */}
        <div className="mb-3">
          <label htmlFor="bannerAlt" className="form-label">
            Banner Alt Text
          </label>
          <input
            type="text"
            name="bannerAlt"
            id="bannerAlt"
            className="form-control"
            value={form.bannerAlt}
            onChange={handleChange}
            maxLength="120"
          />
          <small className="form-text text-muted">
            Optional: Alt text for your banner.
          </small>
        </div>
        {/* Venue Manager Checkbox */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            name="venueManager"
            id="venueManager"
            className="form-check-input"
            checked={form.venueManager}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="venueManager">
            Register as Venue Manager
          </label>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || Boolean(success)}
        >
          {submitting ? "Creating account…" : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
