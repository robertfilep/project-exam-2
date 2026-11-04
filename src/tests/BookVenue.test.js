import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import BookVenue from "../pages/BookVenue";

const venue = {
  id: "cabin",
  name: "Forest Cabin",
  price: 100,
  maxGuests: 4,
  bookings: [],
};
const response = (data) => ({ ok: true, json: async () => ({ data }) });
function setup() {
  render(
    <MemoryRouter initialEntries={["/book-venue/cabin"]}>
      <Routes>
        <Route path="/book-venue/:id" element={<BookVenue />} />
      </Routes>
    </MemoryRouter>,
  );
}
async function fillStay() {
  await screen.findByRole("heading", { name: "Book your stay" });
  fireEvent.change(screen.getByLabelText("Check-in Date"), {
    target: { value: "2099-05-01" },
  });
  fireEvent.change(screen.getByLabelText("Check-out Date"), {
    target: { value: "2099-05-04" },
  });
}
beforeEach(() => {
  localStorage.setItem("token", "test-token");
});
afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

test("API errors preserve the form and dates so a guest can correct the booking", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce(response(venue))
    .mockResolvedValueOnce(response(venue))
    .mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        errors: [{ message: "Those dates are unavailable." }],
      }),
    });
  setup();
  await fillStay();
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Those dates are unavailable.",
  );
  expect(screen.getByLabelText("Check-in Date")).toHaveValue("2099-05-01");
  expect(screen.getByRole("button", { name: "Confirm booking" })).toBeEnabled();
});

test("availability is refreshed and a newly conflicting stay is not posted", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce(response(venue))
    .mockResolvedValueOnce(
      response({
        ...venue,
        bookings: [
          {
            id: "other",
            dateFrom: "2099-05-02T00:00:00Z",
            dateTo: "2099-05-05T00:00:00Z",
          },
        ],
      }),
    );
  setup();
  await fillStay();
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(/overlap/);
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test("a successful booking shows confirmation and cannot be submitted again", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce(response(venue))
    .mockResolvedValueOnce(response(venue))
    .mockResolvedValueOnce(response({ id: "booking" }));
  setup();
  await fillStay();
  expect(screen.getByText("3 nights · Total $300.00")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Confirm booking" }));
  expect(
    await screen.findByRole("heading", { name: "Your stay is booked" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Confirm booking" }),
  ).not.toBeInTheDocument();
  const payload = JSON.parse(global.fetch.mock.calls[2][1].body);
  expect(payload).toEqual({
    venueId: "cabin",
    dateFrom: "2099-05-01T00:00:00.000Z",
    dateTo: "2099-05-04T00:00:00.000Z",
    guests: 1,
  });
});
