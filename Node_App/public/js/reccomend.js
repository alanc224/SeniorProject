


function initializeSearchHandlers() {
    const searchInput = document.getElementById("searchQuery");
    const searchButtons = document.querySelectorAll('.button-wrapper button');

    // Handle Enter key in search input
    searchInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            fetchFoodRecommendations(this.value);
        }
    });

    // Handle click on all search buttons
    searchButtons.forEach(button => {
        button.addEventListener("click", function() {
            const query = searchInput.value;
            if (query.trim()) {
                fetchFoodRecommendations(query);
            }
        });
    });
}

// Initialize search functionality when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeSearchHandlers();

    // Handle logo click to show hero and features sections
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            const heroSection = document.querySelector('.container .hero');
            const featuresSection = document.querySelector('.features-section');
            const resultsContainer = document.getElementById('food-results');
            
            if (heroSection) {
                heroSection.classList.remove('hide-on-search');
            }
            if (featuresSection) {
                featuresSection.classList.remove('hide-on-search');
            }
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
            }
            
            document.getElementById('searchQuery').value = '';
        });
    }
});


function fetchFoodRecommendations(query) {
    if (!query.trim()) return; // Prevent empty searches

    const resultsContainer = document.getElementById("food-results");
    resultsContainer.innerHTML = `
        <div class="loading">
            Finding the perfect recipes for "${query}"...
        </div>
    `;

    // Hide the hero and features sections when search is clicked
    const heroSection = document.querySelector(".container .hero");
    const featuresSection = document.querySelector(".features-section");
    const mainProfileContent = document.getElementById('main-profile-content');
    const profileButton = document.getElementById('profileButton');
    const feedContainer = document.getElementById('feed-container');
    const feedButton = document.getElementById('feedButton');

    if (heroSection) {
        heroSection.classList.add('hide-on-search');
    }
    if (featuresSection) {
        featuresSection.classList.add('hide-on-search');
    }

    if (mainProfileContent) {
        mainProfileContent.classList.add('hide-on-search');
        profileButton.style.display = 'block';
    }
    if (feedContainer) {
        feedContainer.classList.add('hide-on-search');
        feedButton.style.display = 'block';
    }


    // Fetch results from the API
    // Fetch results from the API
const startTime = performance.now(); // ⏱ Start timer

fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ query }),
    mode: 'cors'
})
.then(response => {
    console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: [...response.headers.entries()]
    });

    resultsContainer.innerHTML = `
        <div class="loading">
            Analyzing recipes for "${query}"...
        </div>
    `;

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    const elapsed = (performance.now() - startTime).toFixed(2); // ⏱ End timer
    console.log(`⏳ Request completed in ${elapsed} ms`);

    if (data.error) {
        throw new Error(data.error);
    }

    if (Array.isArray(data) && data.length > 0) {
        displayFoodCards(data);
        // Optionally display time somewhere
        const timeDiv = document.createElement("div");
        timeDiv.style.marginTop = "10px";
        timeDiv.style.fontSize = "14px";
        timeDiv.style.color = "#ccc";
        timeDiv.textContent = `Results loaded in ${elapsed} ms`;
        resultsContainer.appendChild(timeDiv);
    } else {
        resultsContainer.innerHTML = '<div class="no-results">No recipes found. Try a different search.</div>';
    }
})
.catch(error => {
    console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
    });
    resultsContainer.innerHTML = `<div class="error">Error loading recipes: ${error.message}</div>`;
});
}


