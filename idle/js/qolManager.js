import { formatNumber } from './utils.js';

export class QoLManager {
  constructor(gameState, { woodManager, dpsCalculator, petManager, persistenceManager, miningManager }) {
    this.gameState = gameState;
    this.woodManager = woodManager;
    this.dpsCalculator = dpsCalculator;
    this.petManager = petManager;
    this.persistenceManager = persistenceManager;
    this.miningManager = miningManager;
    this.toastContainer = document.getElementById('toast-container');
    this.eventLogEl = document.getElementById('event-log');
    this.reducedMotionToggle = document.getElementById('toggle-reduced-motion');
    this.compactUiToggle = document.getElementById('toggle-compact-ui');
    this.maxLogEntries = 5;
    this.init();
  }

  init() {
    this.bindShortcuts();
    this.bindSettings();
    this.bindEvents();
  }

  bindShortcuts() {
    document.addEventListener('keydown', (event) => {
      const target = event.target;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }
      if (event.code === 'Space') {
        event.preventDefault();
        const activeSection = document.querySelector('.content-section.is-active')?.dataset.section;
        if (activeSection === 'mining' && this.miningManager?.isSpaceMiningEnabled()) {
          this.miningManager.startSpaceMining();
        } else {
          this.woodManager.applyClickDamage();
        }
      }
      if (event.code === 'KeyE') {
        this.petManager.openEgg();
      }
      if (event.code === 'KeyD') {
        this.dpsCalculator.toggleDetails();
      }
      if (event.code === 'KeyM') {
        window.toggleMilestoneInfo();
      }
      if (event.code === 'KeyS') {
        event.preventDefault();
        this.persistenceManager.save('manuel');
        this.showToast('Sauvegarde manuelle effectuée.', 'success');
      }
    });

    document.addEventListener('keyup', (event) => {
      if (event.code === 'Space') {
        this.miningManager?.stopSpaceMining();
      }
    });
  }

  bindSettings() {
    if (this.reducedMotionToggle) {
      this.reducedMotionToggle.checked = this.gameState.player.settings.reducedMotion;
      document.body.classList.toggle('reduced-motion', this.reducedMotionToggle.checked);
      this.reducedMotionToggle.addEventListener('change', () => {
        const enabled = this.reducedMotionToggle.checked;
        this.gameState.player.settings.reducedMotion = enabled;
        document.body.classList.toggle('reduced-motion', enabled);
      });
    }
    if (this.compactUiToggle) {
      this.compactUiToggle.checked = this.gameState.player.settings.compactUi;
      document.body.classList.toggle('compact-ui', this.compactUiToggle.checked);
      this.compactUiToggle.addEventListener('change', () => {
        const enabled = this.compactUiToggle.checked;
        this.gameState.player.settings.compactUi = enabled;
        document.body.classList.toggle('compact-ui', enabled);
      });
    }
  }

  bindEvents() {
    this.gameState.on('toast', ({ message, type }) => this.showToast(message, type));
    this.gameState.on('level-up', ({ level }) => {
      this.showToast(`Niveau ${level} atteint !`, 'success');
      this.addLog(`✨ Niveau ${level} atteint.`);
    });
    this.gameState.on('tree-chopped', ({ tree, gold, wood, xp }) => {
      this.addLog(`🪵 ${tree} coupé : +${formatNumber(gold)} Gold, +${formatNumber(wood)} Bois, +${formatNumber(xp)} XP.`);
    });
    this.gameState.on('milestone-reached', ({ tree, level }) => {
      this.showToast(`Milestone ${level} atteint sur ${tree} !`, 'success');
      this.addLog(`🏆 Milestone ${level} sur ${tree}.`);
    });
    this.gameState.on('egg-drop', ({ tree }) => {
      this.showToast(`Œuf trouvé sur ${tree} !`, 'success');
      this.addLog(`🥚 Œuf trouvé (${tree}).`);
    });
    this.gameState.on('objective-completed', ({ label, reward }) => {
      this.showToast(`Objectif terminé : ${label}`, 'success');
      this.addLog(`🎯 Objectif : ${label} (+${reward} cachet${reward > 1 ? 's' : ''}).`);
    });
    this.gameState.on('prestige', ({ count }) => {
      this.addLog(`🧬 Prestige ${count} activé. Boost permanent amélioré.`);
    });
    this.gameState.on('settings-updated', (settings) => {
      if (this.reducedMotionToggle) {
        this.reducedMotionToggle.checked = settings.reducedMotion;
        document.body.classList.toggle('reduced-motion', settings.reducedMotion);
      }
      if (this.compactUiToggle) {
        this.compactUiToggle.checked = settings.compactUi;
        document.body.classList.toggle('compact-ui', settings.compactUi);
      }
    });
  }

  showToast(message, type = 'success') {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type || ''}`.trim();
    toast.textContent = message;
    this.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  addLog(message) {
    if (!this.eventLogEl) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = message;
    this.eventLogEl.prepend(entry);
    const entries = Array.from(this.eventLogEl.querySelectorAll('.log-entry'));
    entries.slice(this.maxLogEntries).forEach(item => item.remove());
  }
}
