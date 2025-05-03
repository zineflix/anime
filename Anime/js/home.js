document.getElementById('fetch-btn').addEventListener('click', fetchAnime);

function fetchAnime() {
  const year = document.getElementById('year-select').value;
  const genre = document.getElementById('genre-select').value;

  let url = `https://api.jikan.moe/v4/anime?order_by=popularity&sort=desc&limit=20`;

  if (year) {
    url += `&start_date=${year}-01-01&end_date=${year}-12-31`;
  }

  if (genre) {
    url += `&genres=${genre}`;
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('anime-list');
      list.innerHTML = '';

      if (!data.data || data.data.length === 0) {
        list.innerHTML = '<p>No results found.</p>';
        return;
      }

      data.data.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
          <a href="anime-details.html?id=${anime.mal_id}">
            <img src="${anime.images.jpg.image_url}" alt="${anime.title_english || anime.title}">
            <h2>${anime.title_english || anime.title}</h2>
          </a>
        `;
        list.appendChild(card);
      });
    })
    .catch(console.error);
}


// Optional: fetch default anime on first load
fetchAnime();

document.getElementById('search-btn').addEventListener('click', () => {
  const searchTerm = document.getElementById('search-input').value.trim();
  if (!searchTerm) return;

  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTerm)}&limit=20&order_by=popularity`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('anime-list');
      list.innerHTML = '';

      data.data.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
          <a href="anime-details.html?id=${anime.mal_id}">
            <img src="${anime.images.jpg.image_url}" alt="${anime.title_english || anime.title}">
            <h2>${anime.title_english || anime.title}</h2>
            <p>${anime.synopsis?.slice(0, 120) || 'No description'}...</p>
          </a>
        `;
        list.appendChild(card);
      });
    })
    .catch(console.error);
});



// For Responsive Header
window.addEventListener("scroll", function () {
    let nav = document.querySelector("nav");
    if (window.scrollY > 50) {
        nav.classList.add("nav-solid"); // Solid color after scrolling down
    } else {
        nav.classList.remove("nav-solid"); // Transparent at the top
    }
});

// For sticky header when scrolling
    window.addEventListener("scroll", function () {
      let nav = document.querySelector("nav");
      if (window.scrollY > 50) {
        nav.classList.add("nav-solid"); // Add solid background when scrolled
      } else {
        nav.classList.remove("nav-solid"); // Remove solid background at top
      }
    });

    // Toggle menu visibility when menu button is clicked
document.getElementById("menu-btn").addEventListener("click", function() {
    document.getElementById("menu").classList.toggle("active");
});


// For Dropdown More Button Function Start
document.addEventListener("DOMContentLoaded", function () {
    const dropdown = document.querySelector(".dropdown");

    dropdown.addEventListener("click", function () {
        this.classList.toggle("active");
    });
});
// For Dropdown More Button Function End
