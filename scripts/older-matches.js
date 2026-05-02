class OlderMatches {
  constructor(teamId = 119) {
    this.teamId = teamId;

    this.allGames = [];
    this.visibleCount = 6;
    this.isExpanded = false;

    this.wrapper = document.querySelector("#older-matches");
  }

  async init() {
    await this.fetchGames();
    this.render();
  }

  async fetchGames() {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setFullYear(today.getFullYear() - 1);

    const startDate = pastDate.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${this.teamId}&startDate=${startDate}&endDate=${endDate}&hydrate=linescore,team,venue`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      let games = [];

      if (data.dates) {
        data.dates.forEach(d => {
          d.games.forEach(g => {
            if (g.status.abstractGameState === "Final") {
              games.push(g);
            }
          });
        });
      }

      games.sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));

      this.allGames = games.slice(4);

    } catch (err) {
      console.error("Błąd API:", err);
      this.allGames = [];
    }
  }

  getLogo(team) {
    return `assets/logos/${team.abbreviation}.svg`;
  }

  formatGame(game) {
    const home = game.teams.home.team;
    const away = game.teams.away.team;

    return `
      <div class="match-pill">

        <div class="pill-left">
          <img src="${this.getLogo(away)}" alt="${away.abbreviation}" />
          <span>${away.abbreviation}</span>
        </div>

        <div class="pill-score">
          ${game.teams.away.score} : ${game.teams.home.score}
        </div>

        <div class="pill-right">
          <span>${home.abbreviation}</span>
          <img src="${this.getLogo(home)}" alt="${home.abbreviation}" />
        </div>

        <div class="pill-date">
          ${new Date(game.gameDate).toLocaleDateString()}
        </div>

      </div>
    `;
  }

  render() {
    if (!this.wrapper) return;

    if (this.allGames.length === 0) {
      this.wrapper.innerHTML = `<p>Brak starszych meczów.</p>`;
      return;
    }

    const list = this.allGames.slice(0, this.visibleCount);

    this.wrapper.innerHTML = `
      <div class="older-container">

        <div class="top-row">
          <button id="toggle-btn" class="btn-toggle">
            ${this.isExpanded ? "Schowaj" : "Załaduj starsze mecze"}
          </button>
        </div>

        <div class="matches-list ${this.isExpanded ? "open" : ""}">
          ${this.isExpanded ? list.map(g => this.formatGame(g)).join("") : ""}
        </div>

        ${this.isExpanded && this.visibleCount < this.allGames.length ? `
          <div class="controls">
            <button id="load-more">Załaduj więcej</button>
          </div>
        ` : ""}

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const toggle = document.getElementById("toggle-btn");
    const loadMore = document.getElementById("load-more");

    if (toggle) {
      toggle.onclick = () => {
        this.isExpanded = !this.isExpanded;
        this.render();
      };
    }

    if (loadMore) {
      loadMore.onclick = () => {
        this.visibleCount += 6;
        this.render();
      };
    }
  }
}

const olderMatches = new OlderMatches(119);
olderMatches.init();