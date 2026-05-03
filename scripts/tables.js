const BASE_URL = "https://statsapi.mlb.com/api/v1/standings";
const TEAMS_URL = "https://statsapi.mlb.com/api/v1/teams?sportId=1";

const CONFIG = {
  league: "103,104",
  season: new Date().getFullYear()
};

const DODGERS_ID = 119;

let TEAM_MAP = {};

async function loadTeamsMap() {
  try {
    const res = await fetch(TEAMS_URL);
    const data = await res.json();

    data.teams.forEach(team => {
      TEAM_MAP[team.id] = {
        name: team.name,
        abbreviation: team.abbreviation
      };
    });
  } catch (err) {
    console.error("Błąd teams API:", err);
  }
}

async function fetchStandings(group = "league") {
  let url = "";

  if (group === "league") {
    url = `${BASE_URL}?leagueId=${CONFIG.league}&season=${CONFIG.season}&standingsTypes=regularSeason`;
  }

  if (group === "al") {
    url = `${BASE_URL}?leagueId=103&season=${CONFIG.season}&standingsTypes=regularSeason`;
  }

  if (group === "nl") {
    url = `${BASE_URL}?leagueId=104&season=${CONFIG.season}&standingsTypes=regularSeason`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.records || [];
  } catch (err) {
    console.error("Błąd standings API:", err);
    return [];
  }
}

function getTeamIcon(teamId) {
  const abbr = TEAM_MAP[teamId]?.abbreviation || "default";
  return `assets/logos/${abbr}.svg`;
}

function flattenTeams(records) {
  let teams = [];

  records.forEach(r => {
    if (r.teamRecords) {
      teams = teams.concat(r.teamRecords);
    }
  });

  return teams;
}

function sortTeams(teams) {
  return teams.sort((a, b) => {
    const pctA = parseFloat(a.winningPercentage || 0);
    const pctB = parseFloat(b.winningPercentage || 0);

    if (pctB !== pctA) return pctB - pctA;

    const winsDiff = (b.wins || 0) - (a.wins || 0);
    if (winsDiff !== 0) return winsDiff;

    const runA = a.runDifferential ?? 0;
    const runB = b.runDifferential ?? 0;

    return runB - runA;
  });
}

function getGamesPlayed(team) {
  return (team.wins || 0) + (team.losses || 0);
}

function createTable(records) {
  const container = document.createElement("div");
  container.className = "mlb-table-widget";

  let teams = flattenTeams(records);
  teams = sortTeams(teams);

  if (!teams.length) {
    container.innerHTML = `<p>Brak danych tabeli.</p>`;
    return container;
  }

  container.innerHTML = `
    <div class="table-header">
      <h2>TABELE WYNIKÓW MLB</h2>

      <div class="table-filters">
        <button data-group="league">MLB</button>
        <button data-group="al">AMERICAN LEAGUE</button>
        <button data-group="nl">NATIONAL LEAGUE</button>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>DRUŻYNA</th>
          <th>W</th>
          <th>L</th>
          <th>G</th>
          <th>PCT</th>
        </tr>
      </thead>

      <tbody>
        ${teams.map(renderTeamRow).join("")}
      </tbody>
    </table>
  `;

  setTimeout(() => attachEvents(container), 0);

  return container;
}

function renderTeamRow(t) {
  const isDodgers = t.team.id === DODGERS_ID;

  const teamData = TEAM_MAP[t.team.id] || {};
  const fullName = teamData.name || t.team.name;
  const abbr = teamData.abbreviation || "";

  const icon = getTeamIcon(t.team.id);

  return `
    <tr class="${isDodgers ? "dodgers-row" : ""}">
      <td class="team-name">
        <img class="team-icon" src="${icon}" alt="${abbr}" />
        ${fullName}
      </td>

      <td>${t.wins ?? 0}</td>
      <td>${t.losses ?? 0}</td>
      <td>${getGamesPlayed(t)}</td>
      <td>${t.winningPercentage ?? "0.000"}</td>
    </tr>
  `;
}

async function loadTables(group = "league") {
  const data = await fetchStandings(group);

  const root = document.getElementById("mlb-tables");
  root.innerHTML = "";

  root.appendChild(createTable(data));
}

function attachEvents(container) {
  container.querySelectorAll("button[data-group]").forEach(btn => {
    btn.addEventListener("click", () => {
      loadTables(btn.dataset.group);
    });
  });
}

async function init() {
  await loadTeamsMap();
  loadTables();
}

init();