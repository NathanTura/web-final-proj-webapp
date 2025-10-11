// login.js

document.addEventListener("DOMContentLoaded", () => {
  const signinBtn = document.getElementById("signinBtn");
  const messageDiv = document.getElementById("message");

  signinBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      messageDiv.textContent = "⚠️ Please enter both username and password.";
      return;
    }

    try {
      const res = await fetch("https://ledgerpro-php.onrender.com/api/auth/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        messageDiv.textContent = `✅ Welcome ${data.user.name}`;
        localStorage.setItem("api_key", data.user.api_key);

        // Redirect after short delay
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        messageDiv.textContent = `❌ ${data.error || "Invalid credentials"}`;
      }
    } catch (err) {
      console.error("Error:", err);
      messageDiv.textContent = "❌ Network error. Please try again later.";
    }
  });
});
