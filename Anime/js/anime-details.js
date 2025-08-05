const params = new URLSearchParams(window.location.search);
const animeId = params.get("id");
const container = document.getElementById("anime-detail");

if (!animeId) {
  container.innerHTML = "<p>No anime ID provided.</p>";
} else {
  fetch(`https://api.jikan.moe/v4/anime/${animeId}`)
    .then(res => res.json())
    .then(data => {
      const anime = data.data;
      let maxEpisodes = anime.episodes && anime.status !== "Currently Airing"
        ? anime.episodes
        : 1500;

      const displayTitle = anime.title_english || anime.title;

      container.innerHTML = `
        <div class="anime-content">
          <div class="anime-image">
            <img src="${anime.images.jpg.large_image_url}" alt="${displayTitle}">
          </div>
          <div class="anime-info">
            <h1 class="anime-title">${displayTitle}</h1>
            <div class="anime-description">
              <div id="description" class="collapsed">
                <p>${anime.synopsis || "No description available."}</p>
              </div>
              <button id="read-more">Read More</button>
            </div>
          </div>
        </div>
        <h2>Watch Anime</h2>
        <div class="controls">
          <label>Episode:
            <select id="episode-select">
              ${Array.from({ length: maxEpisodes }, (_, i) =>
                `<option value="${i+1}">Episode ${i+1}</option>`
              ).join('')}
            </select>
          </label>
          <label>Dub:
            <select id="dub-select">
              <option value="false">Sub</option>
              <option value="true">Dub</option>
            </select>
          </label>
          <label>Provider:
            <select id="provider-select">
              <option value="vidsrc" selected>Server 1</option>
              <option value="vidsrc-tv">Server 2</option>
              <option value="videasy-v1">Server 3</option>
              <option value="vidsrc-icu">Server 4</option>
              <option value="vidsrc-co">Server 5</option>
              <option value="videasy-v2">Server 6</option>
            </select>
          </label>
        </div>
        <p style="color: red; font-weight: bold;">
          NOTE: If current server is not working, Please change server!
        </p>
        <iframe id="stream-frame" src="" width="100%" height="500"
                allowfullscreen allow="autoplay; encrypted-media"
                sandbox="allow-scripts allow-same-origin"></iframe>
      `;

      setupDescriptionToggle();
      setupStreamControls(anime, displayTitle);
      lookupSeasons(anime);
    })
    .catch(err => {
      console.error("Anime fetch error:", err);
      container.innerHTML = `<p>Failed to load anime details. Please try again later.</p>`;
    });
}

// --- Stream logic & controls ---
function setupStreamControls(anime, displayTitle) {
  const epSelect = document.getElementById('episode-select');
  const dubSelect = document.getElementById('dub-select');
  const providerSelect = document.getElementById('provider-select');

  fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(displayTitle)}&api_key=YOUR_TMDB_API_KEY`)
    .then(res => res.json())
    .then(tmdbData => {
      if (tmdbData.results?.length) {
        const tmdbId = tmdbData.results[0].id;
        window.tmdbId = tmdbId;
      } else {
        console.warn("No TMDB match found for", displayTitle);
      }
      updateStream();
    })
    .catch(err => console.error("TMDB fetch error:", err));

  epSelect.addEventListener('change', updateStream);
  dubSelect.addEventListener('change', updateStream);
  providerSelect.addEventListener('change', updateStream);
}

function updateStream() {
  const ep = document.getElementById('episode-select').value;
  const dub = document.getElementById('dub-select').value;
  const provider = document.getElementById('provider-select').value;
  const frame = document.getElementById('stream-frame');

  let src = "";
  if (provider === "vidsrc") {
    if (!window.tmdbId) {
      console.warn("Waiting for TMDB ID before initiating vidsrc.");
      return;
    }
    src = `https://vidsrc.cc/v2/embed/tv/${window.tmdbId}/1/${ep}?autoPlay=true`;
  } else if (provider === "vidsrc-tv") {
    const type = dub === "true" ? "dub" : "sub";
    src = `https://vidsrc.cc/v2/embed/anime/ani${animeId}/${ep}/${type}?autoPlay=true`;
  } else if (provider === "videasy-v1") {
    if (!window.tmdbId) {
      console.warn("Waiting for TMDB ID before initiating Videasy‑v1.");
      return;
    }
    const query = dub === "true" ? "?dub=true" : "";
    src = `https://player.videasy.net/tv/${window.tmdbId}/1/${ep}${query}`;
  } else if (provider === "vidsrc-icu") {
    const dubFlag = dub === "true" ? "1" : "0";
    src = `https://vidsrc.icu/embed/anime/${animeId}/${ep}/${dubFlag}/1`;
  } else if (provider === "vidsrc-co") {
    src = `https://player.vidsrc.co/embed/anime/${animeId}/${ep}?dub=${dub}&autoplay=true&autonext=true&nextbutton=true&poster=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&fontcolor=FFFFFF&fontsize=16px&opacity=0.5&font=Poppins`;
  } else if (provider === "videasy-v2") {
    const query = dub === "true" ? "?dub=true" : "";
    src = `https://player.videasy.net/anime/${animeId}/${ep}${query}`;
  }

  frame.src = src;
}

// --- Details expansion toggle ---
function setupDescriptionToggle() {
  const btn = document.getElementById('read-more');
  const desc = document.getElementById('description');
  btn.addEventListener('click', () => {
    desc.classList.toggle('collapsed');
    btn.textContent = desc.classList.contains('collapsed') ? 'Read More' : 'Show Less';
  });
}

// --- Season lookup logic ---
function lookupSeasons(anime) {
  const displayTitle = anime.title_english || anime.title;
  fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(displayTitle)}&limit=20`)
    .then(res => res.json())
    .then(searchResults => {
      const seasonCand = searchResults.data.filter(item =>
        item.title.includes(anime.title.split(" ")[0]) &&
        item.type === "TV" &&
        item.mal_id !== anime.mal_id
      );

      if (seasonCand.length) {
        const label = document.createElement('label');
        label.textContent = "Season: ";
        const select = document.createElement('select');
        select.id = 'season-select';
        select.innerHTML = `<option value="${anime.mal_id}" selected>${displayTitle} (This Season)</option>`;
        seasonCand.forEach(s => {
          select.innerHTML += `<option value="${s.mal_id}">${s.title}</option>`;
        });

        select.addEventListener('change', e => {
          window.location.href = `anime-details.html?id=${e.target.value}`;
        });
        document.querySelector('.controls').prepend(label);
        label.appendChild(select);
      }
    })
    .catch(err => console.warn("Season lookup failed:", err));
}

// --- Menu toggle (unchanged) ---
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('nav-links').classList.toggle('active');
});
