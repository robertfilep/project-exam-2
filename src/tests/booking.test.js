import { validateBooking, nightsBetween } from "../booking";

const venue = {
  maxGuests: 4,
  bookings: [
    { dateFrom: "2099-05-10T00:00:00Z", dateTo: "2099-05-15T00:00:00Z" },
  ],
};
const stay = { dateFrom: "2099-05-01", dateTo: "2099-05-04", guests: 2 };

test("rejects past dates and reversed or zero-length stays", () => {
  expect(validateBooking({ ...stay, dateFrom: "2000-01-01" }, venue)).toMatch(
    /past/,
  );
  expect(validateBooking({ ...stay, dateTo: stay.dateFrom }, venue)).toMatch(
    /after/,
  );
  expect(validateBooking({ ...stay, dateTo: "2099-04-30" }, venue)).toMatch(
    /after/,
  );
});
test("rejects invalid guest counts", () => {
  for (const guests of [0, 5, 1.5, "abc"])
    expect(validateBooking({ ...stay, guests }, venue)).toMatch(/between/);
});
test("rejects partial and enclosing overlaps", () => {
  for (const [dateFrom, dateTo] of [
    ["2099-05-09", "2099-05-11"],
    ["2099-05-11", "2099-05-16"],
    ["2099-05-09", "2099-05-16"],
  ]) {
    expect(validateBooking({ ...stay, dateFrom, dateTo }, venue)).toMatch(
      /overlap/,
    );
  }
});
test("allows adjacent stays on checkout and check-in days", () => {
  expect(
    validateBooking(
      { ...stay, dateFrom: "2099-05-07", dateTo: "2099-05-10" },
      venue,
    ),
  ).toBe("");
  expect(
    validateBooking(
      { ...stay, dateFrom: "2099-05-15", dateTo: "2099-05-18" },
      venue,
    ),
  ).toBe("");
});
test("counts nights using calendar dates across daylight-saving changes", () => {
  expect(nightsBetween("2027-03-27", "2027-03-29")).toBe(2);
});
