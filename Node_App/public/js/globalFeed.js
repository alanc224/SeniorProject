





  const token = localStorage.getItem("token");


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


  async function submitPost() {
    const content = document.getElementById("postContent").value.trim();
    if (!content) return alert("Post content cannot be empty.");

    const res = await fetch("/globalFeed/api/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById("postContent").value = "";
      loadFeed(); // refresh posts
    } else {
      alert("Failed to post. Try again.");
    }
  }

async function loadFeed() {
  const userRes = await fetch("/dashboard/api/dashboard", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const userData = await userRes.json();
  const currentUser = userData.username;

  const res = await fetch("/globalFeed/api/posts"); // ✅ fetch posts
  const posts = await res.json();

  const container = document.getElementById("feedContainer");
  container.innerHTML = ""; // clear current

  posts.forEach(post => {
    const isOwner = post.userName === currentUser;

    const postDiv = document.createElement("div");
    postDiv.className = "feed-post";
    postDiv.innerHTML = `
      <div class="post-header">
        <img class="feed-pfp" src="../images/default.png" alt="User">
        <div class="post-body">
          <div class="post-info">
            <span class="username">${post.userName}</span>
            <div class="post-content">${post.content}</div>
            <span class="timestamp">${new Date(post.timestamp).toLocaleDateString()}</span>
          </div>
          <div class="post-actions">
            <button onclick="likePost('${post._id}')">👍 Like (${post.likes.length})</button>
            ${isOwner ? `<button onclick="deletePost('${post._id}')">🗑️ Delete</button>` : ""}
          </div>
        </div>
      </div>
    `;
    container.appendChild(postDiv);
  });
}

  window.addEventListener("DOMContentLoaded", loadFeed);



  async function likePost(postId) {
  const res = await fetch(`/globalFeed/api/like/${postId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.success) loadFeed();
}

async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return;

  const res = await fetch(`/globalFeed/api/post/${postId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.success) loadFeed();
}


