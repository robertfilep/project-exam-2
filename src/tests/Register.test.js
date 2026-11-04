import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../pages/Register";
import { BrowserRouter as Router } from "react-router-dom";

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            // Simulate a registration response
            name: "UniqueUser",
            email: "uniqueuser@stud.noroff.no",
          },
        }),
    }),
  );
});

describe("Register Component", () => {
  test("submits the registration form and displays success message", async () => {
    render(
      <Router>
        <Register />
      </Router>,
    );
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "UniqueUser" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "uniqueuser@stud.noroff.no" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Register", exact: true }),
    );

    await waitFor(() => {
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument();
    });
  });
});
