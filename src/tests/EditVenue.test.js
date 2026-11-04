import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import EditVenue from "../pages/EditVenue";

test("editing a venue preserves extra images and zero-valued fields after a failed save", async () => {
  localStorage.setItem("token", "test-token");
  const media = [
    { url: "https://example.com/first.jpg", alt: "First" },
    { url: "https://example.com/second.jpg", alt: "Second" },
  ];
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          name: "Cabin",
          description: "A quiet stay",
          price: 0,
          maxGuests: 4,
          media,
          location: { lat: 0, lng: 0 },
        },
      }),
    })
    .mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        errors: [{ message: "Please check your venue details." }],
      }),
    });
  render(
    <MemoryRouter initialEntries={["/edit-venue/cabin"]}>
      <Routes>
        <Route path="/edit-venue/:id" element={<EditVenue />} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByLabelText("Venue Name");
  expect(screen.getByLabelText("Price per Night ($)")).toHaveValue(0);
  expect(screen.getByLabelText("Latitude")).toHaveValue(0);
  fireEvent.click(screen.getByRole("button", { name: "Update Venue" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Please check your venue details.",
  );
  expect(screen.getByLabelText("Venue Name")).toHaveValue("Cabin");
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Update Venue" })).toBeEnabled(),
  );
  expect(JSON.parse(global.fetch.mock.calls[1][1].body).media).toEqual(media);
  localStorage.clear();
});
