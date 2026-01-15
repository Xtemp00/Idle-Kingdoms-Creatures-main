import GameState from './gameState.js';
import { UIManager } from './uiManager.js';
import { WoodManager } from './woodManagement.js';
import { WoodUpgrades } from './woodUpgrades.js';
import { DPSCalculator } from './dpsCalculator.js';
import { TreeMenu } from './TreeMenu.js';
import { PetManager } from './petManager.js';
import { PersistenceManager } from './persistenceManager.js';
import { QoLManager } from './qolManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const gameState = new GameState();
  const persistenceManager = new PersistenceManager(gameState);
  const uiManager = new UIManager(gameState);
  const woodManager = new WoodManager(gameState);
  const woodUpgrades = new WoodUpgrades(gameState);
  const dpsCalculator = new DPSCalculator(gameState);
  const petManager = new PetManager(gameState);
  
  // Relier le DPSCalculator au WoodManager afin d'enregistrer les clics
  woodManager.setDPSCalculator(dpsCalculator);
  
  // Instancier le menu des arbres
  const treeMenu = new TreeMenu(gameState);

  const qolManager = new QoLManager(gameState, {
    woodManager,
    dpsCalculator,
    petManager,
    persistenceManager
  });

  initMainMenu();
});

const initMainMenu = () => {
  const menuButtons = document.querySelectorAll('#main-menu [data-target]');
  const sections = document.querySelectorAll('.content-section[data-section]');
  const sidebar = document.getElementById('sidebar');

  if (!menuButtons.length || !sections.length) {
    return;
  }

  const setActiveSection = (target) => {
    sections.forEach((section) => {
      const isActive = section.dataset.section === target;
      section.classList.toggle('is-active', isActive);
      section.setAttribute('aria-hidden', String(!isActive));
    });

    menuButtons.forEach((button) => {
      const isActive = button.dataset.target === target;
      button.classList.toggle('active', isActive);
      if (isActive) {
        button.setAttribute('aria-current', 'page');
      } else {
        button.removeAttribute('aria-current');
      }
    });

    if (sidebar) {
      sidebar.hidden = target !== 'wood';
    }
  };

  menuButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveSection(button.dataset.target);
    });
  });

  const defaultTarget = document.querySelector('#main-menu .menu-button.active')?.dataset.target
    || menuButtons[0]?.dataset.target;

  if (defaultTarget) {
    setActiveSection(defaultTarget);
  }
};


// main.js ou un script global
window.toggleMilestoneInfo = function() {
  const panel = document.getElementById('milestone-details');
  if (panel.style.display === 'none' || panel.style.display === '') {
    panel.style.display = 'block';
  } else {
    panel.style.display = 'none';
  }
};
