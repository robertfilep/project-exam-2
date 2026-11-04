import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllPages, request } from "../api";

export default function MyBookings() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    if (!token || !username) {
      setError("You must be logged in to view your bookings.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetchAllPages(
      `/holidaze/profiles/${encodeURIComponent(username)}/bookings?_venue=true&sort=dateFrom&sortOrder=asc`,
      { token },
    )
      .then((items) => {
        if (active) setBookings(items);
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
  }, [token, username, retry]);
  const cancel = async (id) => {
    if (
      pending ||
      !window.confirm("Cancel this booking? This cannot be undone.")
    )
      return;
    setPending(id);
    setError("");
    try {
      await request(`/holidaze/bookings/${id}`, { method: "DELETE", token });
      setBookings((previous) => previous.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(null);
    }
  };
  return (
    <section className="my-5" aria-labelledby="bookings-heading">
      <h2 id="bookings-heading">My Bookings</h2>
      {loading && <p role="status">Loading your bookings...</p>}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}{" "}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => setRetry((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      )}
      {!loading && !bookings.length && !error && (
        <p>
          You have no bookings. <Link to="/">Find your next stay</Link>
        </p>
      )}
      <div className="row g-3">
        {bookings.map((item) => (
          <div key={item.id} className="col-md-6">
            <article className="card h-100">
              <div className="card-body">
                <h3 className="h5">
                  {item.venue ? (
                    <Link to={`/venues/${item.venue.id}`}>
                      {item.venue.name}
                    </Link>
                  ) : (
                    "Your reserved stay"
                  )}
                </h3>
                <p className="small text-muted">Booking ID: {item.id}</p>
                <p>
                  <strong>Check-in:</strong> {item.dateFrom.slice(0, 10)}
                  <br />
                  <strong>Check-out:</strong> {item.dateTo.slice(0, 10)}
                  <br />
                  <strong>Guests:</strong> {item.guests}
                </p>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  disabled={Boolean(pending)}
                  onClick={() => cancel(item.id)}
                >
                  {pending === item.id ? "Cancelling…" : "Cancel Booking"}
                </button>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
