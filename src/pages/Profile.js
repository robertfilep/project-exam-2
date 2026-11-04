import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../api";
import { notifySessionChange } from "../session";
import MyVenues from "../components/MyVenues";
import MyBookings from "../components/MyBookings";
import VenueImage from "../components/VenueImage";

const normalizeProfile = (profile) => ({
  ...profile,
  bio: profile.bio || "",
  avatar: { url: "", alt: "", ...profile.avatar },
  banner: { url: "", alt: "", ...profile.banner },
});

export default function Profile() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    if (!token || !username) {
      navigate("/login", { replace: true, state: { from: "/profile" } });
      return;
    }
    setLoading(true);
    setError("");
    request(`/holidaze/profiles/${encodeURIComponent(username)}`, { token })
      .then((body) => {
        if (active) setProfile(normalizeProfile(body.data));
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, username, navigate, retry]);
  const change = (event) => {
    const { name, value, type, checked } = event.target;
    const [field, property] = name.split(".");
    setDraft((previous) =>
      property
        ? { ...previous, [field]: { ...previous[field], [property]: value } }
        : { ...previous, [field]: type === "checkbox" ? checked : value },
    );
  };
  const save = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const body = await request(
        `/holidaze/profiles/${encodeURIComponent(username)}`,
        {
          method: "PUT",
          token,
          body: JSON.stringify({
            bio: draft.bio,
            avatar: draft.avatar,
            banner: draft.banner,
            venueManager: draft.venueManager,
          }),
        },
      );
      const updated = normalizeProfile(body.data);
      setProfile(updated);
      setDraft(null);
      setSuccess("Profile updated successfully.");
      if (updated.avatar.url)
        localStorage.setItem("avatarUrl", updated.avatar.url);
      else localStorage.removeItem("avatarUrl");
      notifySessionChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <p role="status" className="container py-5">
        Loading profile...
      </p>
    );
  return (
    <section className="container py-5">
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
          {!profile && (
            <button
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={() => setRetry((n) => n + 1)}
            >
              Try again
            </button>
          )}
        </div>
      )}
      {success && (
        <div role="status" className="alert alert-success">
          {success}
        </div>
      )}
      {profile && (
        <>
          {profile.banner.url && (
            <VenueImage
              src={profile.banner.url}
              alt={profile.banner.alt || "Profile banner"}
              className="profile-banner"
            />
          )}
          <div className="card p-4">
            <div className="d-flex justify-content-between align-items-center gap-3">
              <h1 className="h3">My Profile</h1>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setDraft(normalizeProfile(profile));
                  setError("");
                  setSuccess("");
                }}
              >
                Edit Profile
              </button>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-4 mt-3">
              {profile.avatar.url && (
                <VenueImage
                  src={profile.avatar.url}
                  alt={profile.avatar.alt || profile.name}
                  className="profile-avatar"
                />
              )}
              <div>
                <h2 className="h4">{profile.name}</h2>
                <p>{profile.email}</p>
                <p>
                  {profile.bio || "Tell your hosts a little about yourself."}
                </p>
                <p className="small text-muted">
                  {profile.venueManager ? "Venue manager" : "Guest"}
                </p>
              </div>
            </div>
          </div>
          {draft && (
            <form onSubmit={save} className="card p-4 mt-4">
              <h2 className="h4">Edit Profile</h2>
              <fieldset disabled={saving}>
                <label htmlFor="bio" className="form-label">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  className="form-control mb-3"
                  value={draft.bio}
                  onChange={change}
                  maxLength="160"
                />
                {["avatar", "banner"].map((field) => (
                  <div key={field} className="row">
                    <div className="col-md-8 mb-3">
                      <label htmlFor={`${field}Url`} className="form-label">
                        {field === "avatar" ? "Avatar URL" : "Banner URL"}
                      </label>
                      <input
                        id={`${field}Url`}
                        name={`${field}.url`}
                        type="url"
                        className="form-control"
                        value={draft[field].url}
                        onChange={change}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor={`${field}Alt`} className="form-label">
                        {field === "avatar"
                          ? "Avatar Alt Text"
                          : "Banner Alt Text"}
                      </label>
                      <input
                        id={`${field}Alt`}
                        name={`${field}.alt`}
                        className="form-control"
                        value={draft[field].alt}
                        onChange={change}
                        maxLength="120"
                      />
                    </div>
                  </div>
                ))}
                <div className="form-check mb-4">
                  <input
                    id="venueManager"
                    name="venueManager"
                    type="checkbox"
                    className="form-check-input"
                    checked={Boolean(draft.venueManager)}
                    onChange={change}
                  />
                  <label htmlFor="venueManager" className="form-check-label">
                    Venue Manager
                  </label>
                </div>
                <button className="btn btn-primary me-2" type="submit">
                  {saving ? "Saving…" : "Update Profile"}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    setDraft(null);
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </fieldset>
            </form>
          )}
          {profile.venueManager && (
            <>
              <Link to="/add-venue" className="btn btn-primary mt-4">
                Add Venue
              </Link>
              <MyVenues username={username} token={token} />
            </>
          )}
          <MyBookings />
        </>
      )}
    </section>
  );
}
