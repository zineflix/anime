const params = new URLSearchParams(window.location.search);
const animeId = params.get("id");
const container = document.getElementById("anime-detail");

let maxEpisodes = 1;
let sandboxEnabled = true; // ✅ global sandbox state

if (!animeId) {
  container.innerHTML = "<p>No anime ID provided.</p>";
} else {
  fetch(`https://api.jikan.moe/v4/anime/${animeId}`)
    .then(res => res.json())
    .then(data => {
      const anime = data.data;
      if (!anime.episodes || anime.status === "Currently Airing") {
        maxEpisodes = 1500;
      } else {
        maxEpisodes = anime.episodes;
      }

      const displayTitle = anime.title_english || anime.title;

      // Fetch similar anime titles (seasons)
      fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(displayTitle)}&limit=20`)
        .then(res => res.json())
        .then(searchResults => {
          const seasonCandidates = searchResults.data.filter(item =>
            item.title.includes(anime.title.split(" ")[0]) &&
            item.type === "TV" &&
            item.mal_id !== anime.mal_id
          );

          if (seasonCandidates.length > 0) {
            const seasonSelect = document.createElement('select');
            seasonSelect.innerHTML = `<option disabled selected>Select Season</option>`;
            seasonSelect.style.margin = '10px';
            seasonSelect.id = 'season-select';

            seasonSelect.innerHTML += `<option value="${anime.mal_id}">${displayTitle} (This Season)</option>`;
            seasonCandidates.forEach(entry => {
              seasonSelect.innerHTML += `<option value="${entry.mal_id}">${entry.title}</option>`;
            });

            const controlsContainer = document.querySelector('.controls');
            const label = document.createElement('label');
            label.innerHTML = "Season: ";
            label.appendChild(seasonSelect);
            controlsContainer.prepend(label);

            seasonSelect.addEventListener('change', (e) => {
              const newId = e.target.value;
              window.location.href = `anime-details.html?id=${newId}`;
            });
          }
        })
        .catch(err => {
          console.warn("Season lookup failed:", err);
        });

      // Fetch TMDB data
      fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(displayTitle)}&api_key=af59fdb730165a736ec8fbe30912caaf`)
        .then(res => res.json())
        .then(tmdbData => {
          if (tmdbData.results && tmdbData.results.length > 0) {
            const tmdbAnime = tmdbData.results[0];
            const tmdbId = tmdbAnime.id;
            window.tmdbId = tmdbId;

            const tmdbRating = tmdbAnime.vote_average;
            const infoBox = document.querySelector(".anime-info");
            infoBox.innerHTML += `<p><strong>TMDB Rating:</strong> ${tmdbRating}</p>`;
          }
        })
        .catch(err => {
          console.error("TMDB fetch error:", err);
        });

      // Main container
      container.innerHTML = `
        <div class="anime-content">
          <div class="anime-image">
            <image src="${anime.images.jpg.large_image_url}" alt="${displayTitle}">
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
          <label>
            Episode:
            <select id="episode-select">
              ${Array.from({ length: maxEpisodes }, (_, i) => `<option value="${i+1}">Episode ${i+1}</option>`).join('')}
            </select>
          </label>

          <label>
            Dub:
            <select id="dub-select">
              <option value="false">Sub</option>
              <option value="true">Dub</option>
            </select>
          </label>

          <label>
            Provider:
            <select id="provider-select">
              <option value="vidsrc" selected>Server 1</option>
              <option value="vidsrc-tv">Server 2</option>
              <option value="videasy-v1">Server 3</option>
              <option value="vidsrc-icu">Server 4</option>
              <option value="vidsrc-co">Server 5</option>
              <option value="videasy-v2">Server 6</option>
            </select>
          </label>

          <button id="sandbox-toggle" style="background:green;color:white;border-radius:5px;padding:6px 12px;cursor:pointer;">
            Sandbox: ON
          </button>
        </div>
        
        <p style="color: red; font-weight: bold;"> NOTE: If current server is not working, Please change server! </p>

        <iframe id="stream-frame" src="" width="100%" height="500" allowfullscreen allow="autoplay; encrypted-media"></iframe>
      `;

      // Streaming setup
      function updateStream() {
        const ep = document.getElementById('episode-select').value;
        const dub = document.getElementById('dub-select').value;
        const provider = document.getElementById('provider-select').value;
        const frame = document.getElementById('stream-frame');
        const sandboxBtn = document.getElementById("sandbox-toggle");

        let src = "";

        if (provider === "vidsrc") {
          const subType = dub === "true" ? "dub" : "sub";
          src = `https://vidsrc.cc/v2/embed/anime/ani${anime.mal_id}/${ep}/${subType}?autoPlay=true`;
        } 
        else if (provider === "vidsrc-tv") {
          if (!window.tmdbId) {
            frame.src = "";
            console.warn("TMDB ID not loaded yet for vidsrc-tv.");
            return;
          }
          src = `https://vidsrc.cc/v2/embed/tv/${window.tmdbId}/1/${ep}?autoPlay=true`;
        } 
        else if (provider === "videasy-v1") {
          if (!window.tmdbId) {
            frame.src = "";
            console.warn("TMDB ID not loaded yet for Videasy.");
            return;
          }
          src = `https://player.videasy.net/tv/${window.tmdbId}/1/${ep}${dub === "true" ? "?dub=true" : ""}`;
        } 
        else if (provider === "vidsrc-icu") {
          const dubFlag = dub === "true" ? "1" : "0";
          src = `https://vidsrc.icu/embed/anime/${anime.mal_id}/${ep}/${dubFlag}/1`;
        } 
        else if (provider === "vidsrc-co") {
          src = `https://player.vidsrc.co/embed/anime/${anime.mal_id}/${ep}?dub=${dub}&autoplay=true&autonext=true`;
        } 
        else if (provider === "videasy-v2") {
          src = `https://player.videasy.net/anime/${anime.mal_id}/${ep}${dub === "true" ? "?dub=true" : ""}`;
        }

        // ✅ Always reset sandbox to ON when switching server/episode/dub
        sandboxEnabled = true;
        sandboxBtn.textContent = "Sandbox: ON";
        sandboxBtn.style.background = "green";

        frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
        frame.src = src;
      }

      // Read more toggle
      setTimeout(() => {
        const readMoreBtn = document.getElementById('read-more');
        const description = document.getElementById('description');
        if (readMoreBtn && description) {
          readMoreBtn.addEventListener('click', () => {
            description.classList.toggle('collapsed');
            readMoreBtn.textContent = description.classList.contains('collapsed') ? 'Read More' : 'Show Less';
          });
        }
      }, 100);

      // Event listeners
      document.getElementById('episode-select').addEventListener('change', updateStream);
      document.getElementById('dub-select').addEventListener('change', updateStream);
      document.getElementById('provider-select').addEventListener('change', updateStream);

      // Sandbox toggle
      setTimeout(() => {
        const sandboxBtn = document.getElementById("sandbox-toggle");
        const frame = document.getElementById("stream-frame");
        if (sandboxBtn && frame) {
          sandboxBtn.addEventListener("click", () => {
            sandboxEnabled = !sandboxEnabled; // flip state
            if (sandboxEnabled) {
              sandboxBtn.textContent = "Sandbox: ON";
              sandboxBtn.style.background = "green";
              frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
            } else {
              sandboxBtn.textContent = "Sandbox: OFF";
              sandboxBtn.style.background = "red";
              frame.removeAttribute("sandbox");
            }
            frame.src = frame.src; // refresh iframe to apply
          });
        }
      }, 200);

      updateStream(); // Initial call
    })
    .catch(err => {
      console.error("Anime fetch error:", err);
      container.innerHTML = `<p>Failed to load anime details. Please try again later.</p>`;
    });
}

// Menu Bar
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('nav-links').classList.toggle('active');
});
