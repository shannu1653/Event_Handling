/************************************
 BUY EVENT FUNCTION
************************************/

function buyEvent(index) {

  // Get all events
  const events = JSON.parse(localStorage.getItem("events")) || [];

  // Get selected event
  const selectedEvent = events[index];

  // Get tickets from localStorage
  let tickets = JSON.parse(localStorage.getItem("tickets")) || [];

  // Check if event already exists in tickets
  const existingTicketIndex = tickets.findIndex(
    ticket => ticket.title === selectedEvent.title
  );

  if (existingTicketIndex !== -1) {
    // If already exists → increase quantity
    tickets[existingTicketIndex].quantity += 1;

    // Update total price
    tickets[existingTicketIndex].totalPrice =
      tickets[existingTicketIndex].quantity * tickets[existingTicketIndex].price;
  } else {
    // If new event → add to tickets
    tickets.push({
      title: selectedEvent.title,
      date: selectedEvent.date,
      category: selectedEvent.category,
      price: Number(selectedEvent.price),
      quantity: 1,
      totalPrice: Number(selectedEvent.price),
      image: selectedEvent.image
    });
  }

  // Save tickets
  localStorage.setItem("tickets", JSON.stringify(tickets));

  // Redirect to Find My Tickets page
  window.location.href = "findmytickets.html";
}
