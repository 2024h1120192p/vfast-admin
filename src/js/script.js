async function getDashboardStats() {
  return await apiRequest('/booking/booking-statistics', {}, true);
}

async function getTodaysBookings() {
  return await apiRequest('/booking/booking-dashboard', {}, true);
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
      body: { booking_id: bookingId, status, rooms, reason, status_reason: statusReason }
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

refreshBookingsData = async () => bookingsData = (await getTodaysBookings()).data.bookings;

async function loadTodaysBookings() {
  try {
    await refreshBookingsData();

    const bookingsTableBody = document.getElementById("bookingsTableBody");
    bookingsTableBody.innerHTML = "";
    
    bookingsData.forEach(booking => {
      const row = `<tr>
          <td>${booking._id}</td>
          <td>${booking.first_name} ${booking.last_name}</td>
          <td>${booking.check_in}</td>
          <td>${booking.check_out}</td>
          <td><span class="badge ${getStatusBadgeClass(booking.booking_status)}">${booking.booking_status}</span></td>
          <td>${booking.phone_number}</td>
          <td>
            <button class="btn btn-sm btn-primary view-btn" data-reservation="${booking._id}">View</button>
            <button class="btn btn-sm btn-success">Check-In</button>
            <button class="btn btn-sm btn-danger">Check-Out</button>
          </td>
        </tr>`;
      bookingsTableBody.insertAdjacentHTML("beforeend", row);
    });
    
    attachViewEventListeners();
    
  } catch (error) {
    console.error("Error loading today's bookings:", error);
  }
}

// Function to load Availability Data
async function loadAvailabilityData(check_in_date, check_out_date) {
  try {
    check_in_date = check_out_date? new Date(check_in_date) : new Date(Date.now());
    // check_out_date = check_out_date? new Date(check_out_date): new Date(check_in_date.getTime() + 86400000);
    check_out_date = check_out_date? new Date(check_out_date): check_in_date;


    const data = (await getAvailability(
      `${check_in_date.getFullYear()}-${String(check_in_date.getMonth() + 1).padStart(2, '0')}-${String(check_in_date.getDate()).padStart(2, '0')}`, 
      `${check_out_date.getFullYear()}-${String(check_out_date.getMonth() + 1).padStart(2, '0')}-${String(check_out_date.getDate()).padStart(2, '0')}`
    )).data;
    console.log(data);
    const availabilityTableBody = document.getElementById("availabilityTableBody");
    availabilityTableBody.innerHTML = "";
    
    data[0].roomAvailability.forEach(item => {
      const row = `<tr>
          <td>${item.roomType}</td>
          <td>${item.totalRooms}</td>
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
  try {
    const data = (await getRooms()).data;
    console.log(data);
    const roomsTableBody = document.getElementById("roomsTableBody");
    roomsTableBody.innerHTML = "";
    
    data.rooms.forEach(room => {
      const row = `<tr>
          <td>${room.room_number}</td>
          <td>${room.room_type}</td>
          <td><span class="badge ${getStatusBadgeClass(room.status)}">${room.status}</span></td>
        </tr>`;
      roomsTableBody.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error loading rooms data:", error);
  }
}

// Function to load Request Details
async function loadRequestDetails() {
  try {
    await refreshBookingsData();

    const requestTableBody = document.getElementById("requestTableBody");
    requestTableBody.innerHTML = "";
    
    bookingsData.forEach(booking => {
      const row = `<tr>
          <td class="text-center">${booking._id}</td>
          <td>${booking.first_name} ${booking.last_name}</td>
          <td>${booking.check_in}</td>
          <td>${booking.check_out}</td>
          <td><span class="badge ${getStatusBadgeClass(booking.booking_status)}">${booking.booking_status}</span></td>
          <td>${booking.phone_number}</td>
          <td>
            <button class="btn btn-sm btn-primary view-btn" data-reservation="${booking._id}">View</button>
            <button class="btn btn-sm btn-success">
              <i class="fa-solid fa-check" aria-hidden="true"></i>
            </button>
            <button class="btn btn-sm btn-danger">
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </td>
        </tr>`;
      requestTableBody.insertAdjacentHTML("beforeend", row);
    });
    attachViewEventListeners();
  } catch (error) {
    console.error("Error loading request details:", error);
  }
}

// Utility function to get the badge class based on status
function getStatusBadgeClass(status) {
  switch (status) {
    case "Reserved":
      return "bg-warning text-dark";
    case "Checked-In":
      return "bg-success";
    case "Checked-Out":
      return "bg-secondary";
    case "Pending":
      return "bg-secondary";
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

// Function to attach event listeners to "View" buttons
function attachViewEventListeners() {
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const reservation_id = e.target.getAttribute('data-reservation');
      const booking = findBookingByReservationID(reservation_id);
      if (booking) {
        populateModal(booking);
      }
    });
  });
}

function findBookingByReservationID(_id) {
  // Search in bookings
  const booking = bookingsData.find(b => b._id === _id);
  return booking;
}

// Function to populate the modal with booking details
function populateModal(booking) {
  document.getElementById("modalReservationNo").textContent = booking._id;
  document.getElementById("modalName").textContent = booking.first_name + " " + booking.last_name;
  document.getElementById("modalCheckIn").textContent = booking.check_in;
  document.getElementById("modalCheckOut").textContent = booking.check_out;
  document.getElementById("modalStatus").innerHTML = `<span class="badge ${getStatusBadgeClass(booking.booking_status)}">${booking.booking_status}</span>`;
  document.getElementById("modalPhone").textContent = booking.phone_number;

  // Show the modal
  const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
  bookingModal.show();
}

// Initialize dashboard and bookings on page load
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardStats();
  loadTodaysBookings();
});
