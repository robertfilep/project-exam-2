import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VenueList from "../components/VenueList";

const place = (id, name) => ({
  id,
  name,
  description: null,
  price: 100,
  maxGuests: 2,
});
const response = (data, meta = {}) => ({
  ok: true,
  json: async () => ({ data, meta }),
});

test("search goes to the API and safely renders missing descriptions", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValue(response([place("1", "Quiet Cabin")]));
  render(
    <MemoryRouter initialEntries={["/?q=quiet%20cabin"]}>
      <VenueList />
    </MemoryRouter>,
  );
  expect(
    await screen.findByRole("heading", { name: "Quiet Cabin" }),
  ).toBeInTheDocument();
  const url = new URL(global.fetch.mock.calls[0][0]);
  expect(url.pathname).toBe("/holidaze/venues/search");
  expect(url.searchParams.get("q")).toBe("quiet cabin");
});

test("load more requests the next API page and sorting resets the list", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce(
      response([place("1", "First Cabin")], { nextPage: 2 }),
    )
    .mockResolvedValueOnce(
      response([place("2", "Second Cabin")], { nextPage: null }),
    )
    .mockResolvedValueOnce(
      response([place("3", "Cheapest Cabin")], { nextPage: null }),
    );
  render(
    <MemoryRouter>
      <VenueList />
    </MemoryRouter>,
  );
  await screen.findByRole("heading", { name: "First Cabin" });
  fireEvent.click(screen.getByRole("button", { name: "Show More" }));
  await screen.findByRole("heading", { name: "Second Cabin" });
  expect(new URL(global.fetch.mock.calls[1][0]).searchParams.get("page")).toBe(
    "2",
  );
  expect(
    screen.getByRole("heading", { name: "First Cabin" }),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Sort by"), {
    target: { value: "price-asc" },
  });
  await screen.findByRole("heading", { name: "Cheapest Cabin" });
  expect(
    screen.queryByRole("heading", { name: "First Cabin" }),
  ).not.toBeInTheDocument();
  const sorted = new URL(global.fetch.mock.calls[2][0]);
  expect(sorted.searchParams.get("page")).toBe("1");
  expect(sorted.searchParams.get("sort")).toBe("price");
  expect(sorted.searchParams.get("sortOrder")).toBe("asc");
});

test("failed requests can be retried without reloading the page", async () => {
  global.fetch = jest
    .fn()
    .mockRejectedValueOnce(new Error("Connection lost."))
    .mockResolvedValueOnce(response([place("1", "Recovered Cabin")]));
  render(
    <MemoryRouter>
      <VenueList />
    </MemoryRouter>,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Connection lost.",
  );
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(
    await screen.findByRole("heading", { name: "Recovered Cabin" }),
  ).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
  );
});
