// gameState.js
export default class GameState {
  constructor() {
    this.player = {
      name: "Joueur",
      level: 1,
      xp:0,
      gold: 100000000,
      baseClickDamage: 1,
      inventory: {
        Wood: 0,
        Ore: 0,
        Egg: 0,
        Fish: 0,
        Charbon: 0,
        Cuivre: 0,
        Étain: 0,
        Fer: 0,
        Argent: 0,
        Or: 0,
        Mithril: 0,
        Adamantite: 0,
        Orichalque: 0,
        Étherium: 0
      },
      skills: {
        woodcutting: 1,
        mining: 1,
      },
      woodUpgrades: {},
      milestones: {},       // Compteur de coupures par type d’arbre
      spawnCount: {},       // Nombre de spawn par type d’arbre
      totalSpawns: 0,       // Total global des spawn
      forceMultiplier: 1,
      petsOwned: [],
      equippedPets: [null, null, null],
      petBonuses: {
        clickDamageMultiplier: 1,
        dpsMultiplier: 1,
        rewardMultiplier: 1
      },
      settings: {
        reducedMotion: false,
        compactUi: false
      },
      // Bonus attribués par le niveau, utilisés dans d'autres modules.
      // Par défaut, au niveau 1, les bonus sont de 1 (aucun bonus)
      bonuses: {
        clickDamageMultiplier: 1,
        dpsMultiplier: 1,
        rewardMultiplier: 1,
        cooldownReduction: 1
      },
      mining: {
        floor: 1,
        cells: [],
        quarryIndex: 0,
        upgrades: {
          quarry: 0,
          randomStrike: 0,
          pickaxePower: 0,
          pickaxePrecision: 0
        }
      },
      agriculture: {
        plots: [],
        storage: {
          Nectar: 0,
          Fibres: 0,
          Tubercules: 0
        },
        affinity: {},
        inspiration: 0,
        bloomUntil: 0,
        lastHarvests: [],
        autoHarvest: false,
        weather: {
          id: 'meteores',
          endsAt: 0
        },
        upgrades: {
          irrigation: 0,
          pollinisateurs: 0,
          mycelium: 0
        }
      }
    };
    this.observers = [];
    this.listeners = {};
  }
  // méthodes updateGold, updateInventory, subscribe, notifyObservers...

  
  updateGold(amount) {
    this.player.gold += amount;
    this.emit('gold-updated', { amount, total: this.player.gold });
    this.notifyObservers();
  }

  updateInventory(resource, amount) {
    if (!this.player.inventory[resource]) {
      this.player.inventory[resource] = 0;
    }
    this.player.inventory[resource] += amount;
    this.emit('inventory-updated', {
      resource,
      amount,
      total: this.player.inventory[resource]
    });
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
      this.emit('level-up', { level: this.player.level });
    }
    
    // On notifie les observateurs pour mettre à jour l'interface
    this.notifyObservers();
    this.recalcBonuses();
  }
  /**
   * Calcule et met à jour les bonus liés au niveau.
   *
   * - clickDamageMultiplier : augmente de 5% par niveau (ex : niveau 2 = x1.05)
   * - dpsMultiplier : augmentation identique aux dégâts de clic
   * - rewardMultiplier : augmente de 2% par niveau (ex : niveau 2 = x1.02)
   * - cooldownReduction : diminue de 1% par niveau, avec un minimum de 0.8 (soit -20% au maximum)
   */
  recalcBonuses() {
    const lvl = this.player.level;
    this.player.bonuses.clickDamageMultiplier = 1 + 0.05 * (lvl - 1);
    this.player.bonuses.dpsMultiplier = 1 + 0.05 * (lvl - 1);
    this.player.bonuses.rewardMultiplier = 1 + 0.02 * (lvl - 1);
    this.player.bonuses.cooldownReduction = Math.max(1 - 0.01 * (lvl - 1), 0.8);
  }
  
  subscribe(callback) {
    this.observers.push(callback);
  }

  notifyObservers() {
    this.observers.forEach(callback => callback(this.player));
  }

  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  emit(eventName, payload) {
    (this.listeners[eventName] || []).forEach(callback => callback(payload));
  }
}
