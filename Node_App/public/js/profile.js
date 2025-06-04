

const token = localStorage.getItem("token");
console.log(token)

// Will sign the user with jwt enabled
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/dashboard/api/dashboard", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!res.ok) return alert("Failed to load dashboard");

    // Update username
    document.querySelector(".username").textContent = data.username;

    const profileContainer = document.querySelectorAll(".profile-container");
    const favoritesEl = profileContainer[0];
    const wishlistEl = profileContainer[1];

    favoritesEl.innerHTML = "";
    data.favorites.forEach(recipe => {
      favoritesEl.innerHTML += `
        <div class="recipe-card">
          <div class="recipe-info">
            <h3>${recipe.title}</h3>
            <p>${recipe.duration}</p>
          </div>
        </div>`;
    });

    wishlistEl.innerHTML = "";
    data.wishlist.forEach(title => {
      wishlistEl.innerHTML += `
        <div class="recipe-card">
          <div class="recipe-info">
            <h3>${title}</h3>
            <p>Time TBD</p>
          </div>
        </div>`;
    });
  } catch (err) {
    console.error("⚠️ Error loading dashboard:", err);
    alert("Something went wrong while loading your dashboard.");
  }
});

  