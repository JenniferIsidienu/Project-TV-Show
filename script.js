function setup() {
  const root = document.getElementById("root");
  root.textContent = "Loading episodes...";

  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not OK");
      }
      return response.json();
    })
    .then((episodes) => {
      initializeApp(episodes);
    })
    .catch((error) => {
      root.innerHTML = `
        <p style="color: red;">Failed to load episodes. Please try again later.</p>
        <p>Error: ${error.message}</p>
      `;
    });
}

function initializeApp(episodes) {
  populateDropdown(episodes);
  makePageForEpisodes(episodes);
  setupDropdownListener(episodes);
  setupLiveSearch(episodes);
}

function zeroPad(num) {
  return num.toString().padStart(2, "0");
}

function seasonEpisodeCode(ep) {
  return `S${zeroPad(ep.season)}E${zeroPad(ep.number)}`;
}

function getEpisodeLabel(ep) {
  return `${ep.name} - ${seasonEpisodeCode(ep)}`;
}

function populateDropdown(episodes) {
  const dropdown = document.getElementById("episodeDropdown");
  const template = document.getElementById("dropdownOptionTemplate");

  dropdown.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.textContent = "All Episodes";
  defaultOption.value = "";
  defaultOption.selected = true;
  dropdown.appendChild(defaultOption);

  episodes.forEach((ep) => {
    const clone = template.content.cloneNode(true);
    const option = clone.querySelector("option");
    option.textContent = getEpisodeLabel(ep);
    option.value = ep.id.toString();
    dropdown.appendChild(option);
  });
}

function setupDropdownListener(episodes) {
  const dropdown = document.getElementById("episodeDropdown");
  dropdown.addEventListener("change", (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === "") {
      makePageForEpisodes(episodes);
    } else {
      const selectedEpisode = episodes.find(
        (ep) => ep.id.toString() === selectedValue
      );
      makePageForEpisodes([selectedEpisode]);
    }
  });
}

function setupLiveSearch(episodes) {
  const input = document.getElementById("keywordInput");
  const episodeCount = document.getElementById("episodeCount");

  input.addEventListener("input", () => {
    const keyword = input.value.toLowerCase();

    const filteredEpisodes = episodes.filter((ep) => {
      const nameMatch = ep.name.toLowerCase().includes(keyword);
      const summaryMatch = ep.summary.toLowerCase().includes(keyword);
      const codeMatch = seasonEpisodeCode(ep).toLowerCase().includes(keyword);
      return nameMatch || summaryMatch || codeMatch;
    });

    const dropdown = document.getElementById("episodeDropdown");
    dropdown.value = "";

    makePageForEpisodes(filteredEpisodes);
    episodeCount.textContent = `Displaying ${filteredEpisodes.length} of ${episodes.length} episodes`;
  });
}

function makePageForEpisodes(episodes) {
  const root = document.getElementById("root");
  root.innerHTML = "";

  const template = document.getElementById("episodeTemplate");

  episodes.forEach((ep) => {
    const clone = template.content.cloneNode(true);

    clone.querySelector("a").href = ep.url;
    clone.querySelector(".episode-name-and-code").textContent = getEpisodeLabel(ep);

    const img = clone.querySelector("img");
    img.src = ep.image?.medium || "https://via.placeholder.com/210x295?text=No+Image";
    img.alt = `Image from ${ep.name}`;

    clone.querySelector(".episode-summary").innerHTML = ep.summary || "No summary available.";

    root.appendChild(clone);
  });
}

window.onload = setup;
