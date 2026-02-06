const API = "https://jobflow-backend-7wjj.onrender.com";

let jobs = [];
let allJobs = [];
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
const addBtn = document.getElementById("addBtn");
const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");

// Load jobs on page load
async function loadJobs() {
  const jobList = document.getElementById("jobList");
  jobList.innerHTML = '<p class="empty-state">⏳ Loading your jobs...</p>';
  
  try {
    console.log("Loading jobs with token:", token);
    
    const res = await fetch(`${API}/jobs`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log("Response status:", res.status);
    
    if (res.status === 401) {
      // Token expired or invalid
      alert("⚠️ Session expired. Please login again.");
      logout();
      return;
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Error response:", errorData);
      throw new Error(errorData.detail || "Failed to fetch jobs");
    }
    
    const data = await res.json();
    console.log("Jobs loaded:", data);
    
    jobs = Array.isArray(data) ? data : [];
    allJobs = jobs;
    renderJobs();
    
  } catch (error) {
    console.error("Error loading jobs:", error);
    jobList.innerHTML = `<p class="empty-state">❌ Failed to load jobs. ${error.message}<br>Please refresh the page.</p>`;
  }
}

function renderJobs() {
  const list = document.getElementById("jobList");
  list.innerHTML = "";

  if (jobs.length === 0) {
    list.innerHTML = '<p class="empty-state">📝 No jobs found. Add your first application above!</p>';
    return;
  }

  jobs.forEach((job) => {
    const div = document.createElement("div");
    div.className = "job";
    
    const statusClass = {
      'Applied': 'status-applied',
      'Interview': 'status-interview',
      'Offer': 'status-offer',
      'Rejected': 'status-rejected'
    }[job.status] || 'status-applied';

    div.innerHTML = `
      <div class="job-info">
        <div class="job-header">
          <span class="company-name">${escapeHtml(job.company)}</span>
          <span class="badge ${statusClass}">${escapeHtml(job.status)}</span>
        </div>
        <div class="job-details">
          <span class="role">${escapeHtml(job.role)}</span>
          <span class="date">📅 ${formatDate(job.applied_date)}</span>
        </div>
      </div>
      <div class="actions">
        <button class="edit" onclick="editJob(${job.id})">Edit</button>
        <button class="delete" onclick="deleteJob(${job.id})">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch (error) {
    return dateString;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Filter and search functionality
function filterJobs() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const statusFilter = filterStatus.value;
  
  jobs = allJobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
                         job.company.toLowerCase().includes(searchTerm) || 
                         job.role.toLowerCase().includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  renderJobs();
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

  const payload = { 
    company: company, 
    role: role, 
    status: status, 
    applied_date: date 
  };

  console.log("Sending payload:", payload);

  try {
    let res;
    
    if (editingId) {
      // Update existing job
      console.log("Updating job ID:", editingId);
      
      res = await fetch(`${API}/jobs/${editingId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    } else {
      // Add new job
      console.log("Adding new job");
      
      res = await fetch(`${API}/jobs`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
    }
    
    console.log("Response status:", res.status);
    
    if (res.status === 401) {
      alert("⚠️ Session expired. Please login again.");
      logout();
      return;
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Error response:", errorData);
      throw new Error(errorData.detail || "Failed to save job");
    }
    
    const responseData = await res.json();
    console.log("Job saved:", responseData);
    
    if (editingId) {
      alert("✅ Job updated successfully!");
    } else {
      alert("🎉 Job added successfully!");
    }
    
    // Clear form
    clearForm();
    
    // Reload jobs from server
    await loadJobs();
    
    // Reset filters
    searchInput.value = '';
    filterStatus.value = 'All';
    
  } catch (error) {
    console.error("Error saving job:", error);
    alert(`❌ Failed to save job. ${error.message}\n\nPlease try again.`);
  }
}

function editJob(id) {
  const job = allJobs.find(j => j.id === id);
  if (!job) {
    alert("Job not found!");
    return;
  }
  
  editingId = id;

  // Fill form with job data
  companyInput.value = job.company;
  roleInput.value = job.role;
  statusInput.value = job.status;
  dateInput.value = job.applied_date;

  // Change button text
  addBtn.textContent = "Update Job";

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteJob(id) {
  if (!confirm("🗑️ Are you sure you want to delete this job?")) return;

  try {
    console.log("Deleting job ID:", id);
    
    const res = await fetch(`${API}/jobs/${id}`, { 
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log("Delete response status:", res.status);
    
    if (res.status === 401) {
      alert("⚠️ Session expired. Please login again.");
      logout();
      return;
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Error response:", errorData);
      throw new Error(errorData.detail || "Failed to delete job");
    }
    
    alert("✅ Job deleted successfully!");
    
    // Reload jobs from server
    await loadJobs();
    
  } catch (error) {
    console.error("Error deleting job:", error);
    alert(`❌ Failed to delete job. ${error.message}\n\nPlease try again.`);
  }
}

function clearForm() {
  companyInput.value = "";
  roleInput.value = "";
  statusInput.value = "Applied";
  dateInput.value = "";
  editingId = null;
  addBtn.textContent = "Add Job";
}

function logout() {
  // Only clear auth tokens, jobs are saved in backend
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// Initialize - load jobs when page loads
console.log("Initializing with user:", user);
loadJobs();
