const params = new URLSearchParams(window.location.search);
    const animeId = params.get("id");
    const container = document.getElementById("anime-detail");

    if (!animeId) {
      container.innerHTML = "<p>No anime ID provided.</p>";
    } else {
      // Step 1: Load basic data (title and cover)
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

        // Stream-like rendering
        container.innerHTML = `<h1>${anime.title.english || anime.title.romaji}</h1>`;
        
        setTimeout(() => {
          const img = document.createElement("img");
          img.src = anime.coverImage.large;
          container.appendChild(img);
        }, 500); // Simulate delay

        setTimeout(() => {
          const desc = document.createElement("p");
          desc.innerText = anime.description || "No description available.";
          container.appendChild(desc);
        }, 1000); // Simulate another delay
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = "<p>Failed to load anime details.</p>";
      });
    }
