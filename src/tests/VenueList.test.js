import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import VenueList from "../components/VenueList";

beforeEach(() => {
  // Reset the fetch mock before each test.
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: "1",
              name: "Venue One",
              description:
                "Description for venue one that is long enough to be truncated.",
              price: 100,
              maxGuests: 4,
              created: "2025-02-22T10:00:00Z",
              media: [
                { url: "https://example.com/image1.jpg", alt: "Image 1" },
              ],
            },
            {
              id: "2",
              name: "Venue Two",
              description: "Description for venue two.",
              price: 150,
              maxGuests: 6,
              created: "2025-02-21T10:00:00Z",
              media: [
                { url: "https://example.com/image2.jpg", alt: "Image 2" },
              ],
            },
          ],
        }),
    }),
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test("VenueList renders loading message and then venue cards", async () => {
  render(
    <Router>
      <VenueList />
    </Router>,
  );
  // Check that a loading message appears
  expect(screen.getByText(/Loading venues/i)).toBeInTheDocument();

  // Wait for at least one venue to be rendered.
  await waitFor(() => {
    // Use getAllByText if multiple elements with "Venue One" are expected.
    const venueElements = screen.getAllByText(/Venue One/i);
    expect(venueElements.length).toBeGreaterThanOrEqual(1);
  });

  // Also check for "Venue Two" using getByText if it should be unique
  expect(
    screen.getByRole("heading", { name: "Venue Two" }),
  ).toBeInTheDocument();
});
