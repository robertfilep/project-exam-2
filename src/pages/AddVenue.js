import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { request } from "../api";

const AddVenue = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    maxGuests: "",
    mediaUrl: "",
    // Meta fields
    wifi: false,
    parking: false,
    breakfast: false,
    pets: false,
    // Location fields (optional)
    address: "",
    city: "",
    zip: "",
    country: "",
    continent: "",
    lat: "",
    lng: "",
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
    if (!form.name.trim() || !form.description.trim()) {
      setError("Enter a name and description.");
      return;
    }
    if (
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0 ||
      !Number.isInteger(Number(form.maxGuests)) ||
      Number(form.maxGuests) < 1 ||
      Number(form.maxGuests) > 100
    ) {
      setError("Enter a valid price and between 1 and 100 guests.");
      return;
    }
    setSubmitting(true);

    // Build the location object, converting empty continent to null
    const location = {
      address: form.address.trim() || "",
      city: form.city.trim() || "",
      zip: form.zip.trim() || "",
      country: form.country.trim() || "",
      continent: form.continent.trim() === "" ? null : form.continent.trim(),
      lat: form.lat.trim() ? parseFloat(form.lat) : 0,
      lng: form.lng.trim() ? parseFloat(form.lng) : 0,
    };

    // Construct payload with trimmed values
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      maxGuests: parseInt(form.maxGuests, 10),
      media: form.mediaUrl
        ? [{ url: form.mediaUrl.trim(), alt: `${form.name.trim()} image` }]
        : [],
      meta: {
        wifi: form.wifi,
        parking: form.parking,
        breakfast: form.breakfast,
        pets: form.pets,
      },
      location: location,
    };

    try {
      await request("/holidaze/venues", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      });
      setSuccess("Venue created successfully!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token)
    return <Navigate to="/login" replace state={{ from: "/add-venue" }} />;

  return (
    <div className="container my-5 narrow-form">
      <h1 className="display-4 text-center mb-4">Add Venue</h1>
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        {/* Venue Name */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Venue Name
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
        </div>
        {/* Description */}
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            className="form-control"
            rows="4"
            value={form.description}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        {/* Price per Night */}
        <div className="mb-3">
          <label htmlFor="price" className="form-label">
            Price per Night ($)
          </label>
          <input
            type="number"
            name="price"
            id="price"
            className="form-control"
            value={form.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </div>
        {/* Maximum Guests */}
        <div className="mb-3">
          <label htmlFor="maxGuests" className="form-label">
            Maximum Guests
          </label>
          <input
            type="number"
            name="maxGuests"
            id="maxGuests"
            max="100"
            step="1"
            className="form-control"
            value={form.maxGuests}
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        {/* Image URL */}
        <div className="mb-3">
          <label htmlFor="mediaUrl" className="form-label">
            Image URL
          </label>
          <input
            type="url"
            name="mediaUrl"
            id="mediaUrl"
            className="form-control"
            placeholder="https://example.com/image.jpg"
            value={form.mediaUrl}
            onChange={handleChange}
            required
          />
        </div>
        {/* Meta Data */}
        <h5 className="mt-4">Amenities</h5>
        <div className="form-check">
          <input
            type="checkbox"
            name="wifi"
            id="wifi"
            className="form-check-input"
            checked={form.wifi}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="wifi">
            WiFi
          </label>
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            name="parking"
            id="parking"
            className="form-check-input"
            checked={form.parking}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="parking">
            Parking
          </label>
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            name="breakfast"
            id="breakfast"
            className="form-check-input"
            checked={form.breakfast}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="breakfast">
            Breakfast
          </label>
        </div>
        <div className="form-check mb-4">
          <input
            type="checkbox"
            name="pets"
            id="pets"
            className="form-check-input"
            checked={form.pets}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="pets">
            Pets Allowed
          </label>
        </div>
        {/* Location Data */}
        <h5 className="mt-4">Location (Optional)</h5>
        <div className="mb-3">
          <label htmlFor="address" className="form-label">
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            className="form-control"
            value={form.address}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input
            type="text"
            name="city"
            id="city"
            className="form-control"
            value={form.city}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="zip" className="form-label">
            Zip
          </label>
          <input
            type="text"
            name="zip"
            id="zip"
            className="form-control"
            value={form.zip}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="country" className="form-label">
            Country
          </label>
          <input
            type="text"
            name="country"
            id="country"
            className="form-control"
            value={form.country}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="continent" className="form-label">
            Continent
          </label>
          <input
            type="text"
            name="continent"
            id="continent"
            className="form-control"
            value={form.continent}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="lat" className="form-label">
            Latitude
          </label>
          <input
            type="number"
            name="lat"
            id="lat"
            min="-90"
            max="90"
            step="any"
            className="form-control"
            value={form.lat}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="lng" className="form-label">
            Longitude
          </label>
          <input
            type="number"
            name="lng"
            id="lng"
            min="-180"
            max="180"
            step="any"
            className="form-control"
            value={form.lng}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : "Create Venue"}
        </button>
      </form>
    </div>
  );
};

export default AddVenue;
