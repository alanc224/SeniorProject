
console.log("SIGNING UP!")

//calls mongo DB to store a new user's info securly (hashed passwords)
document.querySelector("#signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("SIGNING UP!")
  
    const data = {
      first_name: document.getElementById("first_name").value.trim(),
      last_name: document.getElementById("last_name").value.trim(),
      username: document.getElementById("name").value.trim(),
      password: document.getElementById("password").value,
      confirm_password: document.getElementById("confirm_password").value,
      favourite_cuisine: document.getElementById("cuisine").value
    };
  
    if (data.password !== data.confirm_password) {
      alert("Passwords do not match!");
      return;
    }
  
    const res = await fetch("/signup/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  
    const result = await res.json();
    if (res.ok) {
      alert("✅ Signed up successfully!");
      // redirect to sign in 
      window.location.href = "/signin";

      

    } else {
      alert("❌ " + (result.error || "Signup failed"));
    }
  });
  