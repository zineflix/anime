document.getElementById('fetch-btn').addEventListener('click', fetchAnime);

function fetchAnime() {
  const yearValue = document.getElementById('year-select').value;
const year = yearValue ? parseInt(yearValue) : null;

  const genre = document.getElementById('genre-select').value;


  let variables = {
  seasonYear: year,
  perPage: 20,
  genre: genre || null,
};

  const query = `
  query ($season: MediaSeason, $seasonYear: Int, $genre: String, $perPage: Int) {
    Page(perPage: $perPage) {
      media(season: $season, seasonYear: $seasonYear, genre: $genre, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        description(asHtml: false)
      }
    }
  }`;

  fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('anime-list');
    list.innerHTML = ''; // Clear old content

    if (data.data.Page.media.length === 0) {
      list.innerHTML = '<p>No results found.</p>';
      return;
    }

    data.data.Page.media.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'anime-card';
      card.innerHTML = `
  <a href="anime-details.html?id=${anime.id}" style="color: inherit; text-decoration: none;">
    <img src="${anime.coverImage.large}" alt="${anime.title.english || anime.title.romaji}">
    <h2>${anime.title.english || anime.title.romaji}</h2>
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

  const query = `
  query ($search: String) {
    Page(perPage: 20) {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        description(asHtml: false)
      }
    }
  }`;

  fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { search: searchTerm } })
  })
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('anime-list');
    list.innerHTML = '';
    data.data.Page.media.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'anime-card';
      card.innerHTML = `
        <a href="anime-details.html?id=${anime.id}">
          <img src="${anime.coverImage.large}" alt="${anime.title.english || anime.title.romaji}">
          <h2>${anime.title.english || anime.title.romaji}</h2>
        </a>
        <p>${anime.description?.slice(0, 120) || 'No description'}...</p>
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
