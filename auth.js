const API = "https://jobflow-backend-7wjj.onrender.com";

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

function showLogin() {
  loginForm.style.display = "flex";
  signupForm.style.display = "none";
  document.querySelectorAll(".tab-btn")[0].classList.add("active");
  document.querySelectorAll(".tab-btn")[1].classList.remove("active");
}

function showSignup() {
  loginForm.style.display = "none";
  signupForm.style.display = "flex";
  document.querySelectorAll(".tab-btn")[1].classList.add("active");
  document.querySelectorAll(".tab-btn")[0].classList.remove("active");
}

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw new Error("Invalid credentials");

    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "index.html";
  } catch (error) {
    document.getElementById("loginError").textContent = "❌ " + error.message;
  }
});

// Signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const res = await fetch(`${API}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    if (!res.ok) throw new Error("Signup failed. User may already exist.");

    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "index.html";
  } catch (error) {
    document.getElementById("signupError").textContent = "❌ " + error.message;
  }
});
