import React from "react";
import { useLocation } from "react-router-dom";
import VenueList from "../components/VenueList";
import NewestVenuesCarousel from "../components/NewestVenuesCarousel";

export default function Home() {
  const query = new URLSearchParams(useLocation().search).get("q") || "";
  return (
    <>
      {!query && (
        <section className="home-intro container">
          <p className="eyebrow">A LITTLE FURTHER FROM EVERYDAY</p>
          <h1>
            Find a place.
            <br />
            <span>Make it a memory.</span>
          </h1>
          <p>
            From quiet weekends to something a little more adventurous.
            <br className="d-none d-md-block" /> Discover a stay that feels
            right for you.
          </p>
          <a className="btn btn-primary" href="#stays">
            Explore stays <span aria-hidden="true">↗</span>
          </a>
        </section>
      )}
      {!query && <NewestVenuesCarousel />}
      <VenueList key={query.trim()} />
    </>
  );
}
