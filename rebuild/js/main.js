import GameState from './gameState.js';
import { UIManager } from './uiManager.js';
import { WoodManager } from './woodManagement.js';
import { WoodUpgrades } from './woodUpgrades.js';

document.addEventListener('DOMContentLoaded', () => {
  const gameState = new GameState();
  const uiManager = new UIManager(gameState);
  const woodManager = new WoodManager(gameState);
  const woodUpgrades = new WoodUpgrades(gameState);

  // Exemple pour tester : on peut mettre à jour quelques statistiques après 2 secondes
  setTimeout(() => {
    gameState.updateGold(50);
    gameState.updateInventory("Wood", 10);
  }, 2000);
});
