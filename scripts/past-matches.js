async function getPastGames(limit = 4) {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 10);

  const startDate = pastDate.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=119&startDate=${startDate}&endDate=${endDate}&hydrate=linescore,team,venue`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    let games = [];

    data.dates.forEach(date => {
      date.games.forEach(game => {
        if (game.status.abstractGameState === "Final") {
          games.push(game);
        }
      });
    });

    games.sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));

    return games.slice(0, limit);

  } catch (err) {
    console.error("Błąd API:", err);
    return [];
  }
}

function getLogo(team) {
  const abbr = team.abbreviation;
  return `assets/logos/${abbr}.svg`;
}

function formatGame(game, big = false) {
  const homeTeam = game.teams.home.team;
  const awayTeam = game.teams.away.team;

  const homeScore = game.teams.home.score;
  const awayScore = game.teams.away.score;

  const venue = game.venue.name;
  const date = new Date(game.gameDate).toLocaleDateString();

  return `
    <div class="game ${big ? "big" : "small"}">
      
      <div class="teams-row">
        <div class="team">
          <img src="${getLogo(awayTeam)}" alt="${awayTeam.abbreviation}" />
          <span>${awayTeam.abbreviation}</span>
        </div>

        <div class="score">
          ${awayScore} : ${homeScore}
        </div>

        <div class="team">
          <span>${homeTeam.abbreviation}</span>
          <img src="${getLogo(homeTeam)}" alt="${homeTeam.abbreviation}" />
        </div>
      </div>

      <p class="date">${date}</p>
      <p class="venue">${venue}</p>
    </div>
  `;
}

function createPastMatchesGrid(games) {
  const container = document.createElement("div");
  container.className = "past-matches";

  if (games.length === 0) {
    container.innerHTML = `<p>Brak ostatnich meczów.</p>`;
    document.getElementById("past-matches").appendChild(container);
    return;
  }

  const mainGame = games[0];
  const otherGames = games.slice(1);

  container.innerHTML = `
    <div class="grid">
      <div class="left">
        ${formatGame(mainGame, true)}
      </div>
      <div class="right">
        ${otherGames.map(g => formatGame(g)).join("")}
      </div>
    </div>
  `;

  document.getElementById("past-matches").appendChild(container);
}

async function initPastMatches() {
  const games = await getPastGames(4);
  createPastMatchesGrid(games);
}

initPastMatches();