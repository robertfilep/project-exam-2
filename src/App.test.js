import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
  global.fetch = jest
    .fn()
    .mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], meta: { nextPage: null, totalCount: 0 } }),
    });
});

test("the home page loads and provides a link to browse stays", async () => {
  render(<App />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
    "Make it a memory.",
  );
  expect(screen.getByRole("link", { name: /Explore stays/ })).toHaveAttribute(
    "href",
    "#stays",
  );
  expect(
    await screen.findByRole("heading", { name: "No stays found" }),
  ).toBeInTheDocument();
});
