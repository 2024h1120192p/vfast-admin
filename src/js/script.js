async function getDashboardStats() {
  return await apiRequest('/booking/booking-statistics', {}, true);
}

async function getTodaysBookings() {
  return await apiRequest('/booking/booking-dashboard', {}, true);
}

async function getBookingsByDate() {
  return await apiRequest(`/booking/booking-requests`, {}, true);
}

async function getAvailability(start, end) {
  return await apiRequest(`/booking/availability?start=${start}&end=${end}`, {}, true);
}

async function getRooms() {
  return await apiRequest('/rooms/all-status', {}, true);
}

async function requestBooking(bookingData) {
  return await apiRequest('/booking/booking-request', {
      method: 'POST',
      body: bookingData
  }, true);
}


async function confirmBooking(bookingId, status, rooms, reason, statusReason) {
  return await apiRequest('/booking/confirm-booking', {
      method: 'POST',
      body: { 
        "booking_id" : bookingId, 
        "status" : status, 
        "rooms" : rooms, 
        "reason" : reason, 
        "status_reason": statusReason 
      }
  }, true);
}


async function bookingAction(bookingId, action) {
  // console.log("Booking action", bookingId, action);
  return await apiRequest('/booking/booking-action', {
      method: 'POST',
      body: { booking_id: bookingId, action: action }
  }, true);
}


// Function to load Dashboard Statistics
async function loadDashboardStats() {
  try {
    const stats = (await getDashboardStats()).data;
    
    document.getElementById("bookingsToday").textContent = stats.today_bookings;
    document.getElementById("totalBookings").textContent = stats.total_bookings;
    document.getElementById("arrivalsPending").textContent = stats.pending_checkins;
    document.getElementById("arrivalsCompleted").textContent = stats.total_checkins;
    document.getElementById("departuresPending").textContent = stats.pending_checkouts;
    document.getElementById("departuresCompleted").textContent = stats.total_checkouts;
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
  }
}

// Function to load Today's Bookings
let bookingsData = [];
let allBookingsData = [];
let allRoomStatus = [];

const roomTypes = [
  "Standard",
  "Deluxe",
  "Executive"
];

const refreshTodaysBookingsData = async () => bookingsData = (await getTodaysBookings()).data.bookings;
const refreshAllBookingsData = async () => allBookingsData = (await getBookingsByDate()).data.requests;
const refeshAllRoomStatus = async () => allRoomStatus = (await getRooms()).data.rooms;
const formatDate = (mydate) => `${mydate.getFullYear()}-${String(mydate.getMonth() + 1).padStart(2, '0')}-${String(mydate.getDate()).padStart(2, '0')}`

const hide = (btn) => {btn && (btn.hidden = true)};
const unhide = (btn) => {btn && (btn.hidden = false)};

// Function to get available rooms by type
async function getAvailableRoomsByType(type) {
  return allRoomStatus.filter(room => room.room_type === type && room.status === 'Available');
}


// Function to load Today's Bookings on the dashboard
async function loadTodaysBookings() {
  try {
    await refreshTodaysBookingsData();
    await refeshAllRoomStatus();

    const bookingsTableBody = document.getElementById("bookingsTableBody");
    const todayBookingsCount = document.getElementById("todayBookingsCount");
    
    bookingsData = bookingsData.filter(booking => ["Reserved", "CheckedIn"].includes(booking.booking_status));

    bookingsTableBody.innerHTML = "";
    todayBookingsCount.textContent = bookingsData.length;
    
    bookingsData.forEach(booking => {
      const row = `<tr class="booking-request" data-reservation="${booking._id}">
          <td>${booking._id}</td>
          <td>${booking.first_name} ${booking.last_name}</td>
          <td>${booking.check_in}</td>
          <td>${booking.check_out}</td>
          <td><span class="badge ${getStatusBadgeClass(booking.booking_status)}">${booking.booking_status}</span></td>
          <td>${booking.phone_number}</td>
          <td>
            <button class="btn btn-sm btn-secondary view-btn">View</button>
            <button class="btn btn-sm btn-outline-success checkin-btn">Check-In</button>
            <button class="btn btn-sm btn-outline-danger checkout-btn">Check-Out</button>
          </td>
        </tr>`;
      
        bookingsTableBody.insertAdjacentHTML("beforeend", row);
    });
    
    attachViewEventListeners(bookingsData);
    
  } catch (error) {
    console.error("Error loading today's bookings:", error);
  }
}


