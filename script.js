/*********************************************************
 GLOBAL VARIABLES
**********************************************************/
/*********************************************************
 AUTH GUARD – BLOCK UNAUTHORIZED ACCESS
**********************************************************/
if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "login.html";
}


/*********************************************************
 HELPERS FOR SORTING
**********************************************************/

// Convert price string → number
function getPriceNumber(price) {
  return Number(price) || 0;
}

// Convert date text → sortable number (simple)
function getDateValue(dateText) {
  if (dateText.includes("Today")) return 1;
  if (dateText.includes("Tomorrow")) return 2;
  if (dateText.includes("Sunday")) return 3;
  return 99; // fallback
}


// Load events from localStorage OR empty array
let events = JSON.parse(localStorage.getItem("events")) || [];
let filteredEvents = [...events];



// ✅ BACKUP ORIGINAL ORDER (FOR SORT RESET)
let originalEvents = [...events];
// Track edit mode
let editIndex = null;

/*********************************************************
 AUTO LOAD DEMO EVENTS (FIRST TIME ONLY)
**********************************************************/
if (!localStorage.getItem("events") || events.length === 0) {
  events = [
    {
      title: "Music Night Live",
      date: "Today • 7:00 PM",
      price: "299",
      category: "Music",
      description: "Live DJ and band performance",
      image: "https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg"
    },
    {
      title: "Tech Conference 2025",
      date: "Tomorrow • 10:00 AM",
      price: "499",
      category: "Tech",
      description: "AI, Web & Cloud sessions",
      image: "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg"
    },
    {
      title: "Business Meetup",
      date: "Sunday • 4:00 PM",
      price: "199",
      category: "Business",
      description: "Startup founders networking",
      image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
    }
  ];

  localStorage.setItem("events", JSON.stringify(events));
  filteredEvents = [...events];   // ✅ ADD THIS LINE
originalEvents = [...events]; 
}

/*********************************************************
 GET DOM ELEMENTS (ALWAYS FIRST)
**********************************************************/
const openCreateEvent = document.getElementById("openCreateEvent");
const eventModal = document.getElementById("eventModal");
const eventModalOverlay = document.getElementById("eventModalOverlay");
const closeEventBtn = document.getElementById("closeEventBtn");
const saveEventBtn = document.getElementById("saveEventBtn");
const eventsContainer = document.getElementById("eventsContainer");
const eventImagePreview = document.getElementById("eventImagePreview");
const emptyState = document.getElementById("emptyState");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortEvents");

/*********************************************************
 OPEN CREATE EVENT MODAL
**********************************************************/
openCreateEvent?.addEventListener("click", () => {
  eventModal.style.display = "block";
  eventModalOverlay.style.display = "block";
  setTimeout(() => eventModal.classList.add("show"), 10);
  clearForm();
});

/*********************************************************
 CLOSE MODAL
**********************************************************/
function closeModal() {
  eventModal.classList.remove("show");
  setTimeout(() => {
    eventModal.style.display = "none";
    eventModalOverlay.style.display = "none";
  }, 300);
  editIndex = null;
}

closeEventBtn?.addEventListener("click", closeModal);
eventModalOverlay?.addEventListener("click", closeModal);

/*********************************************************
 IMAGE PREVIEW
**********************************************************/
document.getElementById("eventImageInput")?.addEventListener("input", function () {
  const url = this.value.trim();
  if (url) {
    eventImagePreview.src = url;
    eventImagePreview.style.display = "block";
  } else {
    eventImagePreview.style.display = "none";
  }
});


/*********************************************************
 LOGOUT FUNCTION (FIXED)
**********************************************************/
document.getElementById("logoutBtn")?.addEventListener("click", function () {

  // Remove login flag (THIS IS THE KEY USED IN LOGIN)
  localStorage.removeItem("loggedIn");

  // Optional: clear user-related data
  localStorage.removeItem("tickets");
  localStorage.removeItem("selectedTicket");

  // Redirect to login page
  window.location.href = "login.html";
});



/*********************************************************
 SAVE EVENT
**********************************************************/
saveEventBtn?.addEventListener("click", () => {
  const title = document.getElementById("eventTitleInput").value.trim();
  const date = document.getElementById("eventDateInput").value.trim();
  const price = document.getElementById("eventPriceInput").value.trim();
  const category = document.getElementById("eventCategoryInput").value;
  const description = document.getElementById("eventDescriptionInput").value.trim();
  const image = document.getElementById("eventImageInput").value.trim();

  if (!title || !date || !price || !category || !description || !image) {
    alert("Please fill all fields");
    return;
  }

  const eventData = { title, date, price, category, description, image };

  if (editIndex === null) {
    events.push(eventData);
  } else {
    events[editIndex] = eventData;
  }

  localStorage.setItem("events", JSON.stringify(events));
  originalEvents = [...events];  
  filteredEvents = [...events];
  renderEvents();
  renderTrendingEvents();
  closeModal();
});

/*********************************************************
 RENDER EVENTS
**********************************************************/
function renderEvents() {
  eventsContainer.innerHTML = "";

  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  if (filteredEvents.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  filteredEvents.forEach((event, index) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    const isWishlisted = wishlist.some(w => w.title === event.title);

    col.innerHTML = `
      <div class="eventCard fadeCard">
        <div class="eventImageWrap">
          <img src="${event.image}" class="eventImg">
          <div class="imageOverlay" onclick="viewEvent(${index})">
            <span>View Details</span>
          </div>
        </div>

        <div class="eventInfo">
          <h5>${event.title}</h5>
          <p>${event.date}</p>
          <p>₹ ${event.price}</p>
          <p>${event.category}</p>

          <div class="eventActions">
            <button onclick="viewEvent(${index})">View</button>
            <button onclick="editEvent(${index})">Edit</button>
            <button onclick="buyEvent(${index})">Buy</button>
            <button onclick="deleteEvent(${index})">Delete</button>
            <button onclick="toggleWishlist(${index})" id="heart-${index}">
              ${isWishlisted ? "❤️" : "🩵"}
            </button>
          </div>
        </div>
      </div>
    `;

    eventsContainer.appendChild(col);
  });
   observeCards(); 
}


/*********************************************************
 PRICE NORMALIZER (VERY IMPORTANT)
**********************************************************/
function getPrice(price) {
  // Remove currency symbols and text
  return Number(price.toString().replace(/[^0-9]/g, "")) || 0;
}

/*************************************
 SORT EVENTS (FIXED & WORKING)
*************************************/
sortSelect?.addEventListener("change", function () {
  const type = this.value;

  // 🔁 Reset to original order
  if (type === "") {
    events = [...originalEvents];
    filteredEvents = [...events];
    renderEvents();        // ✅ ADD THIS LINE
    return; 
  }

  // 🔽 Price: Low → High
  if (type === "low") {
    events.sort((a, b) => getPrice(a.price) - getPrice(b.price));
  }

  // 🔼 Price: High → Low
  if (type === "high") {
    events.sort((a, b) => getPrice(b.price) - getPrice(a.price));
  }

  // Save new order
  localStorage.setItem("events", JSON.stringify(events));
  filteredEvents = [...events]; 
  // Re-render UI
  renderEvents();
  observeCards();  
  renderTrendingEvents();
});


/*********************************************************
 CATEGORY FILTER
**********************************************************/
categoryFilter?.addEventListener("change", filterEvents);

function filterEvents() {
  const selected = categoryFilter.value;

  if (selected === "All") {
    filteredEvents = [...events];
  } else {
    filteredEvents = events.filter(e => e.category === selected);
  }

  renderEvents();      // ✅ ALWAYS USE renderEvents
  observeCards();
}


/*********************************************************
 WISHLIST TOGGLE
**********************************************************/
function toggleWishlist(index) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const event = filteredEvents[index];
  const found = wishlist.findIndex(w => w.title === event.title);

  if (found === -1) {
    wishlist.push(event);
  } else {
    wishlist.splice(found, 1);
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  filteredEvents = [...events];  
  renderEvents();
}














/*********************************************************
 TRENDING EVENTS
**********************************************************/
function renderTrendingEvents() {
  const container = document.getElementById("trendingEvents");
  if (!container) return;

  container.innerHTML = "";

  events.slice(0, 6).forEach(event => {
    const div = document.createElement("div");
    div.className = "trendingCard";
    div.innerHTML = `
      <img src="${event.image}">
      <h6>${event.title}</h6>
      <p>₹ ${event.price}</p>
    `;
    container.appendChild(div);
  });
}

