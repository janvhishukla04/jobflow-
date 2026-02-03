const jobForm = document.getElementById("jobForm");
const applicationList = document.getElementById("applicationList");
const totalCount = document.getElementById("totalCount");
const interviewCount = document.getElementById("interviewCount");
const offerCount = document.getElementById("offerCount");
const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("search");

let applications = JSON.parse(localStorage.getItem("applications")) || [];

renderApplications(applications);
updateDashboard();

jobForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const company = document.getElementById("company").value;
  const role = document.getElementById("role").value;
  const dateApplied = document.getElementById("dateApplied").value;
  const status = document.getElementById("status").value;

  const application = {
    company,
    role,
    dateApplied,
    status,
  };

  applications.push(application);
  saveToLocalStorage();
  renderApplications(applications);
  updateDashboard();

  jobForm.reset();
});

function renderApplications(apps) {
  applicationList.innerHTML = "";

  apps.forEach((app, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${app.company}</strong> - ${app.role} 
      (${app.status}) 
      <button onclick="deleteApplication(${index})">Delete</button>
    `;
    applicationList.appendChild(li);
  });
}

function deleteApplication(index) {
  applications.splice(index, 1);
  saveToLocalStorage();
  renderApplications(applications);
  updateDashboard();
}

function updateDashboard() {
  totalCount.textContent = applications.length;
  interviewCount.textContent = applications.filter(app => app.status === "Interview").length;
  offerCount.textContent = applications.filter(app => app.status === "Offer").length;
}

statusFilter.addEventListener("change", filterApplications);
searchInput.addEventListener("input", filterApplications);

function filterApplications() {
  const statusValue = statusFilter.value;
  const searchValue = searchInput.value.toLowerCase();

  let filteredApps = applications;

  if (statusValue !== "All") {
    filteredApps = filteredApps.filter(app => app.status === statusValue);
  }

  if (searchValue) {
    filteredApps = filteredApps.filter(app =>
      app.company.toLowerCase().includes(searchValue) ||
      app.role.toLowerCase().includes(searchValue)
    );
  }

  renderApplications(filteredApps);
}

function saveToLocalStorage() {
  localStorage.setItem("applications", JSON.stringify(applications));
}
