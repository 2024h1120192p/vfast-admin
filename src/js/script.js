// Sample JSON data
const data = {
    dashboardStats: {
      bookingsToday: 3,
      totalBookings: 150,
      arrivalsPending: 4,
      arrivalsCompleted: 2,
      departuresPending: 1,
      departuresCompleted: 3
    },
    todaysBookings: [
      { reservationNo: "R/00003", name: "Alice Johnson", checkIn: "13/11/2024", checkOut: "14/11/2024", status: "Reserved", phone: "+91 99876 54321" },
      { reservationNo: "R/00004", name: "Bob Williams", checkIn: "13/11/2024", checkOut: "14/11/2024", status: "Checked-In", phone: "+91 98765 43210" },
      { reservationNo: "R/00005", name: "Charlie Brown", checkIn: "13/11/2024", checkOut: "14/11/2024", status: "Reserved", phone: "+91 87654 32109" }
    ],
    bookings: [
      { reservationNo: "R/00001", name: "John Doe", checkIn: "13/11/2024", checkOut: "14/11/2024", status: "Reserved", phone: "+91 98765 43210" },
      { reservationNo: "R/00002", name: "Jane Smith", checkIn: "15/11/2024", checkOut: "16/11/2024", status: "Checked-In", phone: "+91 87654 32109" }
    ],
    availability: [
      { roomType: "Single", totalRooms: 10, available: 3 },
      { roomType: "Double", totalRooms: 8, available: 2 },
      { roomType: "Suite", totalRooms: 5, available: 1 }
    ],
    rooms: [
      { roomNo: "101", roomType: "Single", status: "Available" },
      { roomNo: "102", roomType: "Single", status: "Occupied" },
      { roomNo: "201", roomType: "Double", status: "Available" },
      { roomNo: "202", roomType: "Suite", status: "Maintenance" }
    ]
  };
  
  // Function to load Dashboard Statistics
  function loadDashboardStats() {
    const stats = data.dashboardStats;
    
    document.getElementById("bookingsToday").textContent = stats.bookingsToday;
    document.getElementById("totalBookings").textContent = stats.totalBookings;
    document.getElementById("arrivalsPending").textContent = stats.arrivalsPending;
    document.getElementById("arrivalsCompleted").textContent = stats.arrivalsCompleted;
    document.getElementById("departuresPending").textContent = stats.departuresPending;
    document.getElementById("departuresCompleted").textContent = stats.departuresCompleted;
  }
  
  // Function to load Today's Bookings
  function loadTodaysBookings() {
    const bookingsTableBody = document.getElementById("bookingsTableBody");
    bookingsTableBody.innerHTML = "";
    data.todaysBookings.forEach(booking => {
      const row = `<tr>
        <td>${booking.reservationNo}</td>
        <td>${booking.name}</td>
        <td>${booking.checkIn}</td>
        <td>${booking.checkOut}</td>
        <td><span class="badge ${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
        <td>${booking.phone}</td>
        <td>
          <button class="btn btn-sm btn-primary view-btn" data-reservation="${booking.reservationNo}">View</button>
          <button class="btn btn-sm btn-success">Check-In</button>
          <button class="btn btn-sm btn-danger">Check-Out</button>
        </td>
      </tr>`;
      bookingsTableBody.insertAdjacentHTML("beforeend", row);
    });
    attachViewEventListeners();
  }
  
  // Function to load Request Details
  function loadRequestDetails() {
    const requestTableBody = document.getElementById("requestTableBody");
    requestTableBody.innerHTML = "";
    data.bookings.forEach(booking => {
      const row = `<tr>
        <td>${booking.reservationNo}</td>
        <td>${booking.name}</td>
        <td>${booking.checkIn}</td>
        <td>${booking.checkOut}</td>
        <td><span class="badge ${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
        <td>${booking.phone}</td>
        <td>
          <button class="btn btn-sm btn-primary view-btn" data-reservation="${booking.reservationNo}">View</button>
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
  }
  
  // Function to load Availability Data
  function loadAvailabilityData() {
    const availabilityTableBody = document.getElementById("availabilityTableBody");
    availabilityTableBody.innerHTML = "";
    data.availability.forEach(item => {
      const row = `<tr>
        <td>${item.roomType}</td>
        <td>${item.totalRooms}</td>
        <td>${item.available}</td>
      </tr>`;
      availabilityTableBody.insertAdjacentHTML("beforeend", row);
    });
  }
  
  // Function to load Rooms Data
  function loadRoomsData() {
    const roomsTableBody = document.getElementById("roomsTableBody");
    roomsTableBody.innerHTML = "";
    data.rooms.forEach(room => {
      const row = `<tr>
        <td>${room.roomNo}</td>
        <td>${room.roomType}</td>
        <td><span class="badge ${getStatusBadgeClass(room.status)}">${room.status}</span></td>
      </tr>`;
      roomsTableBody.insertAdjacentHTML("beforeend", row);
    });
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
      case "Draft":
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
    switch(viewId) {
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
        const reservationNo = e.target.getAttribute('data-reservation');
        const booking = findBookingByReservationNo(reservationNo);
        if (booking) {
          populateModal(booking);
        }
      });
    });
  }
  
  // Function to find booking by reservation number
  function findBookingByReservationNo(reservationNo) {
    // Search in todaysBookings
    let booking = data.todaysBookings.find(b => b.reservationNo === reservationNo);
    if (booking) return booking;
    
    // Search in bookings
    booking = data.bookings.find(b => b.reservationNo === reservationNo);
    return booking;
  }
  
  // Function to populate the modal with booking details
  function populateModal(booking) {
    document.getElementById("modalReservationNo").textContent = booking.reservationNo;
    document.getElementById("modalName").textContent = booking.name;
    document.getElementById("modalCheckIn").textContent = booking.checkIn;
    document.getElementById("modalCheckOut").textContent = booking.checkOut;
    document.getElementById("modalStatus").innerHTML = `<span class="badge ${getStatusBadgeClass(booking.status)}">${booking.status}</span>`;
    document.getElementById("modalPhone").textContent = booking.phone;
  
    // Show the modal
    const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    bookingModal.show();
  }
  
  // Initialize dashboard and bookings on page load
  document.addEventListener("DOMContentLoaded", () => {
    loadDashboardStats();
    loadTodaysBookings();
  });
  