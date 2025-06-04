


//sign in logic with jwt enabled
document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const username = document.getElementById("name").value.trim();
    const password = document.getElementById("password").value;
  
    const res = await fetch("/login/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
  
    const data = await res.json();
  
    if (res.ok) {
      // ✅ Save token from server
      localStorage.setItem("token", data.token);
      window.location.href = "/profile";
    } else {
      alert("❌ " + (data.error || "Login failed"));
    }
  });
  