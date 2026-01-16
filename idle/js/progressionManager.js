import { formatNumber } from './utils.js';

const GLOBAL_OBJECTIVES = [
  {
    id: 'wood-30',
    label: 'Couper 30 arbres',
    target: 30,
    reward: 1,
    getProgress: (player) => player.stats?.treesChopped || 0
  },
  {
    id: 'wood-150',
    label: 'Couper 150 arbres',
    target: 150,
    reward: 2,
    getProgress: (player) => player.stats?.treesChopped || 0
  },
  {
    id: 'mine-40',
    label: 'Miner 40 minerais',
    target: 40,
    reward: 1,
    getProgress: (player) => player.stats?.oresMined || 0
  },
  {
    id: 'mine-floor-6',
    label: 'Atteindre l’étage 6',
    target: 6,
    reward: 1,
    getProgress: (player) => player.mining?.floor || 1
  },
  {
    id: 'pets-5',
    label: 'Ouvrir 5 œufs',
    target: 5,
    reward: 1,
    getProgress: (player) => player.stats?.eggsOpened || 0
  },
  {
    id: 'level-8',
    label: 'Atteindre le niveau 8',
    target: 8,
    reward: 1,
    getProgress: (player) => player.level || 1
  }
];

export class ProgressionManager {
  constructor(gameState, persistenceManager) {
    this.gameState = gameState;
    this.persistenceManager = persistenceManager;
    this.objectivesEl = document.getElementById('global-objectives');
    this.prestigeSummaryEl = document.getElementById('prestige-summary');
    this.prestigeDescriptionEl = document.getElementById('prestige-description');
    this.prestigeRequirementsEl = document.getElementById('prestige-requirements');
    this.prestigeButton = document.getElementById('prestige-button');
    this.init();
  }

  init() {
    if (this.prestigeButton) {
      this.prestigeButton.addEventListener('click', () => this.handlePrestige());
    }
    this.gameState.subscribe(() => this.update());
    this.update();
  }

  update() {
    this.checkObjectiveRewards();
    this.renderObjectives();
    this.renderPrestige();
  }

  checkObjectiveRewards() {
    const meta = this.gameState.player.meta;
    const completed = meta?.objectivesCompleted || {};
    GLOBAL_OBJECTIVES.forEach((objective) => {
      if (completed[objective.id]) {
        return;
      }
      const progress = objective.getProgress(this.gameState.player);
      if (progress >= objective.target) {
        completed[objective.id] = true;
        meta.legacyPoints = (meta.legacyPoints || 0) + objective.reward;
        this.gameState.emit('objective-completed', {
          label: objective.label,
          reward: objective.reward
        });
      }
    });
  }

  renderObjectives() {
    if (!this.objectivesEl) return;
    const completed = this.gameState.player.meta?.objectivesCompleted || {};
    this.objectivesEl.innerHTML = '';
    GLOBAL_OBJECTIVES.forEach((objective) => {
      const progress = objective.getProgress(this.gameState.player);
      const isDone = Boolean(completed[objective.id]);
      const card = document.createElement('div');
      card.className = `objective-card${isDone ? ' completed' : ''}`;
      const progressLabel = isDone
        ? 'Validé'
        : `${formatNumber(Math.min(progress, objective.target))} / ${formatNumber(objective.target)}`;
      card.innerHTML = `
        <div>
          <h4>${objective.label}</h4>
          <p>Récompense : +${objective.reward} cachet${objective.reward > 1 ? 's' : ''} de prestige.</p>
        </div>
        <div class="objective-progress">${progressLabel}</div>
      `;
      this.objectivesEl.appendChild(card);
    });
  }

  renderPrestige() {
    const player = this.gameState.player;
    const prestigeCount = player.meta?.prestigeCount || 0;
    const legacyPoints = player.meta?.legacyPoints || 0;
    const boost = this.gameState.getPrestigeBoost();
    if (this.prestigeSummaryEl) {
      this.prestigeSummaryEl.textContent = `Prestige x${boost.toFixed(2)}`;
    }
    if (this.prestigeDescriptionEl) {
      this.prestigeDescriptionEl.textContent = `Prestiges : ${prestigeCount} • Cachets : ${legacyPoints}. Bonus permanent sur l’or, l’XP et la puissance.`;
    }
    const requirements = [
      {
        label: 'Atteindre le niveau 10',
        isMet: player.level >= 10
      },
      {
        label: 'Couper 150 arbres',
        isMet: (player.stats?.treesChopped || 0) >= 150
      },
      {
        label: 'Miner 40 minerais',
        isMet: (player.stats?.oresMined || 0) >= 40
      }
    ];
    if (this.prestigeRequirementsEl) {
      this.prestigeRequirementsEl.innerHTML = '';
      requirements.forEach((requirement) => {
        const item = document.createElement('li');
        item.innerHTML = `${requirement.isMet ? '<span>✓</span>' : '•'} ${requirement.label}`;
        this.prestigeRequirementsEl.appendChild(item);
      });
    }
    const ready = requirements.every((requirement) => requirement.isMet);
    if (this.prestigeButton) {
      this.prestigeButton.disabled = !ready;
    }
  }

  handlePrestige() {
    const player = this.gameState.player;
    const requirementsMet = player.level >= 10
      && (player.stats?.treesChopped || 0) >= 150
      && (player.stats?.oresMined || 0) >= 40;
    if (!requirementsMet) {
      this.gameState.emit('toast', {
        type: 'warning',
        message: 'Encore un effort avant le prestige.'
      });
      return;
    }
    if (this.persistenceManager) {
      this.persistenceManager.prestigeReset();
    }
  }
}
