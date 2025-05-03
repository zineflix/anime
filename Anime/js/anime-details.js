const params = new URLSearchParams(window.location.search);
const animeId = params.get("id");
const container = document.getElementById("anime-detail");

const maxEpisodes = 24; // You can fetch the episode count dynamically with Jikan if needed

if (!animeId) {
  container.innerHTML = "<p>No anime ID provided.</p>";
} else {
  fetch(`https://api.jikan.moe/v4/anime/${animeId}`)
    .then(res => res.json())
    .then(data => {
      const anime = data.data;
      const displayTitle = anime.title_english || anime.title;

      container.innerHTML = `
        <div class="anime-content">
          <div class="anime-image">
            <img src="${anime.images.jpg.large_image_url}" alt="${displayTitle}">
          </div>
          <div class="anime-info">
            <h1 class="anime-title">${displayTitle}</h1>
            <div class="anime-description">
              <p>${anime.synopsis || "No description available."}</p>
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
              <option value="vidsrc-icu">VidSrc ICU</option>
              <option value="videasy">Videasy</option>
            </select>
          </label>
        </div>

        <iframe id="stream-frame" src="" width="100%" height="500" allowfullscreen allow="autoplay; encrypted-media" sandbox="allow-scripts allow-same-origin"></iframe>
      `;

      // Streaming setup
      function updateStream() {
  const ep = document.getElementById('episode-select').value;
  const dub = document.getElementById('dub-select').value;
  const provider = document.getElementById('provider-select').value;
  const frame = document.getElementById('stream-frame');

  let src = "";

  if (provider === "vidsrc") {
    const subType = dub === "true" ? "dub" : "sub";
    src = `https://vidsrc.cc/v2/embed/anime/ani${anime.mal_id}/${ep}/${subType}?autoPlay=true`;
  } else if (provider === "vidsrc-icu") {
    // Numeric format: /anime/{id}/{ep}/{dub as 0|1}/{skip as 0|1}
    const dubFlag = dub === "true" ? "1" : "0";
    const skipFlag = "1"; // You can make this dynamic too
    src = `https://vidsrc.icu/embed/anime/${anime.mal_id}/${ep}/${dubFlag}/${skipFlag}`;
  } else if (provider === "videasy") {
    src = `https://player.videasy.net/anime/${anime.mal_id}/${ep}${dub === "true" ? "?dub=true" : ""}`;
  }

  console.log("Iframe source URL:", src); // Debug
  frame.src = src;
}



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
