import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import MyVenues from "../components/MyVenues";

// Mock global fetch
global.fetch = jest.fn();

describe("MyVenues Component", () => {
  const dummyVenues = [
    {
      id: "1",
      name: "Venue One",
      description: "Description for venue one",
      media: [{ url: "https://example.com/image1.jpg", alt: "Image 1" }],
    },
    {
      id: "2",
      name: "Venue Two",
      description: "Description for venue two",
      media: [{ url: "https://example.com/image2.jpg", alt: "Image 2" }],
    },
  ];

  beforeEach(() => {
    fetch.mockClear();
  });

  test("renders venues after fetching", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: dummyVenues }),
    });

    render(
      <Router>
        <MyVenues username="testuser" token="dummy-token" />
      </Router>,
    );

    expect(screen.getByText(/Loading your venues/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Venue One" }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("heading", { name: "Venue Two" }),
    ).toBeInTheDocument();
  });

  test("deletes a venue when delete button is clicked", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: dummyVenues }),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    // Override window.confirm to simulate user confirmation
    window.confirm = jest.fn(() => true);

    render(
      <Router>
        <MyVenues username="testuser" token="dummy-token" />
      </Router>,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Venue One" }),
      ).toBeInTheDocument(),
    );

    // Find the delete button for the first venue
    const deleteButtons = screen.getAllByRole("button", { name: /Delete/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Venue One" }),
      ).not.toBeInTheDocument();
    });
  });
});
