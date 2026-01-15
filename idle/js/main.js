import GameState from './gameState.js';
import { UIManager } from './uiManager.js';
import { WoodManager } from './woodManagement.js';
import { WoodUpgrades } from './woodUpgrades.js';
import { DPSCalculator } from './dpsCalculator.js';
import { TreeMenu } from './TreeMenu.js';
import { PetManager } from './petManager.js';
import { PersistenceManager } from './persistenceManager.js';
import { QoLManager } from './qolManager.js';
import { MiningManager } from './miningManager.js';
import { AgricultureManager } from './agricultureManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const gameState = new GameState();
  const persistenceManager = new PersistenceManager(gameState);
  const uiManager = new UIManager(gameState);
  const woodManager = new WoodManager(gameState);
  const woodUpgrades = new WoodUpgrades(gameState);
  const dpsCalculator = new DPSCalculator(gameState);
  const petManager = new PetManager(gameState);
  const miningManager = new MiningManager(gameState);
  const agricultureManager = new AgricultureManager(gameState);
  
  // Relier le DPSCalculator au WoodManager afin d'enregistrer les clics
  woodManager.setDPSCalculator(dpsCalculator);
  
  // Instancier le menu des arbres
  const treeMenu = new TreeMenu(gameState);

  const qolManager = new QoLManager(gameState, {
    woodManager,
    dpsCalculator,
    petManager,
    miningManager,
    agricultureManager,
    persistenceManager
  });

  initMainMenu({ gameState, persistenceManager });
});

const initMainMenu = ({ gameState, persistenceManager }) => {
  const sections = document.querySelectorAll('.content-section[data-section]');
  const sidebar = document.getElementById('sidebar');
  const menuScreen = document.getElementById('main-menu-screen');
  const hubScreen = document.getElementById('hub-screen');
  const startButton = document.getElementById('start-new-game');
  const resumeButton = document.getElementById('resume-game');
  const optionsButton = document.getElementById('toggle-options');
  const optionsPanel = document.getElementById('options-panel');
  const hubButtons = document.querySelectorAll('#hub-screen [data-target]');
  const hubBackButton = document.getElementById('hub-back-button');
  const hubOpenButtons = [
    document.getElementById('open-hub-button'),
    document.getElementById('open-hub-button-inline')
  ].filter(Boolean);
  const reducedMotionToggle = document.getElementById('menu-toggle-reduced-motion');
  const compactUiToggle = document.getElementById('menu-toggle-compact-ui');
  const inGameReducedMotionToggle = document.getElementById('toggle-reduced-motion');
  const inGameCompactUiToggle = document.getElementById('toggle-compact-ui');

  if (!sections.length) {
    return;
  }

  const setActiveSection = (target) => {
    sections.forEach((section) => {
      const isActive = section.dataset.section === target;
      section.classList.toggle('is-active', isActive);
      section.setAttribute('aria-hidden', String(!isActive));
    });

    if (sidebar) {
      sidebar.hidden = target !== 'wood';
    }
  };

  const openMenu = () => {
    document.body.classList.add('menu-open');
    document.body.classList.remove('hub-open');
    if (menuScreen) {
      menuScreen.setAttribute('aria-hidden', 'false');
    }
    if (hubScreen) {
      hubScreen.setAttribute('aria-hidden', 'true');
    }
  };

  const openHub = () => {
    document.body.classList.add('hub-open');
    document.body.classList.remove('menu-open');
    if (menuScreen) {
      menuScreen.setAttribute('aria-hidden', 'true');
    }
    if (hubScreen) {
      hubScreen.setAttribute('aria-hidden', 'false');
    }
  };

  const openGame = (target) => {
    document.body.classList.remove('menu-open', 'hub-open');
    if (menuScreen) {
      menuScreen.setAttribute('aria-hidden', 'true');
    }
    if (hubScreen) {
      hubScreen.setAttribute('aria-hidden', 'true');
    }
    if (target) {
      setActiveSection(target);
    }
  };

  const syncSettings = () => {
    if (reducedMotionToggle) {
      reducedMotionToggle.checked = gameState.player.settings.reducedMotion;
    }
    if (compactUiToggle) {
      compactUiToggle.checked = gameState.player.settings.compactUi;
    }
    if (inGameReducedMotionToggle) {
      inGameReducedMotionToggle.checked = gameState.player.settings.reducedMotion;
    }
    if (inGameCompactUiToggle) {
      inGameCompactUiToggle.checked = gameState.player.settings.compactUi;
    }
    document.body.classList.toggle('reduced-motion', gameState.player.settings.reducedMotion);
    document.body.classList.toggle('compact-ui', gameState.player.settings.compactUi);
  };

  syncSettings();
  gameState.on('settings-updated', syncSettings);

  if (resumeButton) {
    const saveKey = persistenceManager?.saveKey || 'idle-kingdoms-save-v1';
    const hasSave = Boolean(localStorage.getItem(saveKey));
    resumeButton.disabled = !hasSave;
  }

  if (reducedMotionToggle) {
    reducedMotionToggle.addEventListener('change', () => {
      gameState.player.settings.reducedMotion = reducedMotionToggle.checked;
      syncSettings();
      gameState.emit('settings-updated', gameState.player.settings);
    });
  }

  if (compactUiToggle) {
    compactUiToggle.addEventListener('change', () => {
      gameState.player.settings.compactUi = compactUiToggle.checked;
      syncSettings();
      gameState.emit('settings-updated', gameState.player.settings);
    });
  }

  if (optionsButton && optionsPanel) {
    optionsButton.addEventListener('click', () => {
      const isHidden = optionsPanel.hasAttribute('hidden');
      if (isHidden) {
        optionsPanel.removeAttribute('hidden');
      } else {
        optionsPanel.setAttribute('hidden', '');
      }
    });
  }

  if (startButton) {
    startButton.addEventListener('click', () => {
      if (persistenceManager) {
        persistenceManager.reset();
      }
      openHub();
    });
  }

  if (resumeButton) {
    resumeButton.addEventListener('click', () => {
      openHub();
    });
  }

  hubButtons.forEach((button) => {
    button.addEventListener('click', () => {
      openGame(button.dataset.target);
    });
  });

  if (hubBackButton) {
    hubBackButton.addEventListener('click', () => {
      openMenu();
    });
  }

  hubOpenButtons.forEach((button) => {
    button.addEventListener('click', () => {
      openHub();
    });
  });

  openMenu();
  setActiveSection('wood');
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
