
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

const episodesCache = {};
let currentEpisodes = [];
function setup() {
  const defaultShowId = 82; // Example show
  const root = document.getElementById("root");
  root.textContent = "Loading episodes...";
  fetch(`https://api.tvmaze.com/shows/${defaultShowId}/episodes`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch episodes");
      return res.json();
    })
    .then((data) => {
      episodesCache[defaultShowId] = data;
      currentEpisodes = data;
      initializeDropdown(data);
      renderAll(data);
    })
    .catch((err) => {
      root.innerHTML = `<p style="color: red;">Error loading episodes: ${err.message}</p>`;
    });
}
function initializeDropdown(episodes) {
  const dropdown = document.getElementById("episodeDropdown");
  dropdown.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "All Episodes";
  defaultOption.selected = true;
  dropdown.append(defaultOption);
  episodes.forEach((ep) => {
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = getLabel(ep);
    dropdown.append(option);
  });
  dropdown.addEventListener("change", () => applyFilters());
  document.getElementById("keywordInput")
    .addEventListener("input", () => applyFilters());
}
function applyFilters() {
  const dropdown = document.getElementById("episodeDropdown");
  const input = document.getElementById("keywordInput").value.toLowerCase();
  let filtered = [...currentEpisodes];
  if (dropdown.value) {
    filtered = filtered.filter(ep => ep.id.toString() === dropdown.value);
  }
  if (input) {
    filtered = filtered.filter(ep => {
      const code = getLabel(ep).toLowerCase();
      return ep.name.toLowerCase().includes(input)
        || (ep.summary && ep.summary.toLowerCase().includes(input))
        || code.includes(input);
    });
    dropdown.value = ""; // Reset select
  }
  renderAll(filtered);
}
function renderAll(episodes) {
  makePageForEpisodes(episodes);
  document.getElementById("episodeCount").textContent =
    `Displaying ${episodes.length} of ${currentEpisodes.length} episodes`;
}
function zeroPad(num) {
  return num.toString().padStart(2, "0");
}
function getLabel(ep) {
  return `${ep.name} - S${zeroPad(ep.season)}E${zeroPad(ep.number)}`;
}
function makePageForEpisodes(episodes) {
  const root = document.getElementById("root");
  root.innerHTML = "";
  const template = document.getElementById("episodeTemplate");
  episodes.forEach((ep) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector("a").href = ep.url;
    clone.querySelector(".episode-name-and-code").textContent = getLabel(ep);
    const img = clone.querySelector("img");
    img.src = ep.image?.medium || "";
    img.alt = ep.name;
    clone.querySelector(".episode-summary").innerHTML = ep.summary || "";
    root.appendChild(clone);
  });
}

window.onload = setup;

