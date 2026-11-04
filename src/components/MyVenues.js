import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiKeyOptions } from "../apiConfig";
import { fetchAllPages } from "../api";

const MyVenues = ({ username, token }) => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username || !token) {
      setError("No username or token provided.");
      setLoading(false);
      return;
    }
    fetchAllPages(`/holidaze/profiles/${encodeURIComponent(username)}/venues`, {
      token,
    })
      .then((items) => {
        setVenues(items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [username, token]);

  const handleDelete = async (venueId) => {
    if (!window.confirm("Are you sure you want to delete this venue?")) {
      return;
    }
    try {
      const response = await fetch(
        `https://v2.api.noroff.dev/holidaze/venues/${venueId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...getApiKeyOptions(token).headers,
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to delete venue");
      }
      // Remove the deleted venue from state
      setVenues((prevVenues) =>
        prevVenues.filter((venue) => venue.id !== venueId),
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <p>Loading your venues...</p>;
  if (error)
    return <p className="text-danger">Error loading venues: {error}</p>;
  if (venues.length === 0) return <p>You don't have any venues yet.</p>;

  return (
    <div className="my-5">
      <h2 className="mb-4">My Venues</h2>
      <div className="row">
        {venues.map((venue) => (
          <div key={venue.id} className="col-md-4 mb-4">
            <div className="card h-100">
              {venue.media && venue.media.length > 0 && (
                <img
                  src={venue.media[0].url}
                  alt={venue.media[0].alt || venue.name}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{venue.name}</h5>
                <p className="card-text">
                  {(venue.description || "").substring(0, 100)}...
                </p>
              </div>
              <div className="card-footer d-flex justify-content-center">
                <div className="btn-group" role="group">
                  <Link
                    to={`/venues/${venue.id}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/edit-venue/${venue.id}`}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Edit Venue
                  </Link>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(venue.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyVenues;
