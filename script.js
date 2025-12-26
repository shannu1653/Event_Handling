/* =================================================
   BASE URLS (DEPLOYED) 
   ================================================= */
const API_BASE = "https://aiven-deploye.onrender.com/api2";
const MEDIA_BASE = "https://aiven-deploye.onrender.com";

/* =================================================
   GET HTML ELEMENTS
   ================================================= */
const eventsContainer = document.getElementById("eventsContainer");
const eventModal = document.getElementById("eventModal");
const overlay = document.getElementById("overlay");
const eventForm = document.getElementById("eventForm");
const imagePreview = document.getElementById("preview");
const loader = document.getElementById("loader");

let editingEventId = null;   // track edit mode
let allEvents = [];         // store events list (important)


viewEventImage.src =
  ev.image && ev.image.startsWith('/media')
    ? MEDIA_BASE + ev.image
    : 'https://via.placeholder.com/600x350?text=No+Image';

    eventImagePreview.src =
  ev.image && ev.image.startsWith('/media')
    ? MEDIA_BASE + ev.image
    : 'https://via.placeholder.com/400x250?text=No+Image';

 
/* =================================================
   LOADER FUNCTIONS
   ================================================= */
function showLoader() {
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}

/* =================================================
   OPEN & CLOSE MODAL
   ================================================= */
openCreateEvent.onclick = () => {
  eventModal.style.display = "block";
  overlay.style.display = "block";
};

closeModal.onclick = closeModalBox;
overlay.onclick = closeModalBox;

function closeModalBox() {
  eventModal.style.display = "none";
  overlay.style.display = "none";
  eventForm.reset();
  imagePreview.style.display = "none";
  editingEventId = null;
}

/* =================================================
   IMAGE PREVIEW (BEFORE UPLOAD)
   ================================================= */
image.onchange = () => {
  imagePreview.src = URL.createObjectURL(image.files[0]);
  imagePreview.style.display = "block";
};

/* =================================================
   LOAD EVENTS (GET ALL EVENTS)
   ================================================= */
async function loadEvents() {
  showLoader();

  try {
    const response = await fetch(`${API_BASE}/events/`);
    allEvents = await response.json();

    eventsContainer.innerHTML = "";

    allEvents.forEach(event => {

      // FIX IMAGE URL
      const imageUrl = event.image
        ? (event.image.startsWith("http")
            ? event.image
            : MEDIA_BASE + event.image)
        : "https://via.placeholder.com/400x200?text=No+Image";

      eventsContainer.innerHTML += `
        <div class="card">
          <img src="${imageUrl}" alt="Event Image">
          <div class="cardbody">
            <h4>${event.title}</h4>
            <p>${event.place} | ₹${event.price}</p>
            <button onclick="editEvent(${event.id})">Edit</button>
            <button onclick="deleteEvent(${event.id})">Delete</button>
          </div>
        </div>
      `;
    });

  } catch (error) {
    alert("Failed to load events");
  }

  hideLoader();
}

/* =================================================
   CREATE OR UPDATE EVENT
   ================================================= */
eventForm.onsubmit = async (e) => {
  e.preventDefault();
  showLoader();

  const formData = new FormData(eventForm);

  try {
    if (editingEventId === null) {
      // CREATE EVENT
      await fetch(`${API_BASE}/create-event/`, {
        method: "POST",
        body: formData
      });
    } else {
      // UPDATE EVENT
      await fetch(`${API_BASE}/update-event/${editingEventId}/`, {
        method: "PUT",
        body: formData
      });
    }

    closeModalBox();
    loadEvents();

  } catch (error) {
    alert("Failed to save event");
    hideLoader();
  }
};

/* =================================================
   EDIT EVENT (NO EXTRA API CALL)
   ================================================= */
function editEvent(id) {

  const event = allEvents.find(e => e.id === id);

  if (!event) {
    alert("Event not found");
    return;
  }

  // Fill form
  title.value = event.title;
  date.value = event.date;
  price.value = event.price;
  place.value = event.place;
  description.value = event.description;

  // Show existing image
  if (event.image) {
    imagePreview.src = event.image.startsWith("http")
      ? event.image
      : MEDIA_BASE + event.image;
    imagePreview.style.display = "block";
  }

  editingEventId = id;

  eventModal.style.display = "block";
  overlay.style.display = "block";
}

/* =================================================
   DELETE EVENT
   ================================================= */
async function deleteEvent(id) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  showLoader();

  try {
    await fetch(`${API_BASE}/delete-event/${id}/`, {
      method: "DELETE"
    });

    loadEvents();

  } catch (error) {
    alert("Failed to delete event");
    hideLoader();
  }
}

/* =================================================
   INITIAL LOAD
   ================================================= */
loadEvents();
