// API Configuration
const API_URL = "https://jobflow-backend-7wjj.onrender.com";

let editingId = null;

// Login Function
async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const messageEl = document.getElementById("loginMessage");

    if (!username || !password) {
        showMessage(messageEl, "Please enter both username and password", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();
        
        if (data.success || response.ok) {
            showMessage(messageEl, "✅ Login successful!", "success");
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            // Clear form
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
        } else {
            showMessage(messageEl, "❌ Login failed. Please check your credentials.", "error");
        }
    } catch (error) {
        console.error("Login error:", error);
        showMessage(messageEl, "⚠️ Connection error. Please try again.", "error");
    }
}

// Load all jobs
async function loadJobs() {
    const jobList = document.getElementById("jobList");
    const totalJobsEl = document.getElementById("totalJobs");
    
    jobList.innerHTML = '<div class="empty-state"><p style="color: rgba(255,255,255,0.6);">⏳ Loading applications...</p></div>';

    try {
        const response = await fetch(`${API_URL}/jobs`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch jobs");
        }

        const jobs = await response.json();
        
        // Update total count
        if (totalJobsEl) {
            totalJobsEl.textContent = jobs.length;
        }

        if (jobs.length === 0) {
            jobList.innerHTML = `
                <div class="empty-state">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="2" opacity="0.2"/>
                        <path d="M30 50h40M50 30v40" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
                    </svg>
                    <p>No applications yet. Start tracking your journey!</p>
                </div>
            `;
            return;
        }

        jobList.innerHTML = "";
        
        jobs.forEach((job, index) => {
            const jobItem = createJobElement(job, index);
            jobList.appendChild(jobItem);
        });
    } catch (error) {
        console.error("Error loading jobs:", error);
        jobList.innerHTML = '<div class="empty-state"><p style="color: rgba(239, 68, 68, 0.8);">❌ Failed to load applications. Please refresh the page.</p></div>';
    }
}

// Create job element
function createJobElement(job, index) {
    const div = document.createElement("div");
    div.className = "job-item";
    div.style.animationDelay = `${index * 0.1}s`;
    
    // Extract emoji from status if present
    const statusText = job.status.replace(/[^\w\s]/gi, '').trim() || job.status;
    const statusClass = `status-${statusText.toLowerCase().replace(/\s+/g, '-')}`;
    
    div.innerHTML = `
        <div class="job-header">
            <div class="job-company">${escapeHtml(job.company)}</div>
            <div class="job-status ${statusClass}">${escapeHtml(job.status)}</div>
        </div>
        <div class="job-details">
            <div class="job-role">💼 ${escapeHtml(job.role)}</div>
            <div class="job-date">📅 Applied: ${formatDate(job.applied_date)}</div>
        </div>
        <div class="job-actions">
            <button class="btn edit-btn" onclick="editJob(${job.id}, \`${escapeHtml(job.company)}\`, \`${escapeHtml(job.role)}\`, \`${escapeHtml(job.status)}\`, '${job.applied_date}')">
                <span>Edit</span>
            </button>
            <button class="btn delete-btn" onclick="deleteJob(${job.id})">
                <span>Delete</span>
            </button>
        </div>
    `;
    
    return div;
}

// Add or Update job
async function addJob() {
    const company = document.getElementById("company").value.trim();
    const role = document.getElementById("role").value.trim();
    const statusSelect = document.getElementById("status");
    const status = statusSelect.value;
    const date = document.getElementById("date").value;

    if (!company || !role || !status || !date) {
        alert("⚠️ Please fill in all fields");
        return;
    }

    const payload = {
        company: company,
        role: role,
        status: status,
        applied_date: date
    };

    try {
        let response;
        
        if (editingId) {
            response = await fetch(`${API_URL}/jobs/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(`${API_URL}/jobs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        }

        if (!response.ok) {
            throw new Error("Failed to save job");
        }

        clearForm();
        loadJobs();
        
        // Success notification
        const notification = editingId ? "✅ Job updated successfully!" : "🎉 Job added successfully!";
        alert(notification);
        
        // Scroll to jobs section
        document.getElementById("jobsSection").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
        console.error("Error saving job:", error);
        alert("❌ Failed to save job. Please try again.");
    }
}

// Delete job
async function deleteJob(id) {
    if (!confirm("🗑️ Are you sure you want to delete this application?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/jobs/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete job");
        }

        loadJobs();
        alert("✅ Job deleted successfully!");
    } catch (error) {
        console.error("Error deleting job:", error);
        alert("❌ Failed to delete job. Please try again.");
    }
}

// Edit job - populate form
function editJob(id, company, role, status, date) {
    editingId = id;
    
    document.getElementById("company").value = company;
    document.getElementById("role").value = role;
    
    // Set select dropdown value
    const statusSelect = document.getElementById("status");
    statusSelect.value = status;
    
    document.getElementById("date").value = date;
    
    document.getElementById("formTitle").textContent = "✏️ Edit Application";
    document.getElementById("submitBtn").innerHTML = `
        <span>Update Application</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
    document.getElementById("cancelBtn").style.display = "block";
    
    // Scroll to form
    document.getElementById("addJobSection").scrollIntoView({ behavior: "smooth", block: "center" });
}

// Cancel edit
function cancelEdit() {
    clearForm();
}

// Clear form
function clearForm() {
    editingId = null;
    document.getElementById("company").value = "";
    document.getElementById("role").value = "";
    document.getElementById("status").value = "";
    document.getElementById("date").value = "";
    
    document.getElementById("formTitle").textContent = "✨ Add New Application";
    document.getElementById("submitBtn").innerHTML = `
        <span>Add Application</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12m-6-6h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;
    document.getElementById("cancelBtn").style.display = "none";
}

// Utility: Show message
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    
    setTimeout(() => {
        element.textContent = "";
        element.className = "message";
    }, 5000);
}

// Utility: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add Enter key support for login
document.addEventListener("DOMContentLoaded", () => {
    // Load jobs when page loads
    loadJobs();
    
    // Enter key for login
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    
    if (usernameInput && passwordInput) {
        [usernameInput, passwordInput].forEach(input => {
            input.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    login();
                }
            });
        });
    }
    
    // Set today's date as default
    const dateInput = document.getElementById("date");
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
});
