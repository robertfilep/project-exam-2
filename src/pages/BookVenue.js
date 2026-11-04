import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { request } from "../api";
import { localDateValue, nightsBetween, validateBooking } from "../booking";
import VenueImage from "../components/VenueImage";

export default function BookVenue() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({ dateFrom: "", dateTo: "", guests: 1 });
  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    setLoadError("");
    setVenue(null);
    setBooking(null);
    request(`/holidaze/venues/${id}?_bookings=true`)
      .then((body) => {
        if (active) {
          if (!body?.data) throw new Error("This venue could not be found.");
          setVenue(body.data);
        }
      })
      .catch((err) => {
        if (active) setLoadError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, token]);

  if (!token)
    return (
      <Navigate to="/login" replace state={{ from: `/book-venue/${id}` }} />
    );
  if (loading)
    return (
      <p role="status" className="container py-5">
        Loading venue details...
      </p>
    );
  if (loadError)
    return (
      <div className="container py-5">
        <p role="alert" className="alert alert-danger">
          {loadError}
        </p>
        <Link to={`/venues/${id}`}>Back to venue</Link>
      </div>
    );
  if (!venue) return null;
  if (booking)
    return (
      <section className="container py-5 narrow-form">
        <div role="status" className="alert alert-success">
          <h1 className="h3">Your stay is booked</h1>
          <p>
            {venue.name} · {form.dateFrom} to {form.dateTo} · {form.guests}{" "}
            guests
          </p>
          <p className="mb-0">
            You can view or cancel this booking in your profile.
          </p>
        </div>
        <Link className="btn btn-primary" to="/profile">
          View my bookings
        </Link>
      </section>
    );

  const change = (event) => {
    setError("");
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };
  const nights = nightsBetween(form.dateFrom, form.dateTo);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const validation = validateBooking(form, venue);
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      // Refresh availability immediately before booking; the API remains authoritative.
      const latest = await request(`/holidaze/venues/${id}?_bookings=true`);
      const availabilityError = validateBooking(form, latest.data);
      setVenue(latest.data);
      if (availabilityError) throw new Error(availabilityError);
      const body = await request("/holidaze/bookings", {
        method: "POST",
        token,
        body: JSON.stringify({
          venueId: id,
          dateFrom: `${form.dateFrom}T00:00:00.000Z`,
          dateTo: `${form.dateTo}T00:00:00.000Z`,
          guests: Number(form.guests),
        }),
      });
      setBooking(body.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section className="container py-5">
      <Link to={`/venues/${id}`} className="d-inline-block mb-4">
        ← Back to venue
      </Link>
      <div className="row g-5">
        <div className="col-lg-6">
          <p className="eyebrow">YOUR NEXT GETAWAY</p>
          <h1>Book your stay</h1>
          <form onSubmit={handleSubmit}>
            {error && (
              <div role="alert" className="alert alert-danger">
                {error}
              </div>
            )}
            <fieldset disabled={submitting}>
              <div className="row">
                <div className="col-sm-6 mb-3">
                  <label htmlFor="dateFrom" className="form-label">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    id="dateFrom"
                    name="dateFrom"
                    className="form-control"
                    min={localDateValue()}
                    value={form.dateFrom}
                    onChange={change}
                    required
                  />
                </div>
                <div className="col-sm-6 mb-3">
                  <label htmlFor="dateTo" className="form-label">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    id="dateTo"
                    name="dateTo"
                    className="form-control"
                    min={form.dateFrom || localDateValue()}
                    value={form.dateTo}
                    onChange={change}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="guests" className="form-label">
                  Number of Guests
                </label>
                <input
                  type="number"
                  id="guests"
                  name="guests"
                  className="form-control"
                  min="1"
                  max={venue.maxGuests}
                  step="1"
                  value={form.guests}
                  onChange={change}
                  required
                />
                <p className="form-text">
                  This stay welcomes up to {venue.maxGuests} guests.
                </p>
              </div>
              <button type="submit" className="btn btn-primary">
                {submitting ? "Booking your stay…" : "Confirm booking"}
              </button>
            </fieldset>
          </form>
        </div>
        <aside className="col-lg-6">
          <div className="card booking-summary">
            <VenueImage
              src={venue.media?.[0]?.url}
              alt={venue.name}
              className="card-img-top"
            />
            <div className="card-body">
              <h2 className="h4">{venue.name}</h2>
              <p className="text-muted">
                {[venue.location?.city, venue.location?.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>${venue.price} per night</p>
              {Number.isFinite(nights) && nights > 0 && (
                <p className="h5">
                  {nights} nights · Total ${(nights * venue.price).toFixed(2)}
                </p>
              )}
              {(venue.bookings || []).length > 0 && (
                <details className="mt-3">
                  <summary>View booked dates</summary>
                  <ul className="small mt-2">
                    {venue.bookings.map((item) => (
                      <li key={item.id}>
                        {item.dateFrom.slice(0, 10)} →{" "}
                        {item.dateTo.slice(0, 10)}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
