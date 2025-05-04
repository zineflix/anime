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
            <image src="${anime.images.jpg.large_image_url}" alt="${displayTitle}">
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
              <option value="vidsrc-co">VidSrc CO</option>
              <option value="videasy">Videasy</option>      
            </select>
          </label>
        </div>

        <iframe id="stream-frame" src="" width="100%" height="500" allowfullscreen allow="autoplay; encrypted-media" sandbox="allow-scripts allow-same-origin"></iframe>
      `;

      // Streaming setup
      function updateStream(autoRetry = true) {
  const ep = document.getElementById('episode-select').value;
  const dub = document.getElementById('dub-select').value;
  const frame = document.getElementById('stream-frame');

  const providers = ["vidsrc", "vidsrc-icu", "vidsrc-co", "videasy"];
  let currentIndex = 0;
  let timeoutId;

  function getSrc(provider) {
    if (provider === "vidsrc") {
      const subType = dub === "true" ? "dub" : "sub";
      return `https://vidsrc.cc/v2/embed/anime/ani${animeId}/${ep}/${subType}?autoPlay=true`;
    } else if (provider === "vidsrc-icu") {
      const dubFlag = dub === "true" ? "1" : "0";
      return `https://vidsrc.icu/embed/anime/${animeId}/${ep}/${dubFlag}/1`;
    } else if (provider === "vidsrc-co") {
      return `https://player.vidsrc.co/embed/anime/${animeId}/${ep}?dub=${dub}`;
    } else if (provider === "videasy") {
      return `https://player.videasy.net/anime/${animeId}/${ep}${dub === "true" ? "?dub=true" : ""}`;
    }
    return "";
  }

  function tryProvider() {
    if (currentIndex >= providers.length) {
      frame.src = "";
      frame.parentElement.insertAdjacentHTML('beforeend', `<p>⚠️ All providers failed. Try again later.</p>`);
      return;
    }

    const provider = providers[currentIndex];
    const src = getSrc(provider);
    frame.src = src;

    console.log(`Trying provider: ${provider}`);

    // Timeout fallback
    timeoutId = setTimeout(() => {
      console.warn(`Provider ${provider} failed or took too long. Trying next...`);
      currentIndex++;
      tryProvider();
    }, 7000); // 7 seconds timeout
  }

  frame.onload = () => {
    // Basic heuristic: assume iframe loaded successfully
    clearTimeout(timeoutId);
    console.log("Stream loaded successfully.");
  };

  tryProvider();
}


