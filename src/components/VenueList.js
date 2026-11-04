import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import VenueCard from "./VenueCard";
import { request } from "../api";

const PAGE_SIZE = 21;
const sorting = {
  newest: ["created", "desc"],
  "price-asc": ["price", "asc"],
  "price-desc": ["price", "desc"],
};

export default function VenueList() {
  const query = (
    new URLSearchParams(useLocation().search).get("q") || ""
  ).trim();
  const [venues, setVenues] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    if (page === 1) setVenues([]);
    const [sort, sortOrder] = sorting[sortOption];
    const params = new URLSearchParams({
      limit: PAGE_SIZE,
      page,
      sort,
      sortOrder,
    });
    if (query) params.set("q", query);
    request(`/holidaze/venues${query ? "/search" : ""}?${params}`, {
      signal: controller.signal,
    })
      .then((body) => {
        if (!active) return;
        const batch = body?.data || [];
        setVenues((previous) =>
          page === 1
            ? batch
            : [
                ...new Map(
                  [...previous, ...batch].map((venue) => [venue.id, venue]),
                ).values(),
              ],
        );
        setHasMore(Boolean(body?.meta?.nextPage));
        setTotal(body?.meta?.totalCount ?? null);
      })
      .catch((err) => {
        if (active && err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [query, sortOption, page, retry]);

  // Remounting this component for each search keeps pagination tied to the URL.
  return (
    <section
      className="container py-5"
      id="stays"
      aria-labelledby="venues-heading"
    >
      <div className="listing-toolbar">
        <div>
          <p className="eyebrow">FIND YOUR NEXT GETAWAY</p>
          <h2 id="venues-heading">
            {query ? `Stays matching “${query}”` : "Explore places to stay"}
          </h2>
          <p className="text-muted mb-0">
            {total !== null
              ? `${total.toLocaleString()} places to discover`
              : "A change of scenery starts here."}
          </p>
        </div>
        <div>
          <label htmlFor="sort" className="form-label small">
            Sort by
          </label>
          <select
            id="sort"
            className="form-select"
            value={sortOption}
            onChange={(event) => {
              setPage(1);
              setSortOption(event.target.value);
            }}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>
      </div>
      {query && (
        <Link to="/" className="d-inline-block mb-4">
          Clear search
        </Link>
      )}
      {error && (
        <div role="alert" className="alert alert-danger">
          {error}{" "}
          <button
            type="button"
            className="btn btn-outline-danger btn-sm ms-2"
            onClick={() => setRetry((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      )}
      <div className="row g-4" aria-busy={loading}>
        {venues.map((venue) => (
          <div key={venue.id} className="col-12 col-md-6 col-lg-4">
            <VenueCard venue={venue} />
          </div>
        ))}
      </div>
      {loading && (
        <p role="status" className="text-center py-4">
          Loading venues...
        </p>
      )}
      {!loading && !error && !venues.length && (
        <div className="empty-state">
          <h3>No stays found</h3>
          <p>Try another name or a broader search.</p>
          <Link to="/" className="btn btn-primary">
            Explore all stays
          </Link>
        </div>
      )}
      {hasMore && !error && (
        <div className="text-center mt-5">
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading}
            onClick={() => setPage((n) => n + 1)}
          >
            {loading ? "Loading…" : "Show More"}
          </button>
        </div>
      )}
    </section>
  );
}
