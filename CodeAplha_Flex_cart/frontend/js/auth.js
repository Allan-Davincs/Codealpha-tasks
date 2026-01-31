const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect form data
  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  };

  try {
    const res = await fetch("https://flexcart-backend.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || "Registration failed");
      return;
    }

    // Save token to localStorage
    localStorage.setItem("token", result.token);

    alert("Registration successful!");
    window.location.href = "index.html"; // redirect to homepage after signup
  } catch (error) {
    console.error("Registration error:", error);
    alert("Server error. Try again later.");
  }
});
