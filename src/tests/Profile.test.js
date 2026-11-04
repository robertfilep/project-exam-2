import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../pages/Profile";

beforeEach(() => {
  localStorage.setItem("token", "test-token");
  localStorage.setItem("username", "Guest");
});
afterEach(() => localStorage.clear());

test("nullable images are safe and cancelling edits leaves the saved profile unchanged", async () => {
  global.fetch = jest
    .fn()
    .mockImplementation((url) =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          data: url.includes("/bookings")
            ? []
            : {
                name: "Guest",
                email: "guest@stud.noroff.no",
                bio: "Original bio",
                avatar: null,
                banner: null,
                venueManager: false,
              },
        }),
      }),
    );
  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  );
  await screen.findByRole("heading", { name: "My Profile" });
  fireEvent.click(screen.getByRole("button", { name: "Edit Profile" }));
  fireEvent.change(screen.getByLabelText("Bio"), {
    target: { value: "Unsaved bio" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Cancel", exact: true }));
  expect(screen.getByText("Original bio")).toBeInTheDocument();
  expect(screen.queryByText("Unsaved bio")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "Add Venue" }),
  ).not.toBeInTheDocument();
});
