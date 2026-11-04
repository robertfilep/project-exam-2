// src/components/NewestVenuesCarousel.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiKeyOptions } from "../apiConfig";
import VenueImage from "./VenueImage";

const NewestVenuesCarousel = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(
      "https://v2.api.noroff.dev/holidaze/venues?sort=created&sortOrder=desc&limit=5",
      {
        headers: {
          "Content-Type": "application/json",
          ...getApiKeyOptions().headers,
        },
      },
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const fetchedVenues = Array.isArray(data) ? data : data.data || [];
        // Sort venues by created date (newest first)
        const sortedVenues = fetchedVenues.sort(
          (a, b) => new Date(b.created) - new Date(a.created),
        );
        // Take top 5 newest venues
        setVenues(sortedVenues.slice(0, 5));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="text-center my-4">Loading newest venues...</p>;
  if (error)
    return <p className="text-center text-danger my-4">Error: {error}</p>;
  if (venues.length === 0)
    return <p className="text-center my-4">No venues available.</p>;

  return (
    <div className="container featured-stays">
      <h2 className="mb-4 text-center">Fresh places, new possibilities</h2>
      <div
        id="newestVenuesCarousel"
        className="carousel slide mb-4"
        aria-label="Newest places to stay"
      >
        <div className="carousel-inner">
          {venues.map((venue, index) => {
            // Use first image from media or fallback to an Unsplash placeholder
            const imgSrc =
              venue.media && venue.media.length > 0
                ? venue.media[0].url
                : "https://source.unsplash.com/1600x600/?venue";
            // Build location string from available details
            let locationString = "";
            if (venue.location) {
              const { address, city, country } = venue.location;
              locationString = [address, city, country]
                .filter(Boolean)
                .join(", ");
            }
            return (
              <div
                key={venue.id}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
              >
                <VenueImage
                  src={imgSrc}
                  className="d-block w-100"
                  alt={venue.name}
                  style={{ height: "460px", objectFit: "cover" }}
                />
                <div className="carousel-caption p-4 rounded">
                  <h5 className="fw-bold">{venue.name}</h5>
                  <p>
                    {venue.description
                      ? venue.description.substring(0, 100) + "..."
                      : ""}
                  </p>
                  <p className="mb-1">
                    <strong>Price:</strong> ${venue.price} per night
                  </p>
                  <p className="mb-1">
                    <strong>Max Guests:</strong> {venue.maxGuests}
                  </p>
                  {locationString && (
                    <p className="mb-2">
                      <strong>Location:</strong> {locationString}
                    </p>
                  )}
                  <Link
                    to={`/venues/${venue.id}`}
                    className="btn btn-outline-light btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#newestVenuesCarousel"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
            style={{ filter: "brightness(150%)" }}
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#newestVenuesCarousel"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
            style={{ filter: "brightness(150%)" }}
          ></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
};

export default NewestVenuesCarousel;
