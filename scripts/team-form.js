const TEAM_ID = 119; // Dodgers

async function getLastGames(limit = 5) {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 20);

  const startDate = pastDate.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${TEAM_ID}&startDate=${startDate}&endDate=${endDate}&hydrate=linescore,team`;

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

/**
 * 🔥 KLUCZOWA POPRAWKA:
 * zawsze szukamy Dodgers (119) i sprawdzamy wynik przeciwko opponentowi
 */
function getResult(game) {
  const home = game.teams.home;
  const away = game.teams.away;

  const dodgers = home.team.id === TEAM_ID ? home : away;
  const opponent = home.team.id === TEAM_ID ? away : home;

  if (dodgers.score > opponent.score) return "win";
  if (dodgers.score < opponent.score) return "loss";
  return "draw";
}

function createCircle(game) {
  const result = getResult(game);

  const icon =
    result === "win"
      ? "assets/icons/trophy.svg"
      : result === "loss"
        ? "assets/icons/loss.svg"
        : "assets/icons/draw.svg";

  return `
    <div class="form-circle ${result}">
      <img src="${icon}" alt="${result}" />
    </div>
  `;
}

function renderTeamForm(games) {
  const container = document.createElement("div");
  container.className = "team-form-widget";

  const root = document.getElementById("team-form");

  if (!games.length) {
    container.innerHTML = `<p>Brak danych o meczach.</p>`;
    root.appendChild(container);
    return;
  }

  container.innerHTML = `
    <h2>FORMA DODGERS</h2>
    <div class="form-row">
      ${games.map(createCircle).join("")}
    </div>
  `;

  root.appendChild(container);
}

async function initTeamForm() {
  const games = await getLastGames(5);
  renderTeamForm(games);
}

initTeamForm();