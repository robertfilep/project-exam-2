import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import VenueCard from "../components/VenueCard";

describe("VenueCard Component", () => {
  const venue = {
    id: "1",
    name: "Test Venue",
    description:
      "This is a test venue description that is longer than 100 characters to check truncation in the card display.",
    price: 150,
    maxGuests: 5,
    media: [
      { url: "https://example.com/test-image.jpg", alt: "Test Venue Image" },
    ],
  };

  test("renders image, title, truncated description and view details link", () => {
    render(
      <Router>
        <VenueCard venue={venue} />
      </Router>,
    );
    // Check for image with correct alt text
    const image = screen.getByAltText(/Test Venue Image/i);
    expect(image).toBeInTheDocument();

    // Check for title
    expect(
      screen.getByRole("heading", { name: "Test Venue" }),
    ).toBeInTheDocument();

    // Check for truncated description (first part of the text)
    expect(
      screen.getByText(/This is a test venue description/i),
    ).toBeInTheDocument();

    // Check that the view details link exists with proper href
    const viewDetailsLink = screen.getByRole("link", { name: /View Details/i });
    expect(viewDetailsLink).toHaveAttribute("href", `/venues/${venue.id}`);
  });
});
