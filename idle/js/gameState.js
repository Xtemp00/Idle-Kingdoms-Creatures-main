// gameState.js
export default class GameState {
  constructor() {
    this.player = {
      name: "Joueur",
      level: 1,
      xp:0,
      gold: 1000000,
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
  
  // Mise à jour de l'XP et montée de niveau
  updateXP(xpGained) {
    // Ajoute l'XP gagné
    this.player.xp += xpGained;
    
    // Détermine l'XP nécessaire pour le prochain niveau.
    // Ici, on définit XP requis = 100 * niveau actuel
    let xpNeeded = 100 * this.player.level;
    
    // Tant que le joueur possède suffisamment d'XP, on augmente son niveau.
    while (this.player.xp >= xpNeeded) {
      this.player.xp -= xpNeeded;  // Retirer l'XP nécessaire pour le passage de niveau
      this.player.level++;         // Monter d'un niveau
      xpNeeded = 100 * this.player.level;  // Recalculer l'XP nécessaire pour le niveau suivant
    }
    
    // On notifie les observateurs pour mettre à jour l'interface
    this.notifyObservers();
  }
  
  subscribe(callback) {
    this.observers.push(callback);
  }

  notifyObservers() {
    this.observers.forEach(callback => callback(this.player));
  }
}