function scrollToResults() {
    const resultsContainer = document.getElementById("food-results");
    if (resultsContainer) {
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function displayFoodCards(results) {
    console.log('Displaying food cards:', results);
    const container = document.getElementById("food-results");
    const resultsCount = results.length;
    
    // Clear previous results
    container.innerHTML = "";
    
    // Create a wrapper for the results count
    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'results-header';
    resultsHeader.innerHTML = `
        <h3>Found ${resultsCount} recipe${resultsCount === 1 ? '' : 's'}</h3>
        <div class="results-divider"></div>
    `;
    container.appendChild(resultsHeader);

    // Create grid container for cards
    const gridContainer = document.createElement('div');
    gridContainer.className = 'food-cards-grid';
    container.appendChild(gridContainer);

    // Add results count style to CSS
    const style = document.createElement('style');
    style.textContent = `
        .results-header {
            width: 100%;
            margin-bottom: 2rem;
            color: white;
            text-align: center;
        }
        .results-header h3 {
            font-size: 1.4rem;
            margin-bottom: 1rem;
            color: white;
        }
        .results-divider {
            height: 2px;
            background: rgba(255, 255, 255, 0.2);
            width: 100px;
            margin: 0 auto;
        }
    `;
    document.head.appendChild(style);

    // Helper functions
    const safeHtml = str => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    const safePercentage = (num) => {
        const score = parseFloat(num);
        if (isNaN(score)) return '0';
        return Math.min(Math.max(score * 100, 0), 100).toFixed();
    };

    results.forEach((food, index) => {
        // Skip invalid entries
        if (!food || typeof food !== 'object') {
            console.warn(`Skipping invalid food item at index ${index}`);
            return;
        }

        console.log(`Processing food item ${index}:`, food);
        const card = document.createElement("div");
        card.classList.add("food-card");

        const ingredientsRaw = food.ingredients;
        const parsedIngredients = Array.isArray(ingredientsRaw)
          ? ingredientsRaw
          : (typeof ingredientsRaw === "string" ? JSON.parse(ingredientsRaw) : []);
        
        const wishlistButton = `
          <button class="add-wishlist" 
                  data-id="${food._id}" 
                  data-title="${safeHtml(food["Food Name"] || "Untitled Recipe")}"
                  data-ingredients='${JSON.stringify(parsedIngredients)}'>
            ➕ Add to Wishlist
          </button>
        `;



        // Safely process ingredients and directions with validation
        const ingredientsList = (() => {
            const ingredients = food.ingredients;
            if (!ingredients) return '<li>No ingredients available</li>';
            
            // If ingredients is an array or array-like string
            if (Array.isArray(ingredients) || (typeof ingredients === 'string' && ingredients.includes('['))) {
                try {
                    const parsedIngredients = Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients);
                    return parsedIngredients
                        .map(ingredient => `<li>${safeHtml(ingredient.trim())}</li>`)
                        .join('\n');
                } catch (e) {
                    // If parsing fails, treat as single string
                    return `<li>${safeHtml(ingredients)}</li>`;
                }
            }
            
            // Handle single string case
            return ingredients.split('\n')
                .filter(line => line.trim())
                .map(line => `<li>${safeHtml(line.trim())}</li>`)
                .join('\n');
        })();

        const directionSteps = (() => {
            const directions = food.directions;
            if (!directions) return '<li>No directions available</li>';

            // Function to clean up and split directions into steps
            const splitIntoSteps = (text) => {
                // First replace linebreaks with spaces
                const cleanText = text.replace(/\n+/g, ' ');
                
                // Split on periods but keep them with the sentence
                const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [];
                
                return sentences
                    .map(step => step.trim())
                    .filter(step => step.length > 0)
                    .map(step => `<li>${safeHtml(step.trim())}</li>`)
                    .join('\n') || '<li>No directions available</li>';
            };

            // First try to parse as JSON if it looks like an array
            if (typeof directions === 'string' && directions.trim().startsWith('[')) {
                try {
                    const parsedDirections = JSON.parse(directions);
                    if (Array.isArray(parsedDirections)) {
                        return parsedDirections
                            .map(step => `<li>${safeHtml(step.trim())}</li>`)
                            .join('\n');
                    }
                } catch (e) {
                    console.warn('Failed to parse directions as JSON:', e);
                }
            }
            
            // If it's already an array, use it directly
            if (Array.isArray(directions)) {
                return directions
                    .map(step => `<li>${safeHtml(step.trim())}</li>`)
                    .join('\n');
            }
            
            // Otherwise treat as a plain string and split into steps
            return splitIntoSteps(directions.toString());
        })();

        card.innerHTML = `
            <div class="food-card-header">
                <h2>${safeHtml(food["Food Name"] || "Untitled Recipe")}</h2>
                <div class="score">
                    <span class="score-label">Match</span>
                    <span class="score-value">${safePercentage(food.score)}%</span>
                </div>
            </div>
            <div class="food-card-content">
                <div class="ingredients-section">
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${ingredientsList}
                    </ul>
                </div>
                <div class="directions-section">
                    <h3>Directions</h3>
                    <ol class="directions-list">
                        ${directionSteps}
                    </ol>
                </div>
                <div class="source-section">
                    ${
                        function getSourceLink() {
                            const url = food.link || food.source;
                            if (!url) return 'Source not available';
                            try {
                                // Simple URL validation
                                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                    return `Source: ${url}`;
                                }
                                const urlObj = new URL(url);
                                return `Recipe from: <a href="${url}" target="_blank">${urlObj.hostname}</a>`;
                            } catch (e) {
                                return `Source: ${url}`;
                            }
                        }()
                    }
                    
                         <div class="wishlist-button">
        ${wishlistButton}
      </div>
                
            </div>
        `;

        gridContainer.appendChild(card);
    });
}



document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("add-wishlist")) {
    const token = localStorage.getItem("token");
    if (!token) return alert("You're not logged in!");

    const title = e.target.dataset.title;
    const id = e.target.dataset.id;
    const ingredients = JSON.parse(e.target.dataset.ingredients);

    try {
      const res = await fetch("/dashboard/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, id, ingredients })
      });

      const result = await res.json();

      
      if (res.ok) {
        alert("✅ Added to wishlist!");
      } else {
        alert("❌ " + result.error);
      }
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      alert("Something went wrong.");
    }
  }
});
window.addEventListener("DOMContentLoaded", async () => {
    // Only run this code if we're on the profile/dashboard page
    if (!window.location.pathname.includes("/profile")) return;
  
    const token = localStorage.getItem("token");
    if (!token) return;
  
    try {
      const res = await fetch("/dashboard/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const data = await res.json();
      if (!res.ok) return alert("Failed to load dashboard");
  
      // ✅ Check if elements exist before using
      const usernameEl = document.querySelector(".username");
      const wishlistEl = document.getElementById("wishlist-container");
      if (!usernameEl || !wishlistEl) return;
  
      usernameEl.textContent = data.username;
  
      wishlistEl.innerHTML = ""; // Clear existing content
      data.wishlist.forEach(item => {
        wishlistEl.innerHTML += `
          <div class="recipe-card">
            <div class="recipe-info">
              <h3>${item.title}</h3>
              <ul>
                ${item.ingredients.map(ing => `<li>${ing}</li>`).join("")}
              </ul>
            </div>
          </div>
        `;
      });
    } catch (err) {
      console.error("⚠️ Error loading dashboard:", err);
      alert("Something went wrong while loading your dashboard.");
    }
  });
  

  //log-in | logout changes


  document.addEventListener("DOMContentLoaded", () => {
    const authContainer = document.getElementById("auth-container");
    const token = localStorage.getItem("token");

    if (token) {
      // User is logged in
      authContainer.innerHTML = `
        <button onclick="window.location.href='/profile'" class="auth-button signin">Dashboard</button>
        <div class="auth-divider"></div>
        <button onclick="logout()" class="auth-button signup">Sign Out</button>
      `;
    } else {
      // Not logged in
      authContainer.innerHTML = `
        <button onclick="window.location.href='/signin'" class="auth-button signin">Sign In</button>
        <div class="auth-divider"></div>
        <button onclick="window.location.href='/signup'" class="auth-button signup">Sign Up</button>
      `;
    }
  });



  // Reuse logout logic
  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

