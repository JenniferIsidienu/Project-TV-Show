//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; 

  episodeList.forEach((episode) => {
    const episodeDiv = document.createElement("div");
    episodeDiv.classList.add("episode");

    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

    episodeDiv.innerHTML = `
      <h3>${episodeCode} - ${episode.name}</h3>
      <img src="${episode.image.medium}" alt="${episode.name}" />
      <p>${episode.summary}</p>
    `;

    rootElem.appendChild(episodeDiv);
  });

  const footer = document.createElement("footer");
  footer.innerHTML = `Data from <a href="https://www.tvmaze.com/api" target="_blank" rel="noopener noreferrer">TVMaze.com</a>`;
  rootElem.appendChild(footer);
}


window.onload = setup;
