async function getFutureGames(limit = 3) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 10);

  const startDate = today.toISOString().split("T")[0];
  const endDate = futureDate.toISOString().split("T")[0];

  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=119&startDate=${startDate}&endDate=${endDate}&hydrate=team,venue`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    let games = [];

    data.dates.forEach(date => {
      date.games.forEach(game => {
        if (game.status.abstractGameState === "Preview") {
          games.push(game);
        }
      });
    });

    // sortowanie od najbliższego
    games.sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));

    return games.slice(0, limit);

  } catch (err) {
    console.error("Błąd API:", err);
    return [];
  }
}

function getLogo(team) {
  return `assets/logos/${team.abbreviation}.svg`;
}

function formatFutureGame(game) {
  const homeTeam = game.teams.home.team;
  const awayTeam = game.teams.away.team;

  const venue = game.venue.name;
  const dateObj = new Date(game.gameDate);

  const date = dateObj.toLocaleDateString();
  const time = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  return `
    <div class="game">
      <div class="teams-row">
        <div class="team">
          <img src="${getLogo(awayTeam)}" alt="${awayTeam.abbreviation}" />
          <span>${awayTeam.abbreviation}</span>
        </div>

        <div class="vs">VS</div>

        <div class="team">
          <span>${homeTeam.abbreviation}</span>
          <img src="${getLogo(homeTeam)}" alt="${homeTeam.abbreviation}" />
        </div>
      </div>

      <p class="date">${date} • ${time}</p>
      <p class="venue">${venue}</p>
    </div>
  `;
}

function createFutureMatchesList(games) {
  const container = document.createElement("div");
  container.className = "future-matches";

  if (games.length === 0) {
    container.innerHTML = `
      <h2 class="widget-title">NAJBLIŻSZE MECZE</h2>
      <p>Brak nadchodzących meczów.</p>
    `;
  } else {
    container.innerHTML = `
      <h2 class="widget-title">NAJBLIŻSZE MECZE</h2>
      <div class="matches-list">
        ${games.map(g => formatFutureGame(g)).join("")}
      </div>
    `;
  }

  document.getElementById("future-matches").appendChild(container);
}

async function initFutureMatches() {
  const games = await getFutureGames(3);
  createFutureMatchesList(games);
}

initFutureMatches();