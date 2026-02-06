const API = "https://jobflow-backend-7wjj.onrender.com";

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

// Make switchTab available globally
window.switchTab = function(tab) {
  if (tab === 'login') {
    loginForm.style.display = "flex";
    signupForm.style.display = "none";
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    document.getElementById("loginError").textContent = "";
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "flex";
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    document.getElementById("signupError").textContent = "";
  }
}

// Make togglePassword available globally
window.togglePassword = function(inputId, button) {
  const input = document.getElementById(inputId);
  const icon = button.querySelector('.eye-icon');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = '🙈';
  } else {
    input.type = 'password';
    icon.textContent = '👁️';
  }
}

// Login Handler
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const submitBtn = loginForm.querySelector('.auth-submit');
  const errorEl = document.getElementById("loginError");
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Validation
  if (!email || !password) {
    errorEl.textContent = "❌ Please fill in all fields";
    errorEl.style.color = "#ef4444";
    return;
  }

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in...";
  errorEl.textContent = "";

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Invalid email or password");
    }

    // Store authentication
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    // Success message
    errorEl.textContent = "✅ Success! Redirecting...";
    errorEl.style.color = "#10b981";

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);

  } catch (error) {
    errorEl.textContent = "❌ " + error.message;
    errorEl.style.color = "#ef4444";
    submitBtn.disabled = false;
    submitBtn.textContent = "Login";
  }
});

// Signup Handler
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const submitBtn = signupForm.querySelector('.auth-submit');
  const errorEl = document.getElementById("signupError");
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  // Validation
  if (!username || !email || !password) {
    errorEl.textContent = "❌ Please fill in all fields";
    errorEl.style.color = "#ef4444";
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = "❌ Password must be at least 6 characters";
    errorEl.style.color = "#ef4444";
    return;
  }

  if (username.length < 3) {
    errorEl.textContent = "❌ Username must be at least 3 characters";
    errorEl.style.color = "#ef4444";
    return;
  }

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating Account...";
  errorEl.textContent = "";

  try {
    const res = await fetch(`${API}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Signup failed. User may already exist.");
    }

    // Store authentication
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    // Success message
    errorEl.textContent = "✅ Account created! Redirecting...";
    errorEl.style.color = "#10b981";

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = "index.html";
    }, 500);

  } catch (error) {
    errorEl.textContent = "❌ " + error.message;
    errorEl.style.color = "#ef4444";
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
});

// Check if already logged in
if (localStorage.getItem("token")) {
  window.location.href = "index.html";
}
