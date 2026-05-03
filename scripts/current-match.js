function getLogo(team) {
  const abbr = team.abbreviation;
  return `assets/logos/${abbr}.png`;
}

async function getDodgersData() {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 7);

  const startDate = today.toISOString().split("T")[0];
  const endDate = future.toISOString().split("T")[0];

  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=119&startDate=${startDate}&endDate=${endDate}&hydrate=linescore,team,venue`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    let games = [];

    data.dates.forEach(d => {
      d.games.forEach(g => games.push(g));
    });

    const liveGame = games.find(g =>
      g.status.abstractGameState === "Live" ||
      g.status.abstractGameState === "In Progress"
    );

    if (liveGame) {
      return { type: "live", game: liveGame };
    }

    const upcoming = games
      .filter(g => g.status.abstractGameState === "Preview")
      .sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate))[0];

    return { type: "upcoming", game: upcoming || null };

  } catch (err) {
    console.error("Błąd API:", err);
    return { type: "none", game: null };
  }
}

function startCountdown(element, gameDate) {
  function update() {
    const now = new Date();
    const diff = new Date(gameDate) - now;

    if (diff <= 0) {
      element.textContent = "Mecz właśnie się zaczyna!";
      return;
    }

    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);

    element.textContent = `${h}h ${m}m ${s}s`;
  }

  update();
  setInterval(update, 1000);
}

function createMatchDiv(data) {
  const wrapper = document.getElementById("past-matches");
  const container = document.createElement("div");
  container.className = "current-match";

  if (!data.game) {
    container.innerHTML = `<p>Brak danych o meczach.</p>`;
    wrapper.appendChild(container);
    return;
  }

  const game = data.game;

  const homeTeam = game.teams.home.team;
  const awayTeam = game.teams.away.team;

  const venue = game.venue.name;

  if (data.type === "live") {
    const homeScore = game.teams.home.score ?? 0;
    const awayScore = game.teams.away.score ?? 0;

    const inning = game.linescore?.currentInning ?? "";
    const inningState = game.linescore?.inningState ?? "";
    const status = game.status.detailedState;

    container.innerHTML = `
      <h2>Live Match</h2>

      <div class="teams-row">
        <div class="current-team">
          <img src="${getLogo(awayTeam)}" />
          <span>${awayTeam.name}</span>
        </div>

        <div class="score">${awayScore} : ${homeScore}</div>

        <div class="current-team">
          <span>${homeTeam.name}</span>
          <img src="${getLogo(homeTeam)}" />
        </div>
      </div>

      <p>Status: ${status}</p>
      <p>${inningState} ${inning}</p>
      <p>Stadion: ${venue}</p>
    `;
  }

  if (data.type === "upcoming") {
    const gameDate = game.gameDate;

    container.innerHTML = `
      <h2>Następny mecz</h2>

      <div class="current-teams-row">
        <div class="current-team">
          <img src="${getLogo(awayTeam)}" />
          <span>${awayTeam.name}</span>
        </div>

        <div class="score">vs</div>

        <div class="current-team">
          <span>${homeTeam.name}</span>
          <img src="${getLogo(homeTeam)}" />
        </div>
      </div>

      <p class="countdown"></p>
      <p>${venue}</p>
    `;

    const countdownEl = container.querySelector(".countdown");
    startCountdown(countdownEl, gameDate);
  }

  wrapper.appendChild(container);
}

async function init() {
  const data = await getDodgersData();
  createMatchDiv(data);
}

init();