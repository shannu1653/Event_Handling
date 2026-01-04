/*********************************************************
 GLOBAL VARIABLES
**********************************************************/

/* Get events from localStorage or create empty array */
let events = JSON.parse(localStorage.getItem("events")) || [];

/* Used to track edit mode */
let editIndex = null;

/* Store image as Base64 */
let selectedImage = "";

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
 IMAGE UPLOAD + PREVIEW (BASE64)
**********************************************************/
document.getElementById("eventImageInput").addEventListener("change", function () {

    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
        selectedImage = reader.result;

        /* Show preview image */
        eventImagePreview.src = selectedImage;
        eventImagePreview.style.display = "block";
    };

    reader.readAsDataURL(file);
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
    if (!title || !date || !price || !category || !description || !selectedImage) {
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
        image: selectedImage
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

/*********************************************************
 RENDER EVENTS ON PAGE
**********************************************************/
function renderEvents() {
  eventsContainer.innerHTML = "";

  events.forEach(function (event, index) {

    // ✅ Bootstrap grid (DO NOT CHANGE)
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="eventCard">

        <!-- EVENT IMAGE -->
        <div class="eventImageWrap">
          <img src="${event.image}" class="eventImg" alt="event image">
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
  });
}


/*********************************************************
 VIEW EVENT DETAILS
**********************************************************/
function viewEvent(index) {
    alert(
        events[index].title + "\n\n" +
        events[index].description
    );
}

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

    selectedImage = event.image;
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

    selectedImage = "";
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
      col.className = "col-md-4";

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
