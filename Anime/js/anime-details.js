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

      // ==============================
      // Fetch AniList ID
      // ==============================
      fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          query: `
            query ($search: String) {
              Media(search: $search, type: ANIME) {
                id
                title {
                  romaji
                  english
                }
              }
            }
          `,
          variables: { search: displayTitle }
        })
      })
      .then(res => res.json())
      .then(anilistData => {
        if (anilistData.data && anilistData.data.Media) {
          window.anilistId = anilistData.data.Media.id;
          console.log("AniList ID:", window.anilistId);
        }
      })
      .catch(err => console.error("AniList fetch error:", err));

      // ==============================
      // Fetch TMDB data
      // ==============================
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
        .catch(err => console.error("TMDB fetch error:", err));

      // ==============================
      // Main container HTML
      // ==============================
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
              <option value="videasy-v1">Server 3 Ads</option>
              <option value="vidsrc-icu">Server 4</option>
              <option value="vidsrc-co">Server 5</option>
              <option value="videasy-v2">Server 6 Ads</option>
              <option value="vidjoy">Server 7</option>
              <option value="vidsrc-v3">Server 8</option>
              <option value="hexa">Server 9</option>
              <option value="apimocine">Server 10</option>
              <option value="vidplus">Server 11</option>
              <option value="vidrock">Server 12 Ads</option>
              <option value="vidfast">Server 13 Ads</option>
              <option value="111movies">Server 14 Ads</option>
              <option value="vidlink">Server 15 Ads</option>
              <option value="vidsrc-net">Server 16 Ads</option>
              <option value="embed-api">Server 17 Ads</option>
              <option value="moviesapi">Server 18 Ads</option>
            </select>
          </label>

          <button id="sandbox-toggle" style="background:green;color:white;border-radius:5px;padding:6px 12px;cursor:pointer;">
            Sandbox: ON
          </button>
        </div>

        <p style="color: red; font-weight: bold;"> NOTE: If current server is not working, Please change server! </p>

        <iframe id="stream-frame" src="" width="100%" height="500" allowfullscreen allow="autoplay; encrypted-media"></iframe>
      `;

      // ==============================
      // Streaming setup
      // ==============================
      function updateStream() {
        const ep = document.getElementById('episode-select').value;
        const dub = document.getElementById('dub-select').value;
        const provider = document.getElementById('provider-select').value;
        const frame = document.getElementById('stream-frame');
        const sandboxBtn = document.getElementById("sandbox-toggle");

        let src = "";

        switch (provider) {
          case "vidsrc":
            src = `https://vidsrc.cc/v2/embed/anime/${anime.mal_id}/${ep}/${dub === "true" ? "dub" : "sub"}?autoPlay=true`;
            break;
          case "vidsrc-tv":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://vidsrc.cc/v2/embed/tv/${window.tmdbId}/1/${ep}?autoPlay=true`;
            break;
          case "videasy-v1":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://player.videasy.net/tv/${window.tmdbId}/1/${ep}${dub === "true" ? "?dub=true" : ""}`;
            break;
          case "vidsrc-icu":
            src = `https://vidsrc.icu/embed/anime/${anime.mal_id}/${ep}/${dub === "true" ? "1" : "0"}/1`;
            break;
          case "vidsrc-co":
            src = `https://player.vidsrc.co/embed/anime/${anime.mal_id}/${ep}?dub=${dub}&autoplay=true&autonext=true`;
            break;
          case "videasy-v2":
            if (!window.anilistId) return console.warn("AniList ID not loaded yet.");
            src = `https://player.videasy.net/anime/${window.anilistId}/${ep}${dub === "true" ? "?dub=true" : ""}`;
            break;
          case "vidjoy":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://vidjoy.pro/embed/tv/${window.tmdbId}/1/${ep}`;
            break;
          case "vidsrc-v3":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://vidsrc.cc/v3/embed/tv/${window.tmdbId}/1/${ep}`;
            break;
          case "hexa":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://hexa.watch/watch/tv/${window.tmdbId}/1/${ep}`;
            break;
          case "apimocine":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://apimocine.vercel.app/tv/${window.tmdbId}/1/${ep}`;
            break;
          case "vidplus":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://player.vidplus.to/embed/tv/${window.tmdbId}/1/${ep}`;
            break;
          case "vidrock":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://vidrock.net/tv/${window.tmdbId}/1/${ep}`;
            break;
          case "vidfast":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://vidfast.pro/tv/${window.tmdbId}/1/${ep}`;
            break;
          case "111movies":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://111movies.com/tv/${window.tmdbId}/1/${ep}`;
            break;
          case "vidlink":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://vidlink.pro/tv/${window.tmdbId}/1/${ep}`;
            break;
          case "vidsrc-net":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://vidsrc.net/embed/tv/${window.tmdbId}/1/${ep}`;
            break;
          case "embed-api":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://player.embed-api.stream/?id=${window.tmdbId}&s=1&e=${ep}`;
            break;
          case "moviesapi":
            if (!window.tmdbId) return console.warn("TMDB ID not loaded yet.");
            src = `https://moviesapi.to/tv/${window.tmdbId}-1-${ep}`;
            break;
        }

        sandboxEnabled = true;
        sandboxBtn.textContent = "Sandbox: ON";
        sandboxBtn.style.background = "green";

        frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
        frame.src = src;
      }

// ==============================
// Event Listeners
// ==============================      
      document.getElementById('episode-select').addEventListener('change', updateStream);
      document.getElementById('dub-select').addEventListener('change', updateStream);
      document.getElementById('provider-select').addEventListener('change', updateStream);

// ==============================
// Sandbox Toggle
// ==============================      
      setTimeout(() => {
        const sandboxBtn = document.getElementById("sandbox-toggle");
        const frame = document.getElementById("stream-frame");
        sandboxBtn.addEventListener("click", () => {
          sandboxEnabled = !sandboxEnabled;
          if (sandboxEnabled) {
            sandboxBtn.textContent = "Sandbox: ON";
            sandboxBtn.style.background = "green";
            frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
          } else {
            sandboxBtn.textContent = "Sandbox: OFF";
            sandboxBtn.style.background = "red";
            frame.removeAttribute("sandbox");
          }
          frame.src = frame.src;
        });
      }, 200);

      updateStream();
    })
    .catch(err => {
      console.error("Anime fetch error:", err);
      container.innerHTML = `<p>Failed to load anime details. Please try again later.</p>`;
    });
}

// ==============================
// Menu Bar
// ==============================
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('nav-links').classList.toggle('active');
});
