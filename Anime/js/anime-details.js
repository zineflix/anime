const params = new URLSearchParams(window.location.search);
    const animeId = params.get("id");
    const container = document.getElementById("anime-detail");

    if (!animeId) {
      container.innerHTML = "<p>No anime ID provided.</p>";
    } else {
      const query = `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            title {
              romaji
              english
            }
            coverImage {
              large
            }
            description(asHtml: false)
            characters(perPage: 8, sort: [ROLE, RELEVANCE]) {
              nodes {
                name {
                  full
                }
                image {
                  large
                }
              }
            }
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
        container.innerHTML = `
          <h1>${anime.title.english || anime.title.romaji}</h1>
          <img src="${anime.coverImage.large}" alt="${anime.title.english || anime.title.romaji}">
          <p>${anime.description || "No description available."}</p>
          <h2>Characters</h2>
          <div class="character-grid" id="characters">
            ${anime.characters.nodes.map(char => `
              <div class="character-card">
                <img src="${char.image.large}" alt="${char.name.full}">
                <div>${char.name.full}</div>
              </div>
            `).join('')}
          </div>
          <div class="episodes">
            <h2>Episodes</h2>
            <div id="episode-list"></div>
            <button id="load-more">Load More Episodes</button>
          </div>
        `;

        // Simulated episode loading
        let episodeCount = 0;
        document.getElementById('load-more').addEventListener('click', () => {
          const list = document.getElementById('episode-list');
          for (let i = 1; i <= 5; i++) {
            episodeCount++;
            const ep = document.createElement('div');
            ep.className = 'episode';
            ep.textContent = `Episode ${episodeCount}: Placeholder title`;
            list.appendChild(ep);
          }
        });

        // Auto-load first 5
        document.getElementById('load-more').click();
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = "<p>Failed to load anime details.</p>";
      });
    }
