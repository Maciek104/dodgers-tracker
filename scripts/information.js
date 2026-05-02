class InfoPopup {
  constructor() {
    this.storageKey = "infoPopupClosed";
  }

  init() {
    if (localStorage.getItem(this.storageKey) === "true") return;

    this.create();
  }

  create() {
    const popup = document.createElement("div");
    popup.className = "info-popup";

    popup.innerHTML = `
      <div class="info-content">
        <span>
          To jest projekt fanowski i nie jest powiązany z MLB ani nie ma charakteru komercyjnego.
        </span>

        <button class="info-close">
          <img src="assets/icons/close.svg" alt="Zamknij" />
        </button>
      </div>
    `;

    document.body.appendChild(popup);

    this.bindEvents(popup);
  }

  bindEvents(popup) {
    const closeBtn = popup.querySelector(".info-close");

    closeBtn.onclick = () => {
      popup.remove();

      localStorage.setItem(this.storageKey, "true");
    };
  }
}

const infoPopup = new InfoPopup();
infoPopup.init();