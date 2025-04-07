export default class GameState {
  constructor() {
    this.player = {
      name: "Joueur",
      level: 1,
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
    };
    this.observers = [];
  }

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
