import React, { useState } from "react";

export const FALLBACK_IMAGE = `${process.env.PUBLIC_URL || ""}/venue-placeholder.svg`;

export default function VenueImage({ src, alt, ...props }) {
  const [failedSource, setFailedSource] = useState(null);
  const safeSource =
    /^https?:\/\//i.test(src || "") && failedSource !== src
      ? src
      : FALLBACK_IMAGE;
  return (
    <img
      {...props}
      src={safeSource}
      alt={alt || "Accommodation"}
      onError={() => setFailedSource(src)}
    />
  );
}
