const DEV_ACCESS_CODE = 'COSMOS-DEV-7429';

const RESOURCE_PACK = {
  Wood: 500,
  Egg: 5,
  Charbon: 60,
  Cuivre: 40,
  Étain: 25,
  Fer: 20,
  Argent: 12,
  Or: 6,
  Mithril: 4,
  Adamantite: 3,
  Orichalque: 2,
  Étherium: 1
};

const AGRI_PACK = {
  Nectar: 80,
  Fibres: 80,
  Tubercules: 80
};

export class DevModeManager {
  constructor(gameState, miningManager) {
    this.gameState = gameState;
    this.miningManager = miningManager;
    this.codeInput = document.getElementById('dev-code-input');
    this.codeButton = document.getElementById('dev-code-submit');
    this.statusEl = document.getElementById('dev-mode-status');
    this.controlsEl = document.getElementById('dev-controls');
    this.actionButtons = document.querySelectorAll('[data-dev-action]');
    this.init();
  }

  init() {
    if (!this.codeInput || !this.codeButton || !this.controlsEl || !this.statusEl) {
      return;
    }
    this.codeButton.addEventListener('click', () => this.tryUnlock());
    this.codeInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.tryUnlock();
      }
    });
    this.actionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.handleAction(button.dataset.devAction);
      });
    });
    if (this.gameState.player.meta?.devMode) {
      this.enableDevMode();
    } else {
      this.updateStatus(false);
    }
  }

  tryUnlock() {
    const code = this.codeInput.value.trim();
    if (code === DEV_ACCESS_CODE) {
      this.enableDevMode();
      this.gameState.emit('toast', {
        type: 'success',
        message: 'Profil développeur activé.'
      });
    } else {
      this.gameState.emit('toast', {
        type: 'warning',
        message: 'Code développeur invalide.'
      });
    }
  }

  enableDevMode() {
    this.gameState.player.meta.devMode = true;
    this.updateStatus(true);
    this.controlsEl.hidden = false;
    this.codeInput.value = '';
    this.codeInput.disabled = true;
    this.codeButton.disabled = true;
  }

  updateStatus(enabled) {
    this.statusEl.textContent = enabled ? 'Actif' : 'Verrouillé';
  }

  handleAction(action) {
    switch (action) {
      case 'xp':
        this.gameState.updateXP(1000);
        this.gameState.emit('toast', { type: 'success', message: 'XP ajoutée.' });
        break;
      case 'gold':
        this.gameState.updateGold(10000);
        this.gameState.emit('toast', { type: 'success', message: 'Gold ajouté.' });
        break;
      case 'resources':
        this.addResourcePack();
        this.gameState.emit('toast', { type: 'success', message: 'Ressources ajoutées.' });
        break;
      case 'mine-10':
        this.advanceMine(10);
        break;
      case 'mine-50':
        this.advanceMine(50);
        break;
      default:
        break;
    }
  }

  addResourcePack() {
    Object.entries(RESOURCE_PACK).forEach(([resource, amount]) => {
      this.gameState.updateInventory(resource, amount);
    });
    const storage = this.gameState.player.agriculture?.storage || {};
    Object.entries(AGRI_PACK).forEach(([resource, amount]) => {
      storage[resource] = (storage[resource] || 0) + amount;
    });
    this.gameState.notifyObservers();
  }

  advanceMine(steps) {
    if (!this.miningManager) {
      this.gameState.emit('toast', { type: 'warning', message: 'Mine indisponible.' });
      return;
    }
    this.miningManager.advanceFloor(steps);
    this.gameState.emit('toast', {
      type: 'success',
      message: `Descente accélérée de ${steps} étages.`
    });
  }
}

export const DEV_MODE_CODE = DEV_ACCESS_CODE;