// Function to load Request Details
async function loadRequestDetails() {
  try {
    await refreshAllBookingsData();
    await refeshAllRoomStatus();

    allBookingsData.sort((a, b) => b.check_in.localeCompare(a.check_in));

    const requestTableBody = document.getElementById("requestTableBody");
    requestTableBody.innerHTML = "";
    
    allBookingsData.forEach((booking, index) => {
      const row = `<tr class="booking-request" data-reservation="${booking._id}">
          <td class="text-center">${index+1}</td>
          <td>${booking.first_name} ${booking.last_name}</td>
          <td>${booking.check_in}</td>
          <td>${booking.check_out}</td>
          <td><span class="badge ${getStatusBadgeClass(booking.booking_status)}">${booking.booking_status}</span></td>
          <td>
            <button class="btn btn-sm btn-primary view-btn">View</button>
            <button class="btn btn-sm btn-success confirm-btn" title="Accept Booking"> <i class="fa-solid fa-check"></i> </button>
            <button class="btn btn-sm btn-danger cancel-btn" title="Cancel Booking"><i class="fa-solid fa-trash"></i></button>
            <button class="btn btn-sm btn-danger reject-btn" title="Reject Booking"><i class="fa-solid fa-xmark"></i></button>
          </td>
        </tr>`;
      requestTableBody.insertAdjacentHTML("beforeend", row);
    });
    attachViewEventListeners(allBookingsData);
  } catch (error) {
    console.error("Error loading request details:", error);
  }
}

// Function to populate the modal with booking details and room selection
async function populateModal(booking) {
  document.getElementById("modalReservationNo").textContent = booking._id;
  document.getElementById("modalName").textContent = booking.first_name + " " + booking.last_name;
  document.getElementById("modalGender").textContent = booking.gender;
  document.getElementById("modalCheckIn").textContent = booking.check_in;
  document.getElementById("modalCheckOut").textContent = booking.check_out;
  document.getElementById("modalStatus").innerHTML = `<span class="badge ${getStatusBadgeClass(booking.booking_status)}">${booking.booking_status}</span>`;
  document.getElementById("modalPhone").textContent = booking.phone_number;
  document.getElementById("modalReason").textContent = `${booking.reason || "N/A"}`;
  document.getElementById("modelRoomType").textContent = `${booking.booked_room_type || "N/A"}`;

  // Populate room selection dropdowns
  const roomCountSelect = document.getElementById("modalRoomCountSelect");
  const roomNumbersContainer = document.getElementById("modalRoomNumbersContainer");
  const save_btn = document.getElementById("saveBookingChanges");

  const disableControl = ["Reserved", "CheckedIn", "Cancelled", "Rejected"].includes(booking.booking_status);

  roomCountSelect.innerHTML = ""; // Clear previous options
  roomNumbersContainer.innerHTML = ""; // Clear previous options

  roomCountSelect.disabled = disableControl;
  save_btn.disabled = disableControl;

  for (let i = 0; i <= 3; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    roomCountSelect.appendChild(option);
  }

  // Event listener to update room numbers when room count changes
  roomCountSelect.addEventListener("change", async () => {
    const availableRooms = await getAvailableRoomsByType(booking.booked_room_type);
    const roomCount = roomCountSelect.value;
    const selectedRoomIds = booking.rooms.map(room => room.id);
    
    roomNumbersContainer.innerHTML = ""; // Clear previous options
    
    for (let i = 0; i < roomCount; i++) {
      const select = document.createElement("select");
      select.disabled = disableControl;
      select.classList.add("form-select", "mb-2");

      availableRooms.forEach(room => {
        const option = document.createElement("option");
        option.value = room._id;
        option.textContent = room.room_number;

        const selectedRoomIndex = selectedRoomIds.indexOf(room._id)
        if (selectedRoomIndex>-1) {
          option.selected = true;
          selectedRoomIds.splice(selectedRoomIndex, 1);
        }
        select.appendChild(option);
        option.disabled = disableControl;
      });

      select.addEventListener("change", () => {
        const selectedValues = Array.from(roomNumbersContainer.querySelectorAll("select")).map(select => select.value);
        roomNumbersContainer.querySelectorAll("select").forEach(select => {
          Array.from(select.options).forEach(option => {
            option.disabled = (selectedValues.includes(option.value) && !option.selected) || disableControl;
          });
        });
      });

      roomNumbersContainer.appendChild(select);
      select.dispatchEvent(new Event("change"));
    }
  });

  roomCountSelect.value = booking.rooms.length;
  roomCountSelect.dispatchEvent(new Event("change"));
  
  // Save button event listener
  save_btn.addEventListener("click", async () => {
    const roomIDs = Array.from(roomNumbersContainer.querySelectorAll("select")).map((select, index) => {
      return { 
        "id": select.value, 
        "room_number": select.options[index].text, 
        "type":booking.booked_room_type
      }
    });
    // console.log(booking._id, booking.booking_status, roomIDs, "accept", "Approved");
    await confirmBooking(booking._id, "save", roomIDs, "save", "Save Changes");
    await refreshAllBookingsData();
    await refeshAllRoomStatus();
    loadRequestDetails();
    bookingModal.hide();
  });

  // Show the modal
  const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
  bookingModal.show();
}


