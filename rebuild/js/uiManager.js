export class UIManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.init();
  }

  init() {
    this.playerNameEl = document.getElementById('player-name');
    this.playerLevelEl = document.getElementById('player-level');
    this.playerGoldEl = document.getElementById('player-gold');

    this.gameState.subscribe((player) => this.updateUI(player));
    this.updateUI(this.gameState.player);
  }

  updateUI(player) {
    if (this.playerNameEl) {
      this.playerNameEl.textContent = player.name;
    }
    if (this.playerLevelEl) {
      this.playerLevelEl.textContent = `Niveau : ${player.level}`;
    }
    if (this.playerGoldEl) {
      this.playerGoldEl.textContent = `Gold : ${player.gold}`;
    }
  }
}
