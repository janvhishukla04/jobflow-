const API = "https://jobflow-backend-7wjj.onrender.com";

let jobs = [];
let editingId = null;

async function loadJobs() {
  const res = await fetch(`${API}/jobs`);
  jobs = await res.json();
  renderJobs();
}

function renderJobs() {
  const list = document.getElementById("jobList");
  list.innerHTML = "";

  jobs.forEach(job => {
    const div = document.createElement("div");
    div.className = "job";
    div.innerHTML = `
      <span><b>${job.company}</b> | ${job.role} | ${job.status} | ${job.applied_date}</span>
      <div class="actions">
        <button class="edit" onclick="editJob(${job.id})">Edit</button>
        <button class="delete" onclick="deleteJob(${job.id})">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

async function addJob() {
  const company = companyInput.value.trim();
  const role = roleInput.value.trim();
  const status = statusInput.value;
  const date = dateInput.value;

  if (!company || !role || !date) {
    alert("Fill all fields");
    return;
  }

  const payload = { company, role, status, applied_date: date };

  if (editingId) {
    await fetch(`${API}/jobs/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    editingId = null;
  } else {
    await fetch(`${API}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  clearForm();
  loadJobs();
}

function editJob(id) {
  const job = jobs.find(j => j.id === id);
  editingId = id;

  companyInput.value = job.company;
  roleInput.value = job.role;
  statusInput.value = job.status;
  dateInput.value = job.applied_date;
}

async function deleteJob(id) {
  await fetch(`${API}/jobs/${id}`, { method: "DELETE" });
  loadJobs();
}

function clearForm() {
  companyInput.value = "";
  roleInput.value = "";
  statusInput.value = "Applied";
  dateInput.value = "";
}

const companyInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const statusInput = document.getElementById("status");
const dateInput = document.getElementById("date");

loadJobs();
