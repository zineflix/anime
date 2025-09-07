// Global state variables
let currentPage = 1;
let currentSearchTerm = '';
let currentFetchFilters = {};

// Event listener for the "Fetch Anime" button
document.getElementById('fetch-btn').addEventListener('click', () => {
    currentPage = 1;
    currentSearchTerm = ''; // Clear search term state when a new filter is applied
    currentFetchFilters = {
        year: document.getElementById('year-select').value,
        genreName: document.getElementById('genre-select').value,
        format: document.getElementById('format-select').value
    };
    fetchAnime(currentFetchFilters, currentPage, true);
});

// Event listener for the "Load More" button
document.getElementById('load-more-btn').addEventListener('click', () => {
    currentPage++;
    if (currentSearchTerm) {
        searchAnime(currentSearchTerm, currentPage, false);
    } else {
        fetchAnime(currentFetchFilters, currentPage, false);
    }
});

// Event listener for the "Search" button
document.getElementById('search-btn').addEventListener('click', () => {
    currentPage = 1;
    currentSearchTerm = document.getElementById('search-input').value.trim();
    currentFetchFilters = {}; // Clear filter state when a new search is performed
    if (!currentSearchTerm) return;
    searchAnime(currentSearchTerm, currentPage, true);
});

/**
 * Fetches anime from the Jikan API based on filter selections.
 * @param {object} filters - An object containing year, genre, and format.
 * @param {number} page - The page number to fetch.
 * @param {boolean} isNewFetch - True if this is a new fetch, false for loading more.
 */
function fetchAnime(filters, page, isNewFetch) {
    const genreMap = {
        "Action": 1, "Adventure": 2, "Comedy": 4, "Drama": 8,
        "Ecchi": 9, "Fantasy": 10, "Hentai": 12, "Horror": 14,
        "Mahou Shoujo": 16, "Mecha": 18, "Music": 19, "Mystery": 7,
        "Psychological": 40, "Romance": 22, "Sci-Fi": 24, "Slice of Life": 36,
        "Sports": 30, "Supernatural": 37, "Thriller": 41
    };
    const genreId = genreMap[filters.genreName];

    let url = `https://api.jikan.moe/v4/anime?limit=25&order_by=popularity&page=${page}`;

    if (filters.year) {
        url += `&start_date=${filters.year}-01-01&end_date=${filters.year}-12-31`;
    }

    if (filters.format) {
        url += `&type=${filters.format.toLowerCase()}`;
    }

    if (genreId) {
        url += `&genres=${genreId}`;
    }

    const list = document.getElementById('anime-list');
    if (isNewFetch) {
        list.innerHTML = '';
        document.getElementById('load-more-btn').style.display = 'none';
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data.data || data.data.length === 0) {
                if (isNewFetch) list.innerHTML = '<p>No results found.</p>';
                document.getElementById('load-more-btn').style.display = 'none';
                return;
            }

            data.data.forEach(anime => {
                const card = createAnimeCard(anime);
                list.appendChild(card);
            });

            document.getElementById('load-more-btn').style.display = data.pagination?.has_next_page ? 'inline-block' : 'none';
        })
        .catch(console.error);
}

/**
 * Searches for anime using a search term and handles pagination.
 * @param {string} term - The search query.
 * @param {number} page - The page number to fetch.
 * @param {boolean} isNewSearch - True if this is a new search, false for loading more.
 */
function searchAnime(term, page, isNewSearch) {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(term)}&limit=25&page=${page}&order_by=popularity`;
    const list = document.getElementById('anime-list');

    if (isNewSearch) {
        list.innerHTML = '';
        document.getElementById('load-more-btn').style.display = 'none';
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data.data || data.data.length === 0) {
                if (isNewSearch) list.innerHTML = '<p>No results found.</p>';
                document.getElementById('load-more-btn').style.display = 'none';
                return;
            }

            data.data.forEach(anime => {
                const card = createAnimeCard(anime);
                list.appendChild(card);
            });

            document.getElementById('load-more-btn').style.display = data.pagination?.has_next_page ? 'inline-block' : 'none';
        })
        .catch(console.error);
}

// Helper function to create an anime card element to reduce code duplication
function createAnimeCard(anime) {
    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `
        <a href="anime-details.html?id=${anime.mal_id}">
            <img src="${anime.images.jpg.image_url}" alt="${anime.title_english || anime.title}">
            <h2>${anime.title_english || anime.title}</h2>
            <div class="anime-popup">
                <h3>${anime.title_english || anime.title}</h3>
                <p><strong>Description:</strong> ${anime.synopsis ? anime.synopsis.substring(0, 200) + "..." : 'No description available.'}</p>
                <p><strong>Rating:</strong> ${anime.rating || 'N/A'}</p>
                <p><strong>Status:</strong> ${anime.status || 'Unknown'}</p>
                <p><strong>Genre:</strong> ${anime.genres ? anime.genres.map(g => g.name).join(', ') : 'Unknown'}</p>
                <p><strong>Aired:</strong> ${anime.aired && anime.aired.string ? anime.aired.string : 'Unknown'}</p>
            </div>
        </a>
    `;
    return card;
}

// Initial fetch on page load
// Note: This needs to call the new fetchAnime function with default parameters
window.onload = () => {
    // Check for search term in URL (if applicable)
    // Otherwise, do an initial fetch
    fetchAnime({ year: '', genreName: '', format: '' }, 1, true);
};

// Menu Bar Start
document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('active');
});
// Menu Bar End

// Anime Card Popup Start
document.addEventListener("mouseover", function(e) {
    const card = e.target.closest(".anime-card");
    if (!card) return;

    const popup = card.querySelector(".anime-popup");
    if (!popup) return;

    // Reset alignment
    popup.classList.remove("left-align", "right-align");

    // Temporarily show for measurement
    popup.style.display = "block";
    const popupRect = popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    if (popupRect.right > viewportWidth) {
        popup.classList.add("right-align");
    } else if (popupRect.left < 0) {
        popup.classList.add("left-align");
    }

    popup.style.display = ""; // Hide again until hover
});
// Anime Card Popup End
