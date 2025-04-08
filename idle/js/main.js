import GameState from './gameState.js';
import { UIManager } from './uiManager.js';
import { WoodManager } from './woodManagement.js';
import { WoodUpgrades } from './woodUpgrades.js';
import { DPSCalculator } from './dpsCalculator.js';
import { TreeMenu } from './TreeMenu.js';

document.addEventListener('DOMContentLoaded', () => {
  const gameState = new GameState();
  const uiManager = new UIManager(gameState);
  const woodManager = new WoodManager(gameState);
  const woodUpgrades = new WoodUpgrades(gameState);
  const dpsCalculator = new DPSCalculator(gameState);
  
  // Relier le DPSCalculator au WoodManager afin d'enregistrer les clics
  woodManager.setDPSCalculator(dpsCalculator);
  
  // Instancier le menu des arbres
  const treeMenu = new TreeMenu(gameState);

  // Exemple pour tester des mises à jour (optionnel)
  setTimeout(() => {
    gameState.updateGold(50);
    gameState.updateInventory("Wood", 10);
  }, 2000);
});


// main.js ou un script global
window.toggleMilestoneInfo = function() {
  const panel = document.getElementById('milestone-details');
  if (panel.style.display === 'none' || panel.style.display === '') {
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
};