// Function to load Availability Data
async function loadAvailabilityData() {
  let from_date = document.getElementById("startDate").value;
  let to_date = document.getElementById("endDate").value;
  console.log(from_date, to_date);
  try {
    from_date = to_date? new Date(from_date) : new Date(Date.now());
    to_date = to_date? new Date(to_date): from_date;


    const roomAvailability = (await getAvailability( formatDate(from_date), formatDate(to_date) )).data[0].roomAvailability;
    roomAvailability.sort((a, b) => a.roomType.localeCompare(b.roomType));

    const availabilityTableBody = document.getElementById("availabilityTableBody");
    availabilityTableBody.innerHTML = "";
    
    roomAvailability.forEach(item => {
      const row = `<tr>
          <td>${item.roomType}</td>
          <td>${item.availableRooms}</td>
        </tr>`;
      availabilityTableBody.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error loading availability data:", error);
  }
}


// Function to load Rooms Data
async function loadRoomsData() {
  await refeshAllRoomStatus();
  
  try {
    const rooms = allRoomStatus;
    const roomTypes = {};

    const roomsGrid = document.getElementById("roomsGrid");
    roomsGrid.innerHTML = "";

    rooms.forEach(room => {
      if (!roomTypes[room.room_type]) {
        roomTypes[room.room_type] = [];
      }
      roomTypes[room.room_type].push(room);
    });

    for (const [type, rooms] of Object.entries(roomTypes)) {
      const typeHeader = document.createElement('h4');
      typeHeader.textContent = type;
      roomsGrid.appendChild(typeHeader);

      const typeGrid = document.createElement('div');
      typeGrid.classList.add('type-grid');
      roomsGrid.appendChild(typeGrid);

      rooms.forEach(room => {
        const roomDiv = document.createElement('div');
        roomDiv.classList.add('room');
        roomDiv.textContent = room.room_number;
        if (room.status === 'Available') {
          roomDiv.classList.add('bg-success');
        } else if (room.status === 'Occupied') {
          roomDiv.classList.add('bg-secondary');
        } else if (room.status === 'Maintenance') {
          roomDiv.classList.add('bg-warning');
        }
        typeGrid.appendChild(roomDiv);
      });
    }
  } catch (error) {
    console.error("Error loading rooms data:", error);
  }
}


// Utility function to get the badge class based on status
function getStatusBadgeClass(status) {
  switch (status) {
    case "Reserved":
      return "bg-secondary-subtle text-dark";
    case "Checked-In":
      return "bg-success";
    case "Checked-Out":
      return "bg-secondary";
    case "Pending":
      return "bg-warning";
    case "Available":
      return "bg-success";
    case "Occupied":
      return "bg-danger";
    case "Maintenance":
      return "bg-warning text-dark";
    default:
      return "bg-secondary";
  }
}


// Function to handle view switching
function showView(viewId) {
  document.querySelectorAll('.view').forEach(view => view.classList.add('d-none'));
  document.getElementById(viewId).classList.remove('d-none');
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  event.currentTarget.classList.add('active');

  // Load data based on the view
  switch (viewId) {
    case 'dashboard':
      loadDashboardStats();
      loadTodaysBookings();
      break;
    case 'request':
      loadRequestDetails();
      break;
    case 'availability':
      loadAvailabilityData();
      break;
    case 'rooms':
      loadRoomsData();
      break;
    default:
      break;
  }
}


// Function to attach event listeners to buttons
function attachViewEventListeners(data) {
  const requestRows = document.querySelectorAll('.booking-request');
  requestRows.forEach(row => {
    const reservation_id = row.getAttribute('data-reservation');
    const booking = findBookingByReservationID(data, reservation_id);
    const booking_status = booking.booking_status;

    const view_btn = row.querySelector('.view-btn');
    const checkin_btn = row.querySelector('.checkin-btn');
    const checkout_btn = row.querySelector('.checkout-btn');
    
    const confirm_btn = row.querySelector('.confirm-btn');
    const reject_btn = row.querySelector('.reject-btn');
    const cancel_btn = row.querySelector('.cancel-btn');

    switch(booking_status){
      case 'CheckedIn':
        hide(checkin_btn);
        unhide(checkout_btn);

        hide(reject_btn);
        hide(confirm_btn)
        break;
      case 'Reserved':
        hide(checkout_btn);
        unhide(checkin_btn);
        
        hide(reject_btn);
        hide(confirm_btn);
        break;
      case 'Pending':
        hide(cancel_btn)

      default:
        console.log("Default Case")
    }

    view_btn && view_btn.addEventListener('click', async () => {
      await populateModal(booking);
    });
    checkin_btn && checkin_btn.addEventListener('click', () => {
      bookingAction(booking._id, "check-in");
    });
    checkout_btn && checkout_btn.addEventListener('click', () => {
      bookingAction(booking._id, "check-out");
    });
    confirm_btn && confirm_btn.addEventListener('click', () => {
      confirmBooking(booking._id, "accept", booking.rooms, "Approved", "Approved");
    });
    reject_btn && reject_btn.addEventListener('click', () => {
      const reason = prompt("Please enter the reason for rejection:");
      if (reason) {
        console.log("Rejecting booking", booking._id, reason);
        confirmBooking(booking._id, "reject", booking.rooms, "Rejected", reason);
      }
    });
    cancel_btn && cancel_btn.addEventListener('click', () => {
      const reason = prompt("Please enter the reason for cancellation:");
      if (reason) {
        console.log("Canceling booking", booking._id, reason);
        // confirmBooking(booking._id, "Cancelled", booking.rooms, "cancel", reason);
      }
    });
  });
}


function findBookingByReservationID(data, _id) {
  const booking = data.find(b => b._id === _id);
  return booking;
}


// Initialize dashboard and bookings on page load
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardStats();
  loadTodaysBookings();
});


document.getElementById("startDate").addEventListener("change", loadAvailabilityData);
document.getElementById("endDate").addEventListener("change", loadAvailabilityData);