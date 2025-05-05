document.getElementById('fetch-btn').addEventListener('click', fetchAnime);

function fetchAnime() {
  const year = document.getElementById('year-select').value;
  const genreName = document.getElementById('genre-select').value;
  const format = document.getElementById('format-select').value;

  // Genre mapping from name to Jikan ID
  const genreMap = {
    "Action": 1,
    "Adventure": 2,
    "Comedy": 4,
    "Drama": 8,
    "Ecchi": 9,
    "Fantasy": 10,
    "Hentai": 12,
    "Horror": 14,
    "Mahou Shoujo": 16,
    "Mecha": 18,
    "Music": 19,
    "Mystery": 7,
    "Psychological": 40,
    "Romance": 22,
    "Sci-Fi": 24,
    "Slice of Life": 36,
    "Sports": 30,
    "Supernatural": 37,
    "Thriller": 41
  };

  const genreId = genreMap[genreName];
  let url = `https://api.jikan.moe/v4/anime?limit=20&order_by=popularity&start_date=2024-01-01&end_date=2024-12-31`;


  if (year) {
    url += `&start_date=${year}-01-01&end_date=${year}-12-31`;
  }

  if (format) {
    url += `&type=${format.toLowerCase()}`;
  }

  if (genreId) {
    url += `&genres=${genreId}`;
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
    <div class="anime-popup">
      <h3>${anime.title_english || anime.title}</h3>
      <p><strong>Description:</strong> ${anime.synopsis ? anime.synopsis.substring(0, 200) + "..." : 'No description available.'}</p>
      <p><strong>Rating:</strong> ${anime.rating || 'N/A'}</p>
      <p><strong>Status:</strong> ${anime.status || 'Unknown'}</p>
      <p><strong>Genre:</strong> ${anime.genres ? anime.genres.map(g => g.name).join(', ') : 'Unknown'}</p>
      <p><strong>Aired:</strong> ${anime.aired && anime.aired.string ? anime.aired.string : 'Unknown'}</p>
    </div>
  </a>
`;



        list.appendChild(card);
      });
    })
    .catch(console.error);
}


// Optional: fetch default anime on first load
fetchAnime();

let currentPage = 1;
let currentSearchTerm = '';

document.getElementById('search-btn').addEventListener('click', () => {
  currentPage = 1;
  currentSearchTerm = document.getElementById('search-input').value.trim();
  if (!currentSearchTerm) return;
  searchAnime(currentSearchTerm, currentPage, true);
});

document.getElementById('load-more-btn').addEventListener('click', () => {
  currentPage++;
  searchAnime(currentSearchTerm, currentPage, false);
});

function searchAnime(term, page, isNewSearch) {
  const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(term)}&limit=20&page=${page}&order_by=popularity`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('anime-list');
      if (isNewSearch) list.innerHTML = '';

      if (!data.data || data.data.length === 0) {
        if (isNewSearch) list.innerHTML = '<p>No results found.</p>';
        document.getElementById('load-more-btn').style.display = 'none';
        return;
      }

      data.data.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
  <a href="anime-details.html?id=${anime.mal_id}">
    <img src="${anime.images.jpg.image_url}" alt="${anime.title_english || anime.title}">
    <h2>${anime.title_english || anime.title}</h2>
    <div class="anime-popup">
      <h3>${anime.title_english || anime.title}</h3>
      <p><strong>Description:</strong> ${anime.synopsis ? anime.synopsis.substring(0, 200) + "..." : 'No description available.'}</p>
      <p><strong>Rating:</strong> ${anime.rating || 'N/A'}</p>
      <p><strong>Status:</strong> ${anime.status || 'Unknown'}</p>
      <p><strong>Genre:</strong> ${anime.genres ? anime.genres.map(g => g.name).join(', ') : 'Unknown'}</p>
      <p><strong>Aired:</strong> ${anime.aired && anime.aired.string ? anime.aired.string : 'Unknown'}</p>
    </div>
  </a>
`;


        list.appendChild(card);
      });

      // Show or hide the Load More button
      document.getElementById('load-more-btn').style.display = data.pagination?.has_next_page ? 'inline-block' : 'none';
    })
    .catch(console.error);
}


// Menu Bar Start //
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('nav-links').classList.toggle('active');
});
// Menu Bar End //

// Anime Card Popup Start //
document.addEventListener("mouseover", function (e) {
  const card = e.target.closest(".anime-card");
  if (!card) return;

  const popup = card.querySelector(".anime-popup");
  if (!popup) return;

  // Reset alignment
  popup.classList.remove("left-align", "right-align");

  // Temporarily show for measurement
  popup.style.display = "block";
  const popupRect = popup.getBoundingClientRect();
  const viewportWidth = window.innerWidth;

  if (popupRect.right > viewportWidth) {
    popup.classList.add("right-align");
  } else if (popupRect.left < 0) {
    popup.classList.add("left-align");
  }

  popup.style.display = ""; // Hide again until hover
});
// Anime Card Popup End //
