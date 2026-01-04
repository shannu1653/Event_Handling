/*********************************************************
 GLOBAL VARIABLES
**********************************************************/

/* Get events from localStorage or create empty array */
let events = JSON.parse(localStorage.getItem("events")) || [];

/* Used to track edit mode */
let editIndex = null;


/*********************************************************
 GET DOM ELEMENTS
**********************************************************/
const openCreateEvent = document.getElementById("openCreateEvent");
const eventModal = document.getElementById("eventModal");
const eventModalOverlay = document.getElementById("eventModalOverlay");
const closeEventBtn = document.getElementById("closeEventBtn");
const saveEventBtn = document.getElementById("saveEventBtn");
const eventsContainer = document.getElementById("eventsContainer");
const eventImagePreview = document.getElementById("eventImagePreview");

/*********************************************************
 OPEN CREATE EVENT MODAL
**********************************************************/
openCreateEvent.addEventListener("click", function () {

    /* Show modal & overlay */
    eventModal.style.display = "block";
    eventModalOverlay.style.display = "block";

    /* Add animation class */
    setTimeout(function () {
        eventModal.classList.add("show");
    }, 10);

    /* Clear old data */
    clearForm();
});

/*********************************************************
 CLOSE MODAL FUNCTION
**********************************************************/
function closeModal() {

    /* Remove animation */
    eventModal.classList.remove("show");

    /* Hide after animation */
    setTimeout(function () {
        eventModal.style.display = "none";
        eventModalOverlay.style.display = "none";
    }, 300);

    editIndex = null;
}

/* Close modal when clicking cancel button */
closeEventBtn.addEventListener("click", closeModal);

/* Close modal when clicking overlay */
eventModalOverlay.addEventListener("click", closeModal);


/*********************************************************
//adding images through url
**********************************************************/
document.getElementById("eventImageInput").addEventListener("input", function () {
  const url = this.value.trim();
  const preview = document.getElementById("eventImagePreview");

  if (url) {
    preview.src = url;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }
});


/*********************************************************
 SAVE EVENT (CREATE / EDIT)
**********************************************************/
saveEventBtn.addEventListener("click", function () {

    /* Get input values */
    const title = document.getElementById("eventTitleInput").value.trim();
    const date = document.getElementById("eventDateInput").value.trim();
    const price = document.getElementById("eventPriceInput").value.trim();
    const category = document.getElementById("eventCategoryInput").value;
    const description = document.getElementById("eventDescriptionInput").value.trim();

    /* Validation */
    const imageUrl = document.getElementById("eventImageInput").value.trim();

if (!title || !date || !price || !category || !description || !imageUrl) {
  alert("Please fill all fields");
  return;
}



    /* Event object */
    const eventData = {
        title: title,
        date: date,
        price: price,
        category: category,
        description: description,
        image: imageUrl

    };

    /* Add or update event */
    if (editIndex === null) {
        events.push(eventData);
    } else {
        events[editIndex] = eventData;
    }

    /* Save to localStorage */
    localStorage.setItem("events", JSON.stringify(events));

    /* Refresh UI */
    renderEvents();

    /* Close modal */
    closeModal();
});





// AUTO LOAD DEMO EVENTS (ONLY IF EMPTY)
if (!localStorage.getItem("events")) {
  localStorage.setItem("events", JSON.stringify([
    {
      title: "Music Night Live",
      date: "Today 7:00 PM",
      price: "299",
      category: "Music",
      description: "Live concert with DJ and band",
      image: "https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg"
    },
    {
      title: "Tech Conference 2025",
      date: "Tomorrow 10:00 AM",
      price: "499",
      category: "Tech",
      description: "Latest trends in AI & Web",
      image: "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg"
    },
    {
      title: "Business Meetup",
      date: "Sunday 4:00 PM",
      price: "199",
      category: "Business",
      description: "Networking for startups",
      image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
    }
  ]));
}











