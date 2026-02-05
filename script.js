const API = "https://jobflow-backend-7wjj.onrender.com";

let jobs = [];
let editingId = null;
let token = localStorage.getItem("token");
let user = JSON.parse(localStorage.getItem("user"));

// Check authentication
if (!token || !user) {
  window.location.href = "login.html";
}

// Display username
document.getElementById("username").textContent = `👋 ${user.username}`;

// Get DOM elements
const companyInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const statusInput = document.getElementById("status");
const dateInput = document.getElementById("date");

async function loadJobs() {
  try {
    const res = await fetch(`${API}/jobs`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (res.status === 401) {
      logout();
      return;
    }
    
    jobs = await res.json();
    renderJobs();
  } catch (error) {
    console.error("Error loading jobs:", error);
    alert("Failed to load jobs.");
  }
}

function renderJobs() {
  const list = document.getElementById("jobList");
  list.innerHTML = "";

  if (jobs.length === 0) {
    list.innerHTML = '<p style="text-align: center; opacity: 0.6;">No jobs yet. Add your first one!</p>';
    return;
  }

  jobs.forEach(job => {
    const div = document.createElement("div");
    div.className = "job";
    
    const statusClass = {
      'Applied': 'status-applied',
      'Interview': 'status-interview',
      'Offer': 'status-offer',
      'Rejected': 'status-rejected'
    }[job.status] || '';

    div.innerHTML = `
      <div class="job-info">
        <div class="job-header">
          <span class="company-name">${job.company}</span>
          <span class="badge ${statusClass}">${job.status}</span>
        </div>
        <div class="job-details">
          <span class="role">${job.role}</span>
          <span class="date">📅 ${formatDate(job.applied_date)}</span>
        </div>
      </div>
      <div class="actions">
        <button class="edit" onclick="editJob(${job.id})">✏️ Edit</button>
        <button class="delete" onclick="deleteJob(${job.id})">🗑️ Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function addJob() {
  const company = companyInput.value.trim();
  const role = roleInput.value.trim();
  const status = statusInput.value;
  const date = dateInput.value;

  if (!company || !role || !date) {
    alert("⚠️ Please fill all fields!");
    return;
  }

  const payload = { company, role, status, applied_date: date };

  try {
    if (editingId) {
      await fetch(`${API}/jobs/${editingId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      editingId = null;
    } else {
      await fetch(`${API}/jobs`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
    }

    clearForm();
    await loadJobs();
  } catch (error) {
    console.error("Error adding job:", error);
    alert("Failed to add job.");
  }
}

function editJob(id) {
  const job = jobs.find(j => j.id === id);
  if (!job) return;
  
  editingId = id;

  companyInput.value = job.company;
  roleInput.value = job.role;
  statusInput.value = job.status;
  dateInput.value = job.applied_date;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteJob(id) {
  if (!confirm("Are you sure you want to delete this job?")) return;

  try {
    await fetch(`${API}/jobs/${id}`, { 
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    await loadJobs();
  } catch (error) {
    console.error("Error deleting job:", error);
    alert("Failed to delete job.");
  }
}

function clearForm() {
  companyInput.value = "";
  roleInput.value = "";
  statusInput.value = "Applied";
  dateInput.value = "";
  editingId = null;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

loadJobs();
