const params = new URLSearchParams(window.location.search);
    const animeId = params.get("id");
    const container = document.getElementById("anime-detail");

    const maxEpisodes = 24; // adjust or fetch dynamically if available

    if (!animeId) {
      container.innerHTML = "<p>No anime ID provided.</p>";
    } else {
      const query = `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
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
      `;

      fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { id: parseInt(animeId) } }),
      })
      .then(res => res.json())
      .then(data => {
        const anime = data.data.Media;
        const displayTitle = anime.title.english || anime.title.romaji;

        container.innerHTML = `
  <div class="anime-content">
  <div class="anime-left">
    <h1 class="anime-title">${displayTitle}</h1>
    <div class="anime-image">
      <img src="${anime.coverImage.large}" alt="${displayTitle}">
    </div>
  </div>
  <div class="anime-description">
    <p>${anime.description || "No description available."}</p>
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
        <option value="videasy">Videasy</option>
        <option value="vidsrc">VidSrc</option>
      </select>
    </label>
  </div>

  <iframe id="stream-frame" src="" width="100%" height="500" allowfullscreen allow="autoplay; encrypted-media" sandbox="allow-scripts allow-same-origin"></iframe>
`;


        // Initial stream
        function updateStream() {
  const ep = document.getElementById('episode-select').value;
  const dub = document.getElementById('dub-select').value;
  const provider = document.getElementById('provider-select').value;
  const frame = document.getElementById('stream-frame');

  let src = "";
  if (provider === "videasy") {
    src = `https://player.videasy.net/anime/${anime.id}/${ep}${dub === "true" ? "?dub=true" : ""}`;
  } else {
    const subType = dub === "true" ? "dub" : "sub";
    src = `https://vidsrc.cc/v2/embed/anime/ani${anime.id}/${ep}/${subType}?autoPlay=true`;
  }
  frame.src = src;
}


        // Attach change events
        document.getElementById('episode-select').addEventListener('change', updateStream);
        document.getElementById('dub-select').addEventListener('change', updateStream);
        document.getElementById('provider-select').addEventListener('change', updateStream);

        updateStream(); // initial call
      })
      .catch(err => {
        console.error("Anime fetch error:", err);
container.innerHTML = `<p>Failed to load anime details. Please try again later.</p>`;
      });
    }
