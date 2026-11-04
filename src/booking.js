export function localDateValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function nightsBetween(from, to) {
  return (Date.parse(to) - Date.parse(from)) / 86400000;
}

export function validateBooking(form, venue) {
  const { dateFrom, dateTo } = form;
  if (
    !dateFrom ||
    !dateTo ||
    !Number.isFinite(Date.parse(dateFrom)) ||
    !Number.isFinite(Date.parse(dateTo))
  )
    return "Choose valid check-in and check-out dates.";
  if (dateFrom < localDateValue()) return "Check-in cannot be in the past.";
  if (dateTo <= dateFrom) return "Check-out must be after check-in.";
  const guests = Number(form.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > venue.maxGuests)
    return `Choose between 1 and ${venue.maxGuests} guests.`;
  const overlap = (venue.bookings || []).some(
    (booking) =>
      dateFrom < booking.dateTo.slice(0, 10) &&
      dateTo > booking.dateFrom.slice(0, 10),
  );
  return overlap
    ? "These dates overlap an existing booking. Please choose another stay."
    : "";
}
