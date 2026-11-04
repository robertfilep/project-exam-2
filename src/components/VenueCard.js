import React from "react";
import { Link } from "react-router-dom";
import VenueImage from "./VenueImage";

export default function VenueCard({ venue }) {
  const location = [venue.location?.city, venue.location?.country]
    .filter(Boolean)
    .join(", ");
  const description = venue.description || "";
  return (
    <article className="card venue-card h-100">
      <Link
        to={`/venues/${venue.id}`}
        aria-label={`View ${venue.name}`}
        className="venue-image-link"
      >
        <VenueImage
          src={venue.media?.[0]?.url}
          alt={venue.media?.[0]?.alt || venue.name}
          className="card-img-top"
          loading="lazy"
          width="600"
          height="400"
        />
      </Link>
      <div className="card-body d-flex flex-column">
        <p className="venue-location">
          {location || "Somewhere worth discovering"}
        </p>
        <h3 className="h5 card-title">{venue.name}</h3>
        <p className="card-text text-muted">
          {description.length > 100
            ? `${description.slice(0, 100)}…`
            : description}
        </p>
        <p className="small text-muted">
          Up to {venue.maxGuests || 1} guests
          {venue.rating > 0 ? ` · ★ ${venue.rating}` : ""}
        </p>
        <div className="mt-auto d-flex justify-content-between align-items-center gap-2">
          <p className="mb-0">
            <strong>${venue.price}</strong>{" "}
            <span className="small text-muted">per night</span>
          </p>
          <Link
            to={`/venues/${venue.id}`}
            className="btn btn-outline-secondary btn-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
