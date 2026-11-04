import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function VenueSearch() {
  const { search } = useLocation();
  return <Navigate replace to={`/${search}`} />;
}
