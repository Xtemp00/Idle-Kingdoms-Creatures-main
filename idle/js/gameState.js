// gameState.js
export default class GameState {
  constructor() {
    this.player = {
      name: "Joueur",
      level: 1,
      gold: 10000,
      inventory: {
        Wood: 0,
        Ore: 0,
        Egg: 0,
        Fish: 0,
      },
      skills: {
        woodcutting: 1,
        mining: 1,
      },
      woodUpgrades: {},
      milestones: {},       // Compteur de coupures par type d’arbre
      spawnCount: {},       // Nombre de spawn par type d’arbre
      totalSpawns: 0,       // Total global des spawn
      forceMultiplier: 1
    };
    this.observers = [];
  }
  // méthodes updateGold, updateInventory, subscribe, notifyObservers...



  updateGold(amount) {
    this.player.gold += amount;
    this.notifyObservers();
  }

  updateInventory(resource, amount) {
    if (!this.player.inventory[resource]) {
      this.player.inventory[resource] = 0;
    }
    this.player.inventory[resource] += amount;
    this.notifyObservers();
  }

  subscribe(callback) {
    this.observers.push(callback);
  }

  notifyObservers() {
    this.observers.forEach(callback => callback(this.player));
  }
}
