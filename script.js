let allShows = [];
const episodesCache = {};
let currentEpisodes = [];

const zeroPad = num => num.toString().padStart(2, '0');
const getLabel = ep => `${ep.name} - S${zeroPad(ep.season)}E${zeroPad(ep.number)}`;

function setup() {
  const showsContainer = document.getElementById('showsContainer');
  showsContainer.textContent = 'Loading shows...';

  fetch('https://api.tvmaze.com/shows')
    .then(r => r.ok ? r.json() : Promise.reject('Failed to load shows'))
    .then(shows => {
      allShows = shows.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      renderShows(allShows);
      addShowSearch();
    })
    .catch(err => {
      showsContainer.innerHTML = `<p style="color:red;">${err}</p>`;
    });
}

function renderShows(shows) {
  const container = document.getElementById('showsContainer');
  container.innerHTML = '';

  shows.forEach(show => {
    const card = document.createElement('div');
    card.className = 'show-card';
    card.innerHTML = `
      <img src="${show.image?.medium || ''}" alt="${show.name}">
      <div class="show-details">
        <div class="show-name">${show.name}</div>
        <p>${show.summary || ''}</p>
        <p><strong>Genres:</strong> ${show.genres.join(', ')}</p>
        <p><strong>Status:</strong> ${show.status}</p>
        <p><strong>Rating:</strong> ${show.rating?.average || 'N/A'}</p>
        <p><strong>Runtime:</strong> ${show.runtime || 'N/A'} min</p>
      </div>
    `;
    card.querySelector('.show-name').addEventListener('click', () => {
      loadEpisodes(show.id);
    });
    container.appendChild(card);
  });
}

function addShowSearch() {
  const control = document.createElement('div');
  control.innerHTML = `
    <input type="text" id="showSearch" placeholder="Search shows...">
  `;
  document.body.insertBefore(control, document.getElementById('showsContainer'));

  document.getElementById('showSearch').addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    renderShows(allShows.filter(show =>
      show.name.toLowerCase().includes(term) ||
      show.genres.some(g => g.toLowerCase().includes(term)) ||
      (show.summary || '').toLowerCase().includes(term)
    ));
  });
}

function loadEpisodes(showId) {
  showView(false);
  const epCont = document.getElementById('episodesContainer');
  epCont.innerHTML = 'Loading episodes...';
  currentEpisodes = [];

  if (episodesCache[showId]) {
    currentEpisodes = episodesCache[showId];
    renderEpisodes();
    return;
  }

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then(r => r.ok ? r.json() : Promise.reject('Failed to load episodes'))
    .then(episodes => {
      episodesCache[showId] = episodes;
      currentEpisodes = episodes;
      renderEpisodes();
    })
    .catch(err => {
      epCont.innerHTML = `<p style="color:red;">${err}</p>`;
    });
}

function renderEpisodes() {
  const showsCont = document.getElementById('showsContainer');
  const epCont = document.getElementById('episodesContainer');
  epCont.innerHTML = `
    <button id="backBtn">← Back to Shows</button>
    <select id="episodeDropdown"></select>
    <input type="text" id="episodeSearch" placeholder="Search episodes...">
    <span id="episodeCount"></span>
    <div id="episodesList"></div>
  `;

  document.getElementById('backBtn').onclick = () => showView(true);
  populateEpisodeDropdown(currentEpisodes);
  setupEpisodeSearch();

  showView(false);
}

function populateEpisodeDropdown(episodes) {
  const dropdown = document.getElementById('episodeDropdown');
  dropdown.innerHTML = '<option value="">All Episodes</option>';
  episodes.forEach(ep => {
    const opt = document.createElement('option');
    opt.value = ep.id;
    opt.textContent = getLabel(ep);
    dropdown.append(opt);
  });

  dropdown.addEventListener('change', applyEpisodeFilters);
}

function setupEpisodeSearch() {
  document.getElementById('episodeSearch').addEventListener('input', applyEpisodeFilters);
}

function applyEpisodeFilters() {
  const searchTerm = document.getElementById('episodeSearch').value.toLowerCase();
  const dropdown = document.getElementById('episodeDropdown');
  const dropVal = dropdown.value;
  let filtered = [...currentEpisodes];

  if (dropVal !== '') {
    filtered = filtered.filter(ep => ep.id.toString() === dropVal);
  }

  if (searchTerm) {
    filtered = filtered.filter(ep =>
      ep.name.toLowerCase().includes(searchTerm) ||
      (ep.summary || '').toLowerCase().includes(searchTerm) ||
      getLabel(ep).toLowerCase().includes(searchTerm)
    );
  }

  renderEpisodeCards(filtered);
  document.getElementById('episodeCount').textContent =
    `Displaying ${filtered.length} of ${currentEpisodes.length} episodes`;
}

function renderEpisodeCards(episodes) {
  const list = document.getElementById('episodesList');
  list.innerHTML = '';
  const template = document.querySelector('.episode-card')?.template; // adapt to your template
  episodes.forEach(ep => {
    const card = document.querySelector('#episodeTemplate').content.cloneNode(true);
    card.querySelector('a').href = ep.url;
    card.querySelector('.episode-name-and-code').textContent = getLabel(ep);
    const img = card.querySelector('img');
    img.src = ep.image?.medium || '';
    img.alt = ep.name;
    card.querySelector('.episode-summary').innerHTML = ep.summary || '';
    list.append(card);
  });
}

function showView(showList) {
  document.getElementById('showsContainer').style.display = showList ? 'block' : 'none';
  document.getElementById('episodesContainer').style.display = showList ? 'none' : 'block';
}

window.onload = setup;

