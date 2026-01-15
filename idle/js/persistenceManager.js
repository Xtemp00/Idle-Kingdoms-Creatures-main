export class PersistenceManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.saveKey = 'idle-kingdoms-save-v1';
    this.autoSaveIntervalMs = 30000;
    this.saveButton = document.getElementById('save-button');
    this.loadButton = document.getElementById('load-button');
    this.resetButton = document.getElementById('reset-button');
    this.statusEl = document.getElementById('save-status');
    this.defaultState = JSON.parse(JSON.stringify(this.gameState.player));
    this.init();
  }

  init() {
    this.load();
    if (this.saveButton) {
      this.saveButton.addEventListener('click', () => this.save('manuel'));
    }
    if (this.loadButton) {
      this.loadButton.addEventListener('click', () => this.load(true));
    }
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.reset());
    }
    window.addEventListener('beforeunload', () => this.save('auto'));
    setInterval(() => this.save('auto'), this.autoSaveIntervalMs);
  }

  save(reason = 'auto') {
    const payload = {
      version: 1,
      timestamp: Date.now(),
      player: this.gameState.player
    };
    localStorage.setItem(this.saveKey, JSON.stringify(payload));
    this.updateStatus(payload.timestamp, reason);
    this.gameState.emit('save', { reason, timestamp: payload.timestamp });
  }

  load(showToast = false) {
    const raw = localStorage.getItem(this.saveKey);
    if (!raw) {
      this.updateStatus(null);
      if (showToast) {
        this.gameState.emit('toast', {
          type: 'warning',
          message: 'Aucune sauvegarde trouvée.'
        });
      }
      return;
    }
    const payload = JSON.parse(raw);
    if (!payload?.player) {
      return;
    }
    this.applySaveData(payload.player);
    this.updateStatus(payload.timestamp);
    if (showToast) {
      this.gameState.emit('toast', {
        type: 'success',
        message: 'Sauvegarde chargée.'
      });
    }
  }

  applySaveData(savedPlayer) {
    const player = this.gameState.player;
    Object.assign(player, savedPlayer);
    player.inventory = { ...player.inventory, ...(savedPlayer.inventory || {}) };
    player.woodUpgrades = { ...player.woodUpgrades, ...(savedPlayer.woodUpgrades || {}) };
    player.milestones = { ...player.milestones, ...(savedPlayer.milestones || {}) };
    player.spawnCount = { ...player.spawnCount, ...(savedPlayer.spawnCount || {}) };
    player.petsOwned = Array.isArray(savedPlayer.petsOwned) ? savedPlayer.petsOwned : [];
    player.equippedPets = Array.isArray(savedPlayer.equippedPets) ? savedPlayer.equippedPets : [null, null, null];
    player.petBonuses = { ...player.petBonuses, ...(savedPlayer.petBonuses || {}) };
    player.settings = { ...player.settings, ...(savedPlayer.settings || {}) };
    player.agriculture = {
      ...player.agriculture,
      ...(savedPlayer.agriculture || {}),
      storage: {
        ...(player.agriculture?.storage || {}),
        ...(savedPlayer.agriculture?.storage || {})
      },
      upgrades: {
        ...(player.agriculture?.upgrades || {}),
        ...(savedPlayer.agriculture?.upgrades || {})
      }
    };
    this.gameState.notifyObservers();
    this.gameState.emit('settings-updated', player.settings);
  }

  reset() {
    if (!confirm('Réinitialiser la partie ? Cette action est irréversible.')) {
      return;
    }
    localStorage.removeItem(this.saveKey);
    this.applySaveData(JSON.parse(JSON.stringify(this.defaultState)));
    this.updateStatus(null);
    this.gameState.emit('toast', {
      type: 'warning',
      message: 'Partie réinitialisée.'
    });
  }

  updateStatus(timestamp, reason = 'auto') {
    if (!this.statusEl) return;
    if (!timestamp) {
      this.statusEl.textContent = 'Auto-save : --';
      return;
    }
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const label = reason === 'manuel' ? 'manuel' : 'auto';
    this.statusEl.textContent = `Auto-save : ${time} (${label})`;
  }
}