/*********************************************************
 VIEW / EDIT / DELETE / BUY
**********************************************************/
function viewEvent(index) {
  alert(filteredEvents[index].title);
}

function editEvent(index) {
  editIndex = events.findIndex(
    e => e.title === filteredEvents[index].title
  );
}

function deleteEvent(index) {
  const realIndex = events.findIndex(
    e => e.title === filteredEvents[index].title
  );

  if (confirm("Delete event?")) {
    events.splice(realIndex, 1);
    localStorage.setItem("events", JSON.stringify(events));

    filteredEvents = [...events];
    originalEvents = [...events];

    renderEvents();
  }
}

function buyEvent(index) {
  localStorage.setItem(
    "selectedTicket",
    JSON.stringify(filteredEvents[index])
  );
  window.location.href = "findmytickets.html";
}

/*********************************************************
 CLEAR FORM
**********************************************************/
function clearForm() {
  document.querySelectorAll("#eventModal input, #eventModal textarea").forEach(i => i.value = "");
  eventImagePreview.style.display = "none";
}



/*********************************************************
 ANIMATED STATISTICS COUNTER
**********************************************************/
/*********************************************************
 ANIMATE STATS ONLY WHEN VISIBLE
**********************************************************/

// 1️⃣ Select stats section
const statsSection = document.getElementById("statsSection");

// 2️⃣ Select all counters
const statNumbers = document.querySelectorAll(".statNumber");

// 3️⃣ Flag to run animation only once
let statsAnimated = false;

// 4️⃣ Counter animation function
function animateStats() {
  statNumbers.forEach(counter => {
    const target = +counter.getAttribute("data-target");
    let count = 0;

    const increment = Math.ceil(target / 100);

    function updateCounter() {
      count += increment;

      if (count < target) {
        counter.innerText = count;
        requestAnimationFrame(updateCounter);
      } else {
        counter.innerText = target + "+";
      }
    }

    updateCounter();
  });
}

// 5️⃣ Intersection Observer
const statsObserver = new IntersectionObserver(
  function (entries) {
    const entry = entries[0];

    if (entry.isIntersecting && !statsAnimated) {
      animateStats();
      statsAnimated = true; // run only once
    }
  },
  {
    threshold: 0.4 // 40% section visible
  }
);

// 6️⃣ Start observing
statsObserver.observe(statsSection);










/************************************
 NEWSLETTER SUBSCRIPTION
************************************/
function subscribeNewsletter() {
  const emailInput = document.getElementById("newsletterEmail");
  const message = document.getElementById("newsletterMsg");

  const email = emailInput.value.trim();

  // Simple validation
  if (!email || !email.includes("@")) {
    message.style.color = "red";
    message.innerText = "Please enter a valid email address ❌";
    return;
  }

  // Get old subscribers
  let subscribers = JSON.parse(localStorage.getItem("newsletter")) || [];

  // Prevent duplicate emails
  if (subscribers.includes(email)) {
    message.style.color = "orange";
    message.innerText = "You are already subscribed 😊";
    return;
  }

  // Save email
  subscribers.push(email);
  localStorage.setItem("newsletter", JSON.stringify(subscribers));

  // Success message
  message.style.color = "green";
  message.innerText = "Subscribed successfully 🎉";

  // Clear input
  emailInput.value = "";
}




/*********************************************************
 FADE-IN EVENT CARDS WHEN VISIBLE
**********************************************************/

// Select all fade cards
function observeCards() {
  const cards = document.querySelectorAll(".fadeCard");

  const cardObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.2 // 20% visible
    }
  );

  cards.forEach(card => {
    cardObserver.observe(card);
  });
}

/*********************************************************
 CLOSE MOBILE MENU AFTER CLICK
**********************************************************/
document.querySelectorAll(".mobileMenu .nav-link").forEach(link => {
  link.addEventListener("click", () => {
    const menu = document.getElementById("mainMenu");
    if (menu.classList.contains("show")) {
      new bootstrap.Collapse(menu).hide();
    }
  });
});




/*********************************************************
 INITIAL LOAD
**********************************************************/
renderEvents();
observeCards();
renderTrendingEvents();
