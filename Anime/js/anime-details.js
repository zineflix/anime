const params = new URLSearchParams(window.location.search);
const animeId = params.get("id");
const container = document.getElementById("anime-detail");

let maxEpisodes = 1;

if (!animeId) {
  container.innerHTML = "<p>No anime ID provided.</p>";
} else {
  fetch(`https://api.jikan.moe/v4/anime/${animeId}`)
    .then(res => res.json())
    .then(data => {
      const anime = data.data;
      if (!anime.episodes || anime.status === "Currently Airing") {
  maxEpisodes = 1500; // or some higher guess value
} else {
  maxEpisodes = anime.episodes;
}
      const episodeSelect = document.createElement('select');
      episodeSelect.id = "episode-select";
      for (let i = 1; i <= maxEpisodes; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Episode ${i}`;
        episodeSelect.appendChild(option);
      }

      const displayTitle = anime.title_english || anime.title;

// Fetch similar anime titles from Jikan to find other seasons
fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(displayTitle)}&limit=20`)
  .then(res => res.json())
  .then(searchResults => {
    const seasonCandidates = searchResults.data.filter(item =>
      item.title.includes(anime.title.split(" ")[0]) &&  // loosely match first word of title
      item.type === "TV" &&                               // only TV series
      item.mal_id !== anime.mal_id                        // exclude current anime
    );

    if (seasonCandidates.length > 0) {
      const seasonSelect = document.createElement('select');
      seasonSelect.innerHTML = `<option disabled selected>Select Season</option>`;
      seasonSelect.style.margin = '10px';
      seasonSelect.id = 'season-select';

      // Add current season as well
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

// JIKAN ANIME FETCH END //      

// Fetch TMDB data using title
fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(displayTitle)}&api_key=af59fdb730165a736ec8fbe30912caaf`)
  .then(res => res.json())
  .then(tmdbData => {
    if (tmdbData.results && tmdbData.results.length > 0) {
      const tmdbAnime = tmdbData.results[0];
      const tmdbId = tmdbAnime.id;

// Store globally if needed
window.tmdbId = tmdbId;

// You may also fetch seasons info if needed

      // Optional: You could choose the most accurate match using more filters

      // Append TMDB info
      const tmdbRating = tmdbAnime.vote_average;
      const tmdbPoster = tmdbAnime.poster_path
        ? `https://image.tmdb.org/t/p/w500${tmdbAnime.poster_path}`
        : null;

      const infoBox = document.querySelector(".anime-info");
      if (tmdbPoster) {
        infoBox.innerHTML += `<img src="${tmdbPoster}" alt="TMDB Poster" style="width:100px;border-radius:10px;">`;
      }
      infoBox.innerHTML += `<p><strong>TMDB Rating:</strong> ${tmdbRating}</p>`;
    }
  })
  .catch(err => {
    console.error("TMDB fetch error:", err);
  });
      

      container.innerHTML = `
    
        <div class="anime-content">
          <div class="anime-image">
            <image src="${anime.images.jpg.large_image_url}" alt="${displayTitle}">
          </div>
          <div class="anime-info">
            <h1 class="anime-title">${displayTitle}</h1>
            <div class="anime-description">
              <p id="description" class="collapsed">${anime.synopsis || "No description available."}</p>
              <button id="read-more">Read More</button>
            </div>
          </div>
        </div>

        <h2>Watch Anime</h2>
        
        <div class="controls">
          <label>
            Episode:
            <select id="episode-select">
              ${Array.from({length: maxEpisodes}, (_, i) => `<option value="${i+1}">Episode ${i+1}</option>`).join('')}
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
              <option value="vidsrc" selected>VidSrc</option>
              <option value="tmdb">TMDB (via Vidsrc)</option>
              <option value="videasy-v1">Videasy v1</option>
              <option value="vidsrc-icu">VidSrc ICU</option>
              <option value="vidsrc-co">VidSrc CO</option>
              <option value="videasy-v2">Videasy v2</option>
            </select>
          </label>
        </div>

        <iframe id="stream-frame" src="" width="100%" height="500" allowfullscreen allow="autoplay; encrypted-media" sandbox="allow-scripts allow-same-origin"></iframe>
      `;

      
      // Streaming setup
      function updateStream(providerIndex = 0) {
  const ep = document.getElementById('episode-select').value;
  const dub = document.getElementById('dub-select').value;
  const frame = document.getElementById('stream-frame');

  const providers = [
    "vidsrc",
    "tmdb",
    "videasy-v1",
    "vidsrc-icu",
    "vidsrc-co",
    "videasy-v2"
  ];

  if (providerIndex >= providers.length) {
    frame.src = "";
    console.warn("All providers failed to load.");
    return;
  }

  const provider = providers[providerIndex];
  let src = "";

  try {
  if (provider === "vidsrc") {
    const subType = dub === "true" ? "dub" : "sub";
    src = `https://vidsrc.cc/v2/embed/anime/ani${anime.mal_id}/${ep}/${subType}?autoPlay=true`;
  } else if (provider === "tmdb") {
    if (!window.tmdbId) throw "TMDB ID not loaded";
    src = `https://vidsrc.cc/v2/embed/tv/${window.tmdbId}/1/${ep}?autoPlay=true`;
  } else if (provider === "videasy-v1") {
    if (!window.tmdbId) throw "TMDB ID not loaded for Videasy v1";
    src = `https://player.videasy.net/tv/${window.tmdbId}/1/${ep}${dub === "true" ? "?dub=true&autoplay=true" : "?autoplay=true"}`;
  } else if (provider === "vidsrc-icu") {
    const dubFlag = dub === "true" ? "1" : "0";
    src = `https://vidsrc.icu/embed/anime/${anime.mal_id}/${ep}/${dubFlag}/1?autoplay=true`;
  } else if (provider === "vidsrc-co") {
    src = `https://player.vidsrc.co/embed/anime/${anime.mal_id}/${ep}?dub=${dub}&autoplay=true`;
  } else if (provider === "videasy-v2") {
    src = `https://player.videasy.net/anime/${anime.mal_id}/${ep}${dub === "true" ? "?dub=true&autoplay=true" : "?autoplay=true"}`;
  }
} catch (error) {
  console.error("Error setting video source:", error);
}


    // Set the iframe source
    frame.src = src;

    // Try loading and switch if it fails
    frame.onload = () => {
      if (frame.contentWindow.length === 0) {
        console.warn(`Provider ${provider} failed to load. Trying next...`);
        updateStream(providerIndex + 1);
      }
    };

    frame.onerror = () => {
      console.warn(`Error loading from ${provider}. Switching...`);
      updateStream(providerIndex + 1);
    };
  } catch (err) {
    console.warn(err);
    updateStream(providerIndex + 1);
  }
}


      const readMoreBtn = document.getElementById('read-more');
      const description = document.getElementById('description');

      readMoreBtn.addEventListener('click', () => {
        description.classList.toggle('collapsed');
        readMoreBtn.textContent = description.classList.contains('collapsed') ? 'Read More' : 'Show Less';
      });



      // Attach event listeners
      document.getElementById('episode-select').addEventListener('change', updateStream);
      document.getElementById('dub-select').addEventListener('change', updateStream);
      document.getElementById('provider-select').addEventListener('change', updateStream);

      updateStream(); // Initial call
      
    })
    .catch(err => {
      console.error("Anime fetch error:", err);
      container.innerHTML = `<p>Failed to load anime details. Please try again later.</p>`;
    });
}

// Menu Bar Start //
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('nav-links').classList.toggle('active');
});
// Menu Bar End //
