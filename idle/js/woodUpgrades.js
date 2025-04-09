// woodUpgrades.js
export class WoodUpgrades {
    constructor(gameState) {
      this.gameState = gameState;
      // Initialisation des upgrades si non définis
      if (!this.gameState.player.woodUpgrades) {
        // On inclut désormais force en plus de lumberjack et sawmill
        this.gameState.player.woodUpgrades = { lumberjack: 0, sawmill: 0, force: 0 };
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
  
      this.init();
    }
  
    init() {
      this.updateUI();
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
    }
  
    // Calcule le coût de l'amélioration selon le niveau actuel
    getUpgradeCost(type) {
      const level = this.gameState.player.woodUpgrades[type] || 0;
      // Coût exponentiel : ici on prend par exemple baseCost * (niveau + 1)²
      return Math.floor(this.baseCost[type] * (level+1)*1.2);
    }
  
    purchaseUpgrade(type) {
      const cost = this.getUpgradeCost(type);
      if (this.gameState.player.gold >= cost) {
        // Déduire le coût
        this.gameState.player.gold -= cost;
        // Augmenter le niveau de l'amélioration pour le type donné
        this.gameState.player.woodUpgrades[type] = (this.gameState.player.woodUpgrades[type] || 0) + 1;
        // Si c'est une amélioration de force, augmenter le multiplicateur (par exemple +0.5 par niveau)
        if (type === 'force') {
          this.gameState.player.forceMultiplier += 0.5;
        }
        // Notifier les observateurs pour mettre à jour l'UI
        this.gameState.notifyObservers();
        this.updateUI();
      } else {
        alert(`Pas assez d'or pour améliorer ${type}. Coût : ${cost} Gold.`);
      }
    }
  
    updateUI() {
      if (this.lumberjackLevelEl) {
        this.lumberjackLevelEl.textContent = `Niveau : ${this.gameState.player.woodUpgrades.lumberjack}`;
      }
      if (this.lumberjackCostEl) {
        this.lumberjackCostEl.textContent = `Coût : ${this.getUpgradeCost('lumberjack')} Gold`;
      }
      if (this.sawmillLevelEl) {
        this.sawmillLevelEl.textContent = `Niveau : ${this.gameState.player.woodUpgrades.sawmill}`;
      }
      if (this.sawmillCostEl) {
        this.sawmillCostEl.textContent = `Coût : ${this.getUpgradeCost('sawmill')} Gold`;
      }
      if (this.forceLevelEl) {
        this.forceLevelEl.textContent = `Force Upgrade : Niveau ${this.gameState.player.woodUpgrades.force}`;
      }
      if (this.forceCostEl) {
        this.forceCostEl.textContent = `Coût : ${this.getUpgradeCost('force')} Gold`;
      }
    }
  }
  