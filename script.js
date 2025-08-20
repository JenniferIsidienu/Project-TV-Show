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
