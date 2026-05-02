class StyleSwitcher {
  constructor() {
    this.storageKey = "theme";

    this.themes = {
      dark: "styles/dark-theme.css",
      light: "styles/light-theme.css"
    };

    this.icons = {
      dark: "assets/icons/dark-theme.svg",
      light: "assets/icons/light-theme.svg"
    };

    this.currentTheme = "dark";
  }

  init() {
    const saved = localStorage.getItem(this.storageKey) || "dark";
    this.currentTheme = saved;

    this.applyTheme(saved);
    this.mountButton();
  }

  applyTheme(theme) {
    this.currentTheme = theme;

    let link = document.getElementById("theme-style");

    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.id = "theme-style";
      document.head.appendChild(link);
    }

    link.href = this.themes[theme];

    localStorage.setItem(this.storageKey, theme);

    this.updateButtonIcon();
  }

  toggleTheme() {
    const next = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(next);
  }

  createButton() {
    const btn = document.createElement("button");
    btn.className = "theme-toggle";

    const img = document.createElement("img");
    img.alt = "Zmień motyw";

    btn.appendChild(img);

    btn.addEventListener("click", () => this.toggleTheme());

    this.button = btn;
    this.icon = img;

    this.updateButtonIcon();

    return btn;
  }

  mountButton() {
    const container = document.getElementById("footer-controls");

    if (!container) return;

    container.appendChild(this.createButton());
  }

  updateButtonIcon() {
    if (!this.icon) return;

    this.icon.src = this.icons[this.currentTheme];
  }
}

const styleSwitcher = new StyleSwitcher();
styleSwitcher.init();