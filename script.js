/* ===========================================================
   script.js — Premium Eventbrite Clone (FULL WORKING VERSION)
   =========================================================== */

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
   LOCATION DROPDOWN
------------------------- */
locationBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    locationDropdown.style.display =
        locationDropdown.style.display === 'block' ? 'none' : 'block';
});
document.addEventListener('click', () => locationDropdown.style.display = 'none');

qsa('#locationDropdown .locItem').forEach(item => {
    item.addEventListener('click', () => {
        const value = item.dataset.value;
        const action = item.dataset.action;

        if (action === "useLocation") {
            getUserLocation();
        } else if (action === "online") {
            locationBtn.innerText = "Online events";
        } else if (value) {
            locationBtn.innerText = value;
        }

        locationDropdown.style.display = 'none';
    });
});




 if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
  }

  function logout() {
  localStorage.clear();        // 👈 HERE
  window.location.href = "login.html";
}

/* -------------------------
   GEOLOCATION
------------------------- */
function getUserLocation() {
    if (!navigator.geolocation) return alert("Geolocation not supported.");

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );
            const data = await res.json();

            locationBtn.innerText =
                data.address.city ||
                data.address.state ||
                "Your Location";

        } catch {
            alert("Unable to detect city.");
        }
    });
}

/* -------------------------
   MODALS
------------------------- */
let editingEventId = null;
let currentImageData = '';

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
    currentImageData = "";
}

/* -------------------------
   IMAGE PREVIEW
------------------------- */
eventImageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageData = e.target.result;
        eventImagePreview.src = currentImageData;
        eventImagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
});

/* -------------------------
   SAVE EVENT
------------------------- */
saveEventBtn.addEventListener('click', () => {
    const events = JSON.parse(localStorage.getItem('events') || '[]');

    const data = {
        title: eventTitleInput.value.trim(),
        date: eventDateInput.value.trim(),
        price: eventPriceInput.value.trim(),
        category: eventCategoryInput.value,
        description: eventDescriptionInput.value.trim(),
        image: currentImageData
    };

    if (editingEventId !== null) {
        events[editingEventId] = data;
    } else {
        events.push(data);
    }

    localStorage.setItem('events', JSON.stringify(events));

    hideModal(eventModal, eventModalOverlay);
    loadEvents();
});

/* -------------------------
   LOAD DYNAMIC EVENTS
------------------------- */
function loadEvents() {
    const events = JSON.parse(localStorage.getItem("events") || "[]");

    qsa(".dynamicEventCard").forEach(el => el.remove());

    events.forEach((ev, idx) => {
        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-md-4 col-lg-3 dynamicEventCard";

        col.innerHTML = `
            <div class="eventCard" data-category="${ev.category}">
                <img src="${ev.image || 'https://via.placeholder.com/600x400'}" class="eventImg">

                <div class="eventInfo">
                    <h5 class="eventTitle">${ev.title}</h5>
                    <p class="eventDate">${ev.date}</p>
                    <p class="eventPrice">${ev.price}</p>

                    <div class="d-flex gap-2 p-2">
                        <button class="btn btn-primary btn-sm">View</button>
                        <button class="btn btn-warning btn-sm">Edit</button>
                        <button class="btn btn-danger btn-sm">Delete</button>
                        <button class="btn btn-success btn-sm">Buy</button>
                    </div>
                </div>
            </div>
        `;

        const buttons = col.querySelectorAll("button");
        buttons[0].addEventListener("click", () => viewEvent(idx));
        buttons[1].addEventListener("click", () => editEvent(idx));
        buttons[2].addEventListener("click", () => deleteEvent(idx));
        buttons[3].addEventListener("click", () => buyTicket(idx, "dynamic"));

        eventsContainer.appendChild(col);
    });

    filterEvents();
    setupStaticBuyButtons();
}

/* -------------------------
   BUY TICKET (static + dynamic)
------------------------- */
function buyTicket(index, type = "dynamic") {
    let cart = JSON.parse(localStorage.getItem("tickets") || "[]");
    let eventObj = {};

    if (type === "static") {
        const card = document.querySelectorAll(".eventCard")[index];
        eventObj = {
            title: card.querySelector(".eventTitle").innerText,
            date: card.querySelector(".eventDate").innerText,
            price: card.querySelector(".eventPrice").innerText,
            image: card.querySelector(".eventImg").src,
            ticketId: "TID-" + Date.now()
        };
    } else {
        const ev = JSON.parse(localStorage.getItem("events"))[index];
        eventObj = {
            title: ev.title,
            date: ev.date,
            price: ev.price,
            image: ev.image,
            ticketId: "TID-" + Date.now()
        };
    }

    cart.push(eventObj);
    localStorage.setItem("tickets", JSON.stringify(cart));

    alert("🎟 Ticket added to cart!");
}

window.buyTicket = buyTicket;

/* -------------------------
   STATIC BUY BUTTONS
------------------------- */
function setupStaticBuyButtons() {
    const staticCards = qsa(
        "#eventsContainer .eventCard:not(.dynamicEventCard)"
    );

    staticCards.forEach((card, idx) => {
        const btn = card.querySelector(".staticBuyBtn");
        if (!btn) return;

        btn.addEventListener("click", () => buyTicket(idx, "static"));
    });
}

/* -------------------------
   EDIT EVENT
------------------------- */
function editEvent(index) {
    const ev = JSON.parse(localStorage.getItem("events"))[index];

    editingEventId = index;

    eventTitleInput.value = ev.title;
    eventDateInput.value = ev.date;
    eventPriceInput.value = ev.price;
    eventCategoryInput.value = ev.category;
    eventDescriptionInput.value = ev.description;
    eventImagePreview.src = ev.image;
    eventImagePreview.style.display = ev.image ? "block" : "none";
    currentImageData = ev.image;

    eventModalTitle.innerText = "Edit Event";
    showModal(eventModal, eventModalOverlay);
}

window.editEvent = editEvent;

/* -------------------------
   DELETE EVENT
------------------------- */
function deleteEvent(index) {
    if (!confirm("Delete this event?")) return;

    const events = JSON.parse(localStorage.getItem("events"));
    events.splice(index, 1);
    localStorage.setItem("events", JSON.stringify(events));

    loadEvents();
}

window.deleteEvent = deleteEvent;

/* -------------------------
   VIEW EVENT
------------------------- */
function viewEvent(index) {
    const ev = JSON.parse(localStorage.getItem("events"))[index];

    viewEventTitle.innerText = ev.title;
    viewEventImage.src = ev.image;
    viewEventDate.innerText = "📅 " + ev.date;
    viewEventPrice.innerText = "💰 " + ev.price;
    viewEventCategory.innerText = "🏷 " + ev.category;
    viewEventDescription.innerText = ev.description;

    showModal(viewEventModal, viewEventOverlay);
}

window.viewEvent = viewEvent;

closeViewEventBtn.addEventListener("click", () => hideModal(viewEventModal, viewEventOverlay));
viewEventOverlay.addEventListener("click", () => hideModal(viewEventModal, viewEventOverlay));

/* -------------------------
   FILTERS
------------------------- */
categoryFilter.addEventListener("change", filterEvents);
searchFilter.addEventListener("input", filterEvents);
mainSearch.addEventListener("input", (e) => {
    searchFilter.value = e.target.value;
    filterEvents();
});

function filterEvents() {
    const cat = categoryFilter.value;
    const search = searchFilter.value.toLowerCase();

    qsa(".eventCard").forEach(card => {
        const title = card.querySelector(".eventTitle").innerText.toLowerCase();
        const cardCat = card.getAttribute("data-category");

        const catMatch = (cat === "All" || cat === cardCat);
        const searchMatch = title.includes(search);

        card.parentElement.style.display = (catMatch && searchMatch) ? "block" : "none";
    });
}

/* -------------------------
   NAVBAR SCROLL EFFECT
------------------------- */
window.addEventListener("scroll", () => {
    const nav = document.querySelector(".navbar");
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
});

/* -------------------------
   DARK MODE
------------------------- */
const themeToggle = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("darkMode");
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("darkMode");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("darkMode") ? "dark" : "light"
    );
});

/* INIT */
loadEvents();
setupStaticBuyButtons();


