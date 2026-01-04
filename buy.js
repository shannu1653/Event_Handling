/************************************
 BUY EVENT FUNCTION
************************************/

function buyEvent(index) {

  const tickets = JSON.parse(localStorage.getItem("tickets")) || [];

  const event = events[index];

  const ticket = {
    title: event.title,
    date: event.date,
    category: event.category,
    image: event.image,
    price: Number(event.price),
    quantity: 1,
    totalPrice: Number(event.price)
  };

  tickets.push(ticket);

  localStorage.setItem("tickets", JSON.stringify(tickets));

  window.location.href = "findmytickets.html";
}