/*********************************************************
 RENDER EVENTS ON PAGE
**********************************************************/
function renderEvents() {
  eventsContainer.innerHTML = "";

  let visibleCount = 0; // ✅ count rendered cards

  events.forEach(function (event, index) {

    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="eventCard">

        <!-- EVENT IMAGE -->
        <div class="eventImageWrap">
          <img src="${event.image}" class="eventImg">

          <!-- CLICKABLE OVERLAY -->
          <div class="imageOverlay" onclick="viewEvent(${index})">
            <span>View Details</span>
          </div>
        </div>

        <!-- EVENT CONTENT -->
        <div class="eventInfo">
          <h5 class="eventTitle">${event.title}</h5>
          <p class="eventDate">${event.date}</p>
          <p class="eventPrice">₹ ${event.price}</p>
          <p class="eventCategory">${event.category}</p>

          <!-- ACTION BUTTONS -->
          <div class="eventActions">
            <button onclick="viewEvent(${index})">View</button>
            <button onclick="editEvent(${index})">Edit</button>
            <button onclick="buyEvent(${index})">Buy</button>
            <button onclick="deleteEvent(${index})">Delete</button>
          </div>
        </div>

      </div>
    `;

    eventsContainer.appendChild(col);
    visibleCount++; // increment
  });

  /* EMPTY STATE HANDLING */
  const emptyState = document.getElementById("emptyState");

  if (visibleCount === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }
}



/*********************************************************
 VIEW EVENT DETAILS
**********************************************************/
function viewEvent(index) {

  const event = events[index];

  document.getElementById("viewEventTitle").innerText = event.title;
  document.getElementById("viewEventDate").innerText = event.date;
  document.getElementById("viewEventPrice").innerText = "₹ " + event.price;
  document.getElementById("viewEventCategory").innerText = event.category;
  document.getElementById("viewEventDescription").innerText = event.description;
  document.getElementById("viewEventImage").src = event.image;

  document.getElementById("viewEventModal").style.display = "block";
  document.getElementById("viewEventOverlay").style.display = "block";

  setTimeout(() => {
    document.getElementById("viewEventModal").classList.add("show");
  }, 10);
}



document.getElementById("closeViewEventBtn").onclick = function () {
  document.getElementById("viewEventModal").classList.remove("show");

  setTimeout(() => {
    document.getElementById("viewEventModal").style.display = "none";
    document.getElementById("viewEventOverlay").style.display = "none";
  }, 300);
};

/*********************************************************
 EDIT EVENT
**********************************************************/
function editEvent(index) {

    editIndex = index;
    const event = events[index];

    /* Fill form with existing data */
    document.getElementById("eventTitleInput").value = event.title;
    document.getElementById("eventDateInput").value = event.date;
    document.getElementById("eventPriceInput").value = event.price;
    document.getElementById("eventCategoryInput").value = event.category;
    document.getElementById("eventDescriptionInput").value = event.description;


    eventImagePreview.src = event.image;
    eventImagePreview.style.display = "block";

    /* Open modal */
    eventModal.style.display = "block";
    eventModalOverlay.style.display = "block";

    setTimeout(function () {
        eventModal.classList.add("show");
    }, 10);
}

/*********************************************************
 HERO SLIDING BAR
**********************************************************/

const heroCarousel = document.querySelector('#heroSlider');
new bootstrap.Carousel(heroCarousel, {
    interval: 4000,
    ride: 'carousel',
    pause: false
});


/*********************************************************
 DELETE EVENT
**********************************************************/
function deleteEvent(index) {

    if (confirm("Delete this event?")) {
        events.splice(index, 1);
        localStorage.setItem("events", JSON.stringify(events));
        renderEvents();
    }
}

/*********************************************************
 BUY EVENT (STORE TICKET)
**********************************************************/
function buyEvent(index) {

    localStorage.setItem(
        "selectedTicket",
        JSON.stringify(events[index])
    );

    window.location.href = "findmytickets.html";
}

/*********************************************************
 CLEAR FORM FIELDS
**********************************************************/
function clearForm() {

    document.getElementById("eventTitleInput").value = "";
    document.getElementById("eventDateInput").value = "";
    document.getElementById("eventPriceInput").value = "";
    document.getElementById("eventDescriptionInput").value = "";
    document.getElementById("eventImageInput").value = "";

    eventImagePreview.src = "";
    eventImagePreview.style.display = "none";
}

/*********************************************************
 LOAD EVENTS ON PAGE LOAD
**********************************************************/
renderEvents();


/*************************************
 CATEGORY FILTER (DROPDOWN)
*************************************/
const categoryFilter = document.getElementById("categoryFilter");

categoryFilter.addEventListener("change", function () {
    filterEvents();
});

function filterEvents() {
    const selectedCategory = categoryFilter.value;

    eventsContainer.innerHTML = "";

    events.forEach(function (event, index) {

        if (selectedCategory === "All" || event.category === selectedCategory) {

            const col = document.createElement("div");
            col.className = "col-12 col-md-6 col-lg-4";
            col.innerHTML = `
        <div class="eventCard">
          <img src="${event.image}" class="eventImg">
          <div class="eventInfo">
            <h5 class="eventTitle">${event.title}</h5>
            <p class="eventDate">${event.date}</p>
            <p class="eventPrice">₹ ${event.price}</p>
            <p>${event.category}</p>

            <button class="btn btn-sm btn-primary" onclick="viewEvent(${index})">View</button>
            <button class="btn btn-sm btn-warning" onclick="editEvent(${index})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteEvent(${index})">Delete</button>
          </div>
        </div>
      `;

            eventsContainer.appendChild(col);
        }
    });


    const emptyState = document.getElementById("emptyState");

if (eventsContainer.children.length === 0) {
  emptyState.style.display = "block";
} else {
  emptyState.style.display = "none";
}

}

/*************************************
 CATEGORY ICON CLICK FILTER
*************************************/
document.querySelectorAll(".categoryItem").forEach(function (item) {
    item.addEventListener("click", function () {
        const selected = this.getAttribute("data-category");
        categoryFilter.value = selected;
        filterEvents();
    });
});
