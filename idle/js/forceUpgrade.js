// forceUpgrade.js
export class ForceUpgrade {
    constructor(gameState) {
      this.gameState = gameState;
      // Initialiser la force upgrade et le multiplicateur s'ils ne sont pas définis
      if (this.gameState.player.forceUpgrade === undefined) {
        this.gameState.player.forceUpgrade = 0;
      }
      if (this.gameState.player.forceMultiplier === undefined) {
        this.gameState.player.forceMultiplier = 1; // Multiplicateur de base = 1
      }
      this.baseCost = 200; // Coût de base pour l'amélioration Force
  
      // Récupérer les éléments de l'interface pour afficher le niveau et le coût de l'amélioration Force
      this.forceLevelEl = document.getElementById("force-upgrade-level");
      this.forceCostEl = document.getElementById("force-upgrade-cost");
      this.forceUpgradeButton = document.getElementById("force-upgrade-button");
  
      this.init();
    }
  
    init() {
      this.updateUI();
      if (this.forceUpgradeButton) {
        this.forceUpgradeButton.addEventListener("click", () => {
          this.purchaseUpgrade();
        });
      }
    }
  
    getUpgradeCost() {
      const level = this.gameState.player.forceUpgrade;
      // Coût exponentiel : par exemple, 200, 400, 800, ...
      return this.baseCost * level;
    }
  
    purchaseUpgrade() {
      const cost = this.getUpgradeCost();
      if (this.gameState.player.gold >= cost) {
        // Déduire le coût directement dans player.gold
        this.gameState.player.gold -= cost;
        // Augmenter le niveau d'amélioration Force
        this.gameState.player.forceUpgrade += 1;
        // Augmenter le multiplicateur de force, par exemple +0.5 par niveau
        this.gameState.player.forceMultiplier += 0.5;
        this.updateUI();
        // Notifier les observateurs pour mettre à jour l'interface du joueur
        this.gameState.notifyObservers();
      } else {
        alert("Pas assez d'or pour améliorer votre force !");
      }
    }
  
    updateUI() {
      if (this.forceLevelEl) {
        this.forceLevelEl.textContent = "Force Upgrade : Niveau " + this.gameState.player.forceUpgrade;
      }
      if (this.forceCostEl) {
        this.forceCostEl.textContent = "Coût : " + this.getUpgradeCost() + " PO";
      }
    }
  }
  