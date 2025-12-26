/* =================================================
   BASE URLS (DEPLOYED)
   ================================================= */
const API_BASE = "https://aiven-deploye.onrender.com/api2";
const MEDIA_BASE = "https://aiven-deploye.onrender.com/media/";

/* =================================================
   DOM ELEMENTS
   ================================================= */
const eventsContainer = document.getElementById("eventsContainer");
const eventModal = document.getElementById("eventModal");
const overlay = document.getElementById("overlay");
const closeModal = document.getElementById("closeModal");
const eventForm = document.getElementById("eventForm");
const imagePreview = document.getElementById("imagePreview");
const loader = document.getElementById("loader");

let allEvents = [];
let editingEventId = null;

/* =================================================
   LOADER
   ================================================= */
function showLoader() {
  loader.style.display = "flex";
}
function hideLoader() {
  loader.style.display = "none";
}

/* =================================================
   MODAL CONTROLS
   ================================================= */
function closeModalBox() {
  eventModal.style.display = "none";
  overlay.style.display = "none";
  eventForm.reset();
  imagePreview.style.display = "none";
  editingEventId = null;
}

closeModal.onclick = closeModalBox;
overlay.onclick = closeModalBox;

/* =================================================
   IMAGE PREVIEW (BEFORE UPLOAD)
   ================================================= */
image.onchange = () => {
  imagePreview.src = URL.createObjectURL(image.files[0]);
  imagePreview.style.display = "block";
};

/* =================================================
   LOAD EVENTS (FIXED IMAGE LOGIC)
   ================================================= */
async function loadEvents() {
  showLoader();

  try {
    const res = await fetch(`${API_BASE}/events/`);
    allEvents = await res.json();

    eventsContainer.innerHTML = "";

    allEvents.forEach(ev => {
      const imageUrl = ev.image
        ? MEDIA_BASE + ev.image   // ✅ CORRECT FIX
        : "https://via.placeholder.com/400x250?text=No+Image";

      eventsContainer.innerHTML += `
        <div class="eventCard">
          <img src="${imageUrl}" class="eventImg" alt="Event Image">
          <div class="eventInfo">
            <h5>${ev.title}</h5>
            <p>${ev.date}</p>
            <p>₹${ev.price}</p>
            <div class="actions">
              <button onclick="editEvent(${ev.id})">Edit</button>
              <button onclick="deleteEvent(${ev.id})">Delete</button>
            </div>
          </div>
        </div>
      `;
    });

  } catch (err) {
    alert("❌ Failed to load events");
  }

  hideLoader();
}

/* =================================================
   CREATE / UPDATE EVENT
   ================================================= */
eventForm.onsubmit = async (e) => {
  e.preventDefault();
  showLoader();

  const formData = new FormData(eventForm);

  try {
    if (editingEventId === null) {
      await fetch(`${API_BASE}/create-event/`, {
        method: "POST",
        body: formData
      });
    } else {
      await fetch(`${API_BASE}/update-event/${editingEventId}/`, {
        method: "PUT",
        body: formData
      });
    }

    closeModalBox();
    loadEvents();

  } catch (err) {
    alert("❌ Failed to save event");
  }

  hideLoader();
};

/* =================================================
   EDIT EVENT
   ================================================= */
function editEvent(id) {
  const ev = allEvents.find(e => e.id === id);
  if (!ev) return;

  title.value = ev.title;
  date.value = ev.date;
  price.value = ev.price;
  description.value = ev.description;

  if (ev.image) {
    imagePreview.src = MEDIA_BASE + ev.image;
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
  if (!confirm("Delete this event?")) return;

  showLoader();
  try {
    await fetch(`${API_BASE}/delete-event/${id}/`, {
      method: "DELETE"
    });
    loadEvents();
  } catch {
    alert("❌ Failed to delete event");
  }
  hideLoader();
}

/* =================================================
   INIT
   ================================================= */
loadEvents();
