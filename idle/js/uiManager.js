import { formatNumber } from './utils.js';

export class UIManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.init();
  }

  init() {
    this.playerNameEl = document.getElementById('player-name');
    this.playerLevelEl = document.getElementById('player-level');
    this.playerGoldEl = document.getElementById('player-gold');
    this.playerXPEl = document.getElementById('player-xp');
    this.woodEl = document.getElementById('resource-wood');
    this.eggEl = document.getElementById('resource-egg');

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
    if (this.playerXPEl) {
      this.playerXPEl.textContent = `xp : ${formatNumber(player.xp)}`;
    }
    if (this.playerGoldEl) {
      this.playerGoldEl.textContent = `Gold : ${formatNumber(player.gold)}`;
    }
    if (this.woodEl) {
      this.woodEl.textContent = formatNumber(player.inventory.Wood || 0);
    }
    if (this.eggEl) {
      this.eggEl.textContent = formatNumber(player.inventory.Egg || 0);
    }
  }
}
