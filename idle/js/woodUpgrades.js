// woodUpgrades.js
import { formatNumber } from './utils.js';

export class WoodUpgrades {
    constructor(gameState) {
      this.gameState = gameState;
      // Initialisation des upgrades si non définis
      if (!this.gameState.player.woodUpgrades) {
        // On inclut désormais force en plus de lumberjack et sawmill
        this.gameState.player.woodUpgrades = { lumberjack: 1, sawmill: 1, force: 1 };
      }
      // Initialiser le multiplicateur de force s'il n'existe pas
      if (this.gameState.player.forceMultiplier === undefined) {
        this.gameState.player.forceMultiplier = 1;
      }
      // Définir les coûts de base pour chaque amélioration
      this.baseCost = {
        lumberjack: 100,
        sawmill: 500,
        force: 200
      };
  
      // Récupérer les éléments de l'interface des upgrades
      this.lumberjackLevelEl = document.getElementById('lumberjack-level');
      this.lumberjackCostEl = document.getElementById('lumberjack-cost');
      this.lumberjackUpgradeButton = document.getElementById('upgrade-lumberjack');
  
      this.sawmillLevelEl = document.getElementById('sawmill-level');
      this.sawmillCostEl = document.getElementById('sawmill-cost');
      this.sawmillUpgradeButton = document.getElementById('upgrade-sawmill');
  
      this.forceLevelEl = document.getElementById('force-upgrade-level');
      this.forceCostEl = document.getElementById('force-upgrade-cost');
      this.forceUpgradeButton = document.getElementById('force-upgrade-button');
      this.buyModeButtons = document.querySelectorAll('#upgrade-buy-mode button');
      this.buyAllButton = document.getElementById('upgrade-all-button');
      this.buyMode = '1';
  
      this.init();
    }
  
    init() {
      this.updateUI();
      this.gameState.subscribe(() => this.updateUI());
      if (this.lumberjackUpgradeButton) {
        this.lumberjackUpgradeButton.addEventListener('click', () => {
          this.purchaseUpgrade('lumberjack');
        });
      }
      if (this.sawmillUpgradeButton) {
        this.sawmillUpgradeButton.addEventListener('click', () => {
          this.purchaseUpgrade('sawmill');
        });
      }
      if (this.forceUpgradeButton) {
        this.forceUpgradeButton.addEventListener('click', () => {
          this.purchaseUpgrade('force');
        });
      }
      this.buyModeButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.setBuyMode(button.dataset.mode);
        });
      });
      if (this.buyAllButton) {
        this.buyAllButton.addEventListener('click', () => {
          ['lumberjack', 'sawmill', 'force'].forEach(type => {
            this.purchaseUpgrade(type, { silent: true });
          });
        });
      }
    }

    setBuyMode(mode) {
      this.buyMode = mode;
      this.buyModeButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.mode === mode);
      });
      this.updateUI();
    }
  
    // Calcule le coût de l'amélioration selon le niveau actuel
    getUpgradeCost(type) {
      const level = this.gameState.player.woodUpgrades[type] || 0;
      // Coût exponentiel : ici on prend par exemple baseCost * (niveau + 1)²
      return Math.floor(this.baseCost[type] * (level+1)*1.2);
    }

    getBulkCost(type, levelsToBuy) {
      let totalCost = 0;
      const currentLevel = this.gameState.player.woodUpgrades[type] || 0;
      for (let i = 0; i < levelsToBuy; i++) {
        const nextLevel = currentLevel + i;
        totalCost += Math.floor(this.baseCost[type] * (nextLevel + 1) * 1.2);
      }
      return totalCost;
    }

    getMaxAffordableLevels(type) {
      let levels = 0;
      let gold = this.gameState.player.gold;
      let currentLevel = this.gameState.player.woodUpgrades[type] || 0;
      while (gold > 0) {
        const nextCost = Math.floor(this.baseCost[type] * (currentLevel + 1) * 1.2);
        if (gold < nextCost) break;
        gold -= nextCost;
        currentLevel += 1;
        levels += 1;
      }
      return levels;
    }

    purchaseUpgrade(type, options = {}) {
      let levelsToBuy = 1;
      if (this.buyMode === '10') {
        levelsToBuy = 10;
      } else if (this.buyMode === 'max') {
        levelsToBuy = this.getMaxAffordableLevels(type);
      }

      if (levelsToBuy === 0) {
        if (!options.silent) {
          this.gameState.emit('toast', {
            type: 'warning',
            message: `Or insuffisant pour ${type}.`
          });
        }
        return;
      }

      const cost = this.getBulkCost(type, levelsToBuy);
      if (this.gameState.player.gold >= cost) {
        this.gameState.updateGold(-cost);
        this.gameState.player.woodUpgrades[type] = (this.gameState.player.woodUpgrades[type] || 0) + levelsToBuy;
        if (type === 'force') {
          this.gameState.player.forceMultiplier += 0.5 * levelsToBuy;
        }
        if (!options.silent) {
          this.gameState.emit('toast', {
            type: 'success',
            message: `Upgrade ${type} +${levelsToBuy} acheté !`
          });
        }
        this.updateUI();
      } else if (!options.silent) {
        this.gameState.emit('toast', {
          type: 'warning',
          message: `Pas assez d'or (${formatNumber(cost)} requis).`
        });
      }
    }
  
    updateUI() {
      const modeLabel = this.buyMode === 'max' ? 'max' : this.buyMode;
      if (this.lumberjackLevelEl) {
        this.lumberjackLevelEl.textContent = `Niveau : ${this.gameState.player.woodUpgrades.lumberjack}`;
      }
      if (this.lumberjackCostEl) {
        const levels = this.buyMode === 'max' ? this.getMaxAffordableLevels('lumberjack') : Number(this.buyMode);
        const cost = levels > 0 ? this.getBulkCost('lumberjack', levels) : this.getUpgradeCost('lumberjack');
        this.lumberjackCostEl.textContent = `Coût (x${modeLabel}) : ${formatNumber(cost)} Gold`;
      }
      if (this.sawmillLevelEl) {
        this.sawmillLevelEl.textContent = `Niveau : ${this.gameState.player.woodUpgrades.sawmill}`;
      }
      if (this.sawmillCostEl) {
        const levels = this.buyMode === 'max' ? this.getMaxAffordableLevels('sawmill') : Number(this.buyMode);
        const cost = levels > 0 ? this.getBulkCost('sawmill', levels) : this.getUpgradeCost('sawmill');
        this.sawmillCostEl.textContent = `Coût (x${modeLabel}) : ${formatNumber(cost)} Gold`;
      }
      if (this.forceLevelEl) {
        this.forceLevelEl.textContent = `Force Upgrade : Niveau ${this.gameState.player.woodUpgrades.force}`;
      }
      if (this.forceCostEl) {
        const levels = this.buyMode === 'max' ? this.getMaxAffordableLevels('force') : Number(this.buyMode);
        const cost = levels > 0 ? this.getBulkCost('force', levels) : this.getUpgradeCost('force');
        this.forceCostEl.textContent = `Coût (x${modeLabel}) : ${formatNumber(cost)} Gold`;
      }
    }
  }
  
