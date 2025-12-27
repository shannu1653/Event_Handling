/* ===========================================================
   script.js — Premium Eventbrite Clone (FIXED + BACKEND)
=========================================================== */

/* -------------------------
   API CONFIG (FIXED)
------------------------- */
const API_BASE = "https://aiven-deploye.onrender.com/api2";
const MEDIA_BASE = "https://aiven-deploye.onrender.com/media/";

/* -------------------------
   DOM ELEMENTS
------------------------- */
const locationBtn = document.getElementById('locationBtn');
const locationDropdown = document.getElementById('locationDropdown');

const openCreateEvent = document.getElementById('openCreateEvent');
const eventModal = document.getElementById('eventModal');
const eventModalOverlay = document.getElementById('eventModalOverlay');
const closeEventBtn = document.getElementById('closeEventBtn');
const eventModalTitle = document.getElementById('eventModalTitle');

const eventTitleInput = document.getElementById('eventTitleInput');
const eventDateInput = document.getElementById('eventDateInput');
const eventPriceInput = document.getElementById('eventPriceInput');
const eventCategoryInput = document.getElementById('eventCategoryInput');
const eventDescriptionInput = document.getElementById('eventDescriptionInput');
const eventImageInput = document.getElementById('eventImageInput');
const eventImagePreview = document.getElementById('eventImagePreview');

const saveEventBtn = document.getElementById('saveEventBtn');

const viewEventModal = document.getElementById('viewEventModal');
const viewEventOverlay = document.getElementById('viewEventOverlay');
const closeViewEventBtn = document.getElementById('closeViewEventBtn');

const viewEventTitle = document.getElementById('viewEventTitle');
const viewEventImage = document.getElementById('viewEventImage');
const viewEventDate = document.getElementById('viewEventDate');
const viewEventPrice = document.getElementById('viewEventPrice');
const viewEventCategory = document.getElementById('viewEventCategory');
const viewEventDescription = document.getElementById('viewEventDescription');

const eventsContainer = document.getElementById('eventsContainer');
const categoryFilter = document.getElementById('categoryFilter');
const searchFilter = document.getElementById('searchFilter');
const mainSearch = document.getElementById('mainSearch');

/* helpers */
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

/* -------------------------
   AUTH
------------------------- */
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

/* -------------------------
   LOCATION DROPDOWN
------------------------- */
locationBtn.addEventListener('click', e => {
    e.stopPropagation();
    locationDropdown.style.display =
        locationDropdown.style.display === 'block' ? 'none' : 'block';
});
document.addEventListener('click', () => locationDropdown.style.display = 'none');

qsa('#locationDropdown .locItem').forEach(item => {
    item.addEventListener('click', () => {
        if (item.dataset.action === "useLocation") getUserLocation();
        else if (item.dataset.action === "online") locationBtn.innerText = "Online events";
        else locationBtn.innerText = item.dataset.value;
        locationDropdown.style.display = 'none';
    });
});







/* -------------------------
   GEOLOCATION
------------------------- */
function getUserLocation() {
    navigator.geolocation.getCurrentPosition(async pos => {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
        );
        const data = await res.json();
        locationBtn.innerText = data.address.city || "Your Location";
    });
}

/* -------------------------
   MODALSs
------------------------- */
let editingEventId = null;

function showModal(modal, overlay) {
    overlay.style.display = 'block';
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
}
function hideModal(modal, overlay) {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    }, 250);
}

openCreateEvent.addEventListener('click', () => {
    editingEventId = null;
    eventModalTitle.innerText = "Create Event";
    resetForm();
    showModal(eventModal, eventModalOverlay);
});
closeEventBtn.addEventListener('click', () => hideModal(eventModal, eventModalOverlay));
eventModalOverlay.addEventListener('click', () => hideModal(eventModal, eventModalOverlay));

function resetForm() {
    eventTitleInput.value = "";
    eventDateInput.value = "";
    eventPriceInput.value = "";
    eventCategoryInput.value = "Holidays";
    eventDescriptionInput.value = "";
    eventImageInput.value = "";
    eventImagePreview.style.display = "none";
}

/* -------------------------
   IMAGE PREVIEW
------------------------- */
eventImageInput.addEventListener("change", function () {
    const reader = new FileReader();
    reader.onload = e => {
        eventImagePreview.src = e.target.result;
        eventImagePreview.style.display = "block";
    };
    reader.readAsDataURL(this.files[0]);
});

/* -------------------------
   SAVE EVENT
------------------------- */
saveEventBtn.addEventListener('click', async () => {

    if (!eventTitleInput.value || !eventDateInput.value) {
        alert("Title and Date are required");
        return;
    }

    const formData = new FormData();
    formData.append("title", eventTitleInput.value);
    formData.append("date", eventDateInput.value);
    formData.append("price", eventPriceInput.value);
    formData.append("category", eventCategoryInput.value);
    formData.append("description", eventDescriptionInput.value);

    if (eventImageInput.files.length > 0) {
        formData.append("image", eventImageInput.files[0]);
    }

    const url = editingEventId === null
        ? `${API_BASE}/create-event/`
        : `${API_BASE}/update-event/${editingEventId}/`;

    await fetch(url, { method: "POST", body: formData });
    hideModal(eventModal, eventModalOverlay);
    loadEvents();
});

/* -------------------------
   LOAD EVENTS (FIXED IMAGE)
------------------------- */
async function loadEvents() {

    qsa(".dynamicEventCard").forEach(el => el.remove());

    const res = await fetch(`${API_BASE}/events/`);
    const events = await res.json();

    events.forEach((ev, idx) => {

        const imageUrl = ev.image
            ? MEDIA_BASE + ev.image
            : "https://via.placeholder.com/300x180?text=No+Image";

        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-md-4 col-lg-3 dynamicEventCard";

        col.innerHTML = `
            <div class="eventCard" data-category="${ev.category}">
                <img src="${imageUrl}" class="eventImg">
                <div class="eventInfo">
                    <h5 class="eventTitle">${ev.title}</h5>
                    <p class="eventDate">${ev.date}</p>
                    <p class="eventPrice">${ev.price}</p>
                    <div class="d-flex gap-2 p-2">
                        <button class="btn btn-primary btn-sm" onclick="viewEvent(${idx})">View</button>
                        <button class="btn btn-warning btn-sm" onclick="editEvent(${idx})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteEvent(${ev.id})">Delete</button>
                        <button class="btn btn-success btn-sm" onclick="buyTicket(${idx})">Buy</button>
                    </div>
                </div>
            </div>`;
        eventsContainer.appendChild(col);
    });

    window.backendEvents = events;
    filterEvents();
}

/* -------------------------
   VIEW EVENT
------------------------- */
function viewEvent(index) {
    const ev = window.backendEvents[index];
    viewEventTitle.innerText = ev.title;
    viewEventImage.src = ev.image ? MEDIA_BASE + ev.image : "";
    viewEventDate.innerText = ev.date;
    viewEventPrice.innerText = ev.price;
    viewEventCategory.innerText = ev.category;
    viewEventDescription.innerText = ev.description;
    showModal(viewEventModal, viewEventOverlay);
}

/* -------------------------
   EDIT EVENT
------------------------- */
function editEvent(index) {
    const ev = window.backendEvents[index];
    editingEventId = ev.id;

    eventTitleInput.value = ev.title;
    eventDateInput.value = ev.date;
    eventPriceInput.value = ev.price;
    eventCategoryInput.value = ev.category;
    eventDescriptionInput.value = ev.description;

    if (ev.image) {
        eventImagePreview.src = MEDIA_BASE + ev.image;
        eventImagePreview.style.display = "block";
    }

    eventModalTitle.innerText = "Edit Event";
    showModal(eventModal, eventModalOverlay);
}

/* -------------------------
   DELETE EVENT
------------------------- */
async function deleteEvent(id) {
    if (!confirm("Delete this event?")) return;
    await fetch(`${API_BASE}/delete-event/${id}/`);
    loadEvents();
}

/* -------------------------
   BUY TICKET
------------------------- */
function buyTicket(index) {
    const ev = window.backendEvents[index];
    const cart = JSON.parse(localStorage.getItem("tickets") || "[]");

    cart.push({
        title: ev.title,
        date: ev.date,
        price: Number(ev.price),
        image: ev.image ? MEDIA_BASE + ev.image : "",
        ticketId: "TID-" + Date.now()
    });

    localStorage.setItem("tickets", JSON.stringify(cart));
    alert("Ticket added!");
}

/* -------------------------
   FILTERS
------------------------- */
categoryFilter.addEventListener("change", filterEvents);
searchFilter.addEventListener("input", filterEvents);
mainSearch.addEventListener("input", e => {
    searchFilter.value = e.target.value;
    filterEvents();
});
function filterEvents() {
    const cat = categoryFilter.value;
    const search = searchFilter.value.toLowerCase();
    qsa(".eventCard").forEach(card => {
        const okCat = cat === "All" || card.dataset.category === cat;
        const okSearch = card.querySelector(".eventTitle").innerText.toLowerCase().includes(search);
        card.parentElement.style.display = okCat && okSearch ? "block" : "none";
    });
}

/* -------------------------
   INIT
------------------------- */
loadEvents();
