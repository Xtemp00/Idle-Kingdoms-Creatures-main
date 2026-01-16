import { formatNumber } from './utils.js';

export class UIManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.init();
  }

  init() {
    this.playerNameEls = document.querySelectorAll('[data-player-name]');
    this.playerLevelEls = document.querySelectorAll('[data-player-level]');
    this.playerGoldEls = document.querySelectorAll('[data-player-gold]');
    this.playerXPEls = document.querySelectorAll('[data-player-xp]');
    this.playerPrestigeEls = document.querySelectorAll('[data-player-prestige]');
    this.woodEl = document.getElementById('resource-wood');
    this.eggEl = document.getElementById('resource-egg');
    this.fishEl = document.getElementById('resource-fish');
    this.agriResources = document.querySelectorAll('[data-agri-resource]');

    this.gameState.subscribe((player) => this.updateUI(player));
    this.updateUI(this.gameState.player);
  }

  updateUI(player) {
    this.playerNameEls.forEach((element) => {
      element.textContent = player.name;
    });
    this.playerLevelEls.forEach((element) => {
      element.textContent = `Niveau : ${player.level}`;
    });
    this.playerXPEls.forEach((element) => {
      element.textContent = `xp : ${formatNumber(player.xp)}`;
    });
    this.playerGoldEls.forEach((element) => {
      element.textContent = `Gold : ${formatNumber(player.gold)}`;
    });
    const prestigeCount = player.meta?.prestigeCount || 0;
    const prestigeBoost = this.gameState.getPrestigeBoost().toFixed(2);
    this.playerPrestigeEls.forEach((element) => {
      element.textContent = `Prestige : ${prestigeCount} (x${prestigeBoost})`;
    });
    if (this.woodEl) {
      this.woodEl.textContent = formatNumber(player.inventory.Wood || 0);
    }
    if (this.eggEl) {
      this.eggEl.textContent = formatNumber(player.inventory.Egg || 0);
    }
    if (this.fishEl) {
      this.fishEl.textContent = formatNumber(player.inventory.Fish || 0);
    }
    if (this.agriResources?.length) {
      const storage = player.agriculture?.storage || {};
      this.agriResources.forEach((element) => {
        const resource = element.dataset.agriResource;
        element.textContent = formatNumber(storage[resource] || 0);
      });
    }
  }
}
