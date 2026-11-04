import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});
afterEach(() => jest.restoreAllMocks());

test("unknown routes offer a way home", () => {
  window.history.replaceState({}, "", "/missing-page");
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Page not found" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Explore stays" })).toHaveAttribute(
    "href",
    "/",
  );
});

test("a guest returns to the booking page after login and the header updates", async () => {
  window.history.replaceState({}, "", "/book-venue/cabin");
  global.fetch = jest
    .fn()
    .mockImplementation((url) =>
      Promise.resolve({
        ok: true,
        json: async () =>
          url.includes("/auth/login")
            ? { data: { accessToken: "test-token", name: "Guest" } }
            : {
                data: {
                  id: "cabin",
                  name: "Forest Cabin",
                  maxGuests: 4,
                  price: 100,
                  bookings: [],
                },
              },
      }),
    );
  render(<App />);
  expect(
    await screen.findByRole("heading", { name: "Login" }),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "guest@stud.noroff.no" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "test-password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));
  expect(
    await screen.findByRole("heading", { name: "Book your stay" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
  expect(window.location.pathname).toBe("/book-venue/cabin");
});

test("logout clears the entire session and immediately updates navigation", async () => {
  localStorage.setItem("token", "test-token");
  localStorage.setItem("username", "Guest");
  global.fetch = jest
    .fn()
    .mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: {} }),
    });
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Logout" }));
  await waitFor(() =>
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument(),
  );
  expect(localStorage.getItem("username")).toBeNull();
  expect(localStorage.getItem("token")).toBeNull();
});
