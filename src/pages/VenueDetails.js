import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getApiKeyOptions } from "../apiConfig";
import VenueImage from "../components/VenueImage";

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    // Include _owner=true to fetch owner/profile info
    fetch(
      `https://v2.api.noroff.dev/holidaze/venues/${id}?_owner=true`,
      getApiKeyOptions(),
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error fetching venue details");
        }
        return res.json();
      })
      .then((data) => {
        setVenue(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return <p className="text-center my-4">Loading venue details...</p>;
  if (error)
    return <p className="text-center text-danger my-4">Error: {error}</p>;
  if (!venue) return <p className="text-center my-4">No venue found</p>;

  // Check if the user is logged in
  const token = localStorage.getItem("token");

  return (
    <div className="container my-5">
      <h1 className="mb-4 text-center">{venue.name}</h1>
      <div className="card shadow mb-4">
        <div className="row g-0">
          <div className="col-md-6">
            <div className="ratio ratio-16x9">
              {venue.media && venue.media.length > 1 ? (
                <div
                  id="venueImagesCarousel"
                  className="carousel slide"
                  aria-label="Venue photos"
                >
                  <div className="carousel-inner">
                    {venue.media.map((img, index) => (
                      <div
                        key={index}
                        className={`carousel-item ${index === 0 ? "active" : ""}`}
                      >
                        <VenueImage
                          src={img.url}
                          alt={img.alt || venue.name}
                          className="d-block w-100 img-fluid"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#venueImagesCarousel"
                    data-bs-slide="prev"
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#venueImagesCarousel"
                    data-bs-slide="next"
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Next</span>
                  </button>
                </div>
              ) : (
                <VenueImage
                  src={
                    venue.media && venue.media.length > 0
                      ? venue.media[0].url
                      : "https://source.unsplash.com/800x600/?hotel"
                  }
                  alt={
                    venue.media && venue.media.length > 0
                      ? venue.media[0].alt || venue.name
                      : venue.name
                  }
                  className="img-fluid rounded-start"
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="card-body">
              <p className="card-text">{venue.description}</p>
              <p className="card-text">
                <strong>Price:</strong> ${venue.price}
              </p>
              <p className="card-text">
                <strong>Max Guests:</strong> {venue.maxGuests}
              </p>
              <p className="card-text">
                <strong>Rating:</strong> {venue.rating}
              </p>
              {venue.location && (
                <p className="card-text">
                  <strong>Location:</strong> {venue.location.address},{" "}
                  {venue.location.city}, {venue.location.country}
                </p>
              )}
              <div className="mt-4">
                {token ? (
                  <Link
                    to={`/book-venue/${venue.id}`}
                    className="btn btn-primary btn-lg"
                  >
                    Book Now
                  </Link>
                ) : (
                  <button
                    onClick={() =>
                      navigate("/login", {
                        state: { from: `/book-venue/${venue.id}` },
                      })
                    }
                    className="btn btn-primary btn-lg"
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Owner / Profile Information */}
      {venue.owner ? (
        <div className="card shadow p-4">
          <h4 className="mb-3">Hosted by: {venue.owner.name}</h4>
          <div className="d-flex align-items-center">
            {venue.owner.avatar && (
              <VenueImage
                src={venue.owner.avatar.url}
                alt={venue.owner.avatar.alt || venue.owner.name}
                className="rounded-circle me-3"
                style={{ width: "60px", height: "60px", objectFit: "cover" }}
              />
            )}
            <div>
              <p className="mb-1">
                <strong>Email:</strong> {venue.owner.email || "Not provided"}
              </p>
              <p className="mb-1">
                <strong>Bio:</strong> {venue.owner.bio || "No bio provided."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center">Owner information not available.</p>
      )}
    </div>
  );
};

export default VenueDetails;
