import { clamp, formatNumber } from './utils.js';

const WEATHER_TYPES = [
  {
    id: 'meteores',
    name: 'Pluie d\'étoiles',
    description: 'Les pousses accélèrent grâce aux poussières cosmiques.',
    speedBonus: 1.2,
    yieldBonus: 1.05,
    inspirationBonus: 1.1
  },
  {
    id: 'brume',
    name: 'Brume prismatique',
    description: 'Les récoltes gagnent en rareté et en douceur.',
    speedBonus: 1.0,
    yieldBonus: 1.15,
    inspirationBonus: 1.0
  },
  {
    id: 'zenith',
    name: 'Zénith solaire',
    description: 'Les champs irradient et produisent davantage.',
    speedBonus: 0.95,
    yieldBonus: 1.25,
    inspirationBonus: 1.05
  },
  {
    id: 'nocturne',
    name: 'Veille nocturne',
    description: 'La croissance est plus lente mais l\'inspiration grimpe.',
    speedBonus: 0.9,
    yieldBonus: 1.0,
    inspirationBonus: 1.2
  }
];

const CROPS = [
  {
    id: 'roselune',
    name: 'Roselune',
    soil: 'Rosée',
    cycle: 22,
    baseYield: 6,
    resource: 'Nectar',
    flavor: 'Fleurs laiteuses qui stockent la lumière.'
  },
  {
    id: 'tubercycle',
    name: 'Tubercycle',
    soil: 'Cendre',
    cycle: 36,
    baseYield: 8,
    resource: 'Tubercules',
    flavor: 'Racines fumantes riches en énergie brute.'
  },
  {
    id: 'linova',
    name: 'Linova',
    soil: 'Brume',
    cycle: 28,
    baseYield: 5,
    resource: 'Fibres',
    flavor: 'Filaments souples utilisés par les artisans.'
  },
  {
    id: 'mielsable',
    name: 'MielSable',
    soil: 'Rosée',
    cycle: 46,
    baseYield: 10,
    resource: 'Nectar',
    flavor: 'Gouttes sucrées qui alimentent les pets.'
  },
  {
    id: 'cendria',
    name: 'Cendria',
    soil: 'Cendre',
    cycle: 54,
    baseYield: 12,
    resource: 'Tubercules',
    flavor: 'Bulbes volcaniques, parfaits pour les boosts.'
  },
  {
    id: 'brumeline',
    name: 'Brumeline',
    soil: 'Brume',
    cycle: 40,
    baseYield: 9,
    resource: 'Fibres',
    flavor: 'Plante éthérée qui réagit aux combos.'
  }
];

const PLOTS = [
  { id: 'plot-1', name: 'Terrasse Alpha', soil: 'Rosée' },
  { id: 'plot-2', name: 'Terrasse Beta', soil: 'Brume' },
  { id: 'plot-3', name: 'Terrasse Gamma', soil: 'Cendre' },
  { id: 'plot-4', name: 'Terrasse Delta', soil: 'Rosée' },
  { id: 'plot-5', name: 'Terrasse Epsilon', soil: 'Brume' },
  { id: 'plot-6', name: 'Terrasse Zeta', soil: 'Cendre' }
];

const DEFAULT_AGRI_STATE = {
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
};

const UPGRADE_CONFIG = {
  irrigation: {
    name: 'Irrigation quantique',
    description: 'Accélère la croissance des parcelles.',
    maxLevel: 3,
    baseGold: 300,
    baseResources: [
      { name: 'Fibres', amount: 6 }
    ]
  },
  pollinisateurs: {
    name: 'Essaims de pollinisateurs',
    description: 'Augmente les récoltes obtenues.',
    maxLevel: 3,
    baseGold: 420,
    baseResources: [
      { name: 'Nectar', amount: 6 }
    ]
  },
  mycelium: {
    name: 'Réseau mycélien',
    description: 'Prolonge l\'effet de l\'Éclosion.',
    maxLevel: 2,
    baseGold: 600,
    baseResources: [
      { name: 'Tubercules', amount: 8 }
    ]
  }
};

export class AgricultureManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.sectionEl = document.getElementById('section-agriculture');
    if (!this.sectionEl) {
      return;
    }
    this.plotGridEl = document.getElementById('agri-plots');
    this.storageEl = document.getElementById('agri-storage');
    this.weatherEl = document.getElementById('agri-weather');
    this.inspirationFillEl = document.getElementById('agri-bloom-fill');
    this.inspirationStatusEl = document.getElementById('agri-bloom-status');
    this.bloomButton = document.getElementById('agri-bloom-button');
    this.logEl = document.getElementById('agri-log');
    this.autoHarvestToggle = document.getElementById('agri-auto-harvest');
    this.upgradeListEl = document.getElementById('agri-upgrades');
    this.focusEl = document.getElementById('agri-focus');

    this.logMessages = [];

    this.initState();
    this.renderPlots();
    this.updateStorage();
    this.updateWeather(true);
    this.updateBloomUI();
    this.updateFocus();
    this.updateUpgradeCards();
    this.attachEvents();

    this.tickInterval = setInterval(() => this.tick(), 1000);
  }

  initState() {
    const player = this.gameState.player;
    if (!player.agriculture) {
      player.agriculture = JSON.parse(JSON.stringify(DEFAULT_AGRI_STATE));
    }
    player.agriculture = {
      ...DEFAULT_AGRI_STATE,
      ...player.agriculture,
      storage: {
        ...DEFAULT_AGRI_STATE.storage,
        ...(player.agriculture.storage || {})
      },
      upgrades: {
        ...DEFAULT_AGRI_STATE.upgrades,
        ...(player.agriculture.upgrades || {})
      }
    };
    if (!Array.isArray(player.agriculture.plots) || player.agriculture.plots.length !== PLOTS.length) {
      player.agriculture.plots = PLOTS.map((plot) => ({
        id: plot.id,
        cropId: null,
        plantedAt: null,
        readyAt: null
      }));
    }
    this.state = player.agriculture;
    if (!this.state.weather.endsAt) {
      this.rollWeather();
    }
  }

  attachEvents() {
    if (this.plotGridEl) {
      this.plotGridEl.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        const plotId = button.dataset.plotId;
        const action = button.dataset.action;
        if (action === 'plant') {
          this.handlePlant(plotId);
        }
        if (action === 'harvest') {
          this.handleHarvest(plotId);
        }
        if (action === 'clear') {
          this.clearPlot(plotId);
        }
      });
    }

    if (this.plotGridEl) {
      this.plotGridEl.addEventListener('change', (event) => {
        const select = event.target.closest('[data-plot-select]');
        if (!select) return;
        const plotId = select.dataset.plotSelect;
        const plot = this.state.plots.find((item) => item.id === plotId);
        if (!plot) return;
        plot.selectedCrop = select.value || null;
        this.updatePlotCard(plot);
      });
    }

    if (this.bloomButton) {
      this.bloomButton.addEventListener('click', () => this.triggerBloom());
    }

    if (this.autoHarvestToggle) {
      this.autoHarvestToggle.checked = this.state.autoHarvest;
      this.autoHarvestToggle.addEventListener('change', (event) => {
        this.state.autoHarvest = event.target.checked;
        this.addLog(`Auto-récolte ${this.state.autoHarvest ? 'activée' : 'désactivée'}.`);
      });
    }

    if (this.upgradeListEl) {
      this.upgradeListEl.addEventListener('click', (event) => {
        const button = event.target.closest('[data-upgrade-button]');
        if (!button) return;
        const upgradeId = button.dataset.upgradeButton;
        this.purchaseUpgrade(upgradeId);
      });
    }
  }

  tick() {
    const now = Date.now();
    if (now >= this.state.weather.endsAt) {
      this.rollWeather();
    }

    this.state.plots.forEach((plot) => {
      if (!plot.plantedAt || !plot.readyAt) {
        return;
      }
      if (now >= plot.readyAt) {
        if (this.state.autoHarvest) {
          this.handleHarvest(plot.id, true);
        }
      }
      this.updatePlotCard(plot);
    });

    this.updateBloomUI();
  }

  rollWeather() {
    const next = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
    const duration = 90000;
    this.state.weather = {
      id: next.id,
      endsAt: Date.now() + duration
    };
    this.updateWeather();
  }

  updateWeather(initial = false) {
    const weather = this.getCurrentWeather();
    if (!this.weatherEl || !weather) return;
    this.weatherEl.innerHTML = `
      <strong>${weather.name}</strong>
      <span>${weather.description}</span>
    `;
    if (!initial) {
      this.addLog(`La météo change : ${weather.name}.`);
    }
  }

  getCurrentWeather() {
    return WEATHER_TYPES.find((item) => item.id === this.state.weather.id) || WEATHER_TYPES[0];
  }

  getUpgradeMultiplier() {
    return {
      speed: 1 + this.state.upgrades.irrigation * 0.08,
      yield: 1 + this.state.upgrades.pollinisateurs * 0.1,
      bloom: 1 + this.state.upgrades.mycelium * 0.25
    };
  }

  renderPlots() {
    if (!this.plotGridEl) return;
    this.plotGridEl.innerHTML = '';
    this.state.plots.forEach((plot, index) => {
      const plotConfig = PLOTS[index];
      const card = document.createElement('div');
      card.className = 'agri-plot card';
      card.dataset.plotId = plot.id;
      card.innerHTML = `
        <div class="agri-plot-header">
          <div>
            <h4>${plotConfig.name}</h4>
            <span class="agri-plot-soil">Sol ${plotConfig.soil}</span>
          </div>
          <span class="agri-plot-status" data-plot-status></span>
        </div>
        <p class="agri-plot-flavor" data-plot-flavor></p>
        <label class="agri-select">
          <span>Culture</span>
          <select data-plot-select="${plot.id}">
            <option value="">Sélectionner</option>
            ${CROPS.map((crop) => `<option value="${crop.id}">${crop.name}</option>`).join('')}
          </select>
        </label>
        <div class="agri-progress">
          <div class="agri-progress-fill" data-plot-progress></div>
        </div>
        <div class="agri-plot-meta" data-plot-meta></div>
        <div class="agri-plot-actions">
          <button class="primary-action" data-action="plant" data-plot-id="${plot.id}">Planter</button>
          <button class="ghost-button" data-action="harvest" data-plot-id="${plot.id}">Récolter</button>
          <button class="ghost-button" data-action="clear" data-plot-id="${plot.id}">Nettoyer</button>
        </div>
      `;
      this.plotGridEl.appendChild(card);
      this.updatePlotCard(plot);
    });
  }

  updatePlotCard(plot) {
    const card = this.plotGridEl?.querySelector(`[data-plot-id="${plot.id}"]`);
    if (!card) return;
    const statusEl = card.querySelector('[data-plot-status]');
    const progressEl = card.querySelector('[data-plot-progress]');
    const metaEl = card.querySelector('[data-plot-meta]');
    const flavorEl = card.querySelector('[data-plot-flavor]');
    const selectEl = card.querySelector('[data-plot-select]');

    const crop = plot.cropId ? CROPS.find((item) => item.id === plot.cropId) : null;
    if (selectEl && plot.cropId && selectEl.value !== plot.cropId) {
      selectEl.value = plot.cropId;
    }
    if (selectEl && !plot.cropId && plot.selectedCrop) {
      selectEl.value = plot.selectedCrop;
    }

    const now = Date.now();
    let status = 'Inactif';
    let progress = 0;
    let remainingText = 'Aucune culture en place.';

    if (plot.plantedAt && plot.readyAt && crop) {
      const total = plot.readyAt - plot.plantedAt;
      const elapsed = clamp(now - plot.plantedAt, 0, total);
      progress = total > 0 ? (elapsed / total) * 100 : 0;
      const remainingMs = Math.max(plot.readyAt - now, 0);
      const remaining = Math.ceil(remainingMs / 1000);
      status = remainingMs <= 0 ? 'Prêt' : 'En croissance';
      remainingText = remainingMs <= 0 ? 'Prêt à récolter !' : `Temps restant : ${remaining}s`;
    } else if (plot.selectedCrop) {
      const selected = CROPS.find((item) => item.id === plot.selectedCrop);
      remainingText = selected ? `${selected.cycle}s • ${selected.resource}` : remainingText;
      status = 'Préparé';
    }

    if (statusEl) statusEl.textContent = status;
    if (progressEl) progressEl.style.width = `${progress}%`;
    if (metaEl) metaEl.textContent = remainingText;
    if (flavorEl) flavorEl.textContent = crop?.flavor || 'Sélectionnez une culture pour orienter la parcelle.';
  }

  handlePlant(plotId) {
    const plot = this.state.plots.find((item) => item.id === plotId);
    if (!plot) return;
    const selectedId = plot.selectedCrop || plot.cropId;
    if (!selectedId) {
      this.gameState.emit('toast', {
        type: 'warning',
        message: 'Choisissez une culture avant de planter.'
      });
      return;
    }
    if (plot.plantedAt && plot.readyAt && Date.now() < plot.readyAt) {
      this.gameState.emit('toast', {
        type: 'warning',
        message: 'Cette parcelle est déjà en croissance.'
      });
      return;
    }
    const crop = CROPS.find((item) => item.id === selectedId);
    if (!crop) return;
    const plotConfig = this.getPlotConfig(plotId);
    const weather = this.getCurrentWeather();
    const upgrades = this.getUpgradeMultiplier();
    const soilBonus = plotConfig?.soil === crop.soil ? 1.1 : 1;
    const speedMultiplier = weather.speedBonus * upgrades.speed * (this.isBloomActive() ? 1.2 : 1) * soilBonus;
    const cycleMs = Math.max(8000, crop.cycle * 1000 / speedMultiplier);
    plot.cropId = crop.id;
    plot.plantedAt = Date.now();
    plot.readyAt = plot.plantedAt + cycleMs;
    plot.selectedCrop = crop.id;
    this.addLog(`🌱 ${crop.name} plantée sur ${plotConfig?.name || 'une parcelle'}.`);
    this.updatePlotCard(plot);
  }

  handleHarvest(plotId, isAuto = false) {
    const plot = this.state.plots.find((item) => item.id === plotId);
    if (!plot || !plot.cropId || !plot.readyAt) return;
    if (Date.now() < plot.readyAt) {
      if (!isAuto) {
        this.gameState.emit('toast', {
          type: 'warning',
          message: 'La parcelle n\'est pas encore prête.'
        });
      }
      return;
    }
    const crop = CROPS.find((item) => item.id === plot.cropId);
    if (!crop) return;

    const affinity = this.state.affinity[crop.id] || 0;
    const affinityBonus = 1 + affinity * 0.04;
    const plotConfig = this.getPlotConfig(plotId);
    const soilBonus = plotConfig?.soil === crop.soil ? 1.15 : 1;
    const weather = this.getCurrentWeather();
    const upgrades = this.getUpgradeMultiplier();
    const bloomBonus = this.isBloomActive() ? 1.5 : 1;
    const yieldMultiplier = weather.yieldBonus * upgrades.yield * bloomBonus * soilBonus * affinityBonus;

    const amount = Math.max(1, Math.floor(crop.baseYield * yieldMultiplier));
    this.state.storage[crop.resource] += amount;
    this.gameState.updateXP(Math.ceil(amount * 2));
    this.gameState.updateGold(Math.ceil(amount * 3));

    this.state.affinity[crop.id] = Math.min(10, affinity + 1);
    this.bumpInspiration(crop.id, weather);
    this.addLog(`🧺 ${amount} ${crop.resource} récoltés (${crop.name}).`);

    plot.plantedAt = null;
    plot.readyAt = null;

    this.updatePlotCard(plot);
    this.updateStorage();
    this.updateFocus();
    this.updateBloomUI();

    if (!isAuto) {
      this.gameState.emit('toast', {
        type: 'success',
        message: `${crop.name} récoltée : +${amount} ${crop.resource}.`
      });
    }
  }

  clearPlot(plotId) {
    const plot = this.state.plots.find((item) => item.id === plotId);
    if (!plot) return;
    plot.plantedAt = null;
    plot.readyAt = null;
    plot.cropId = null;
    this.updatePlotCard(plot);
    this.addLog('Parcelle nettoyée pour une nouvelle rotation.');
  }

  bumpInspiration(cropId, weather) {
    const history = this.state.lastHarvests.slice(-2);
    const diversity = history.includes(cropId) ? 6 : 12;
    const weatherBonus = weather ? weather.inspirationBonus : 1;
    const gain = Math.round(diversity * weatherBonus);
    this.state.inspiration = clamp(this.state.inspiration + gain, 0, 100);
    this.state.lastHarvests.push(cropId);
    if (this.state.lastHarvests.length > 6) {
      this.state.lastHarvests.shift();
    }
  }

  triggerBloom() {
    if (this.state.inspiration < 100) {
      this.gameState.emit('toast', {
        type: 'warning',
        message: 'Inspiration insuffisante pour déclencher l\'Éclosion.'
      });
      return;
    }
    const upgrades = this.getUpgradeMultiplier();
    const duration = Math.round(45000 * upgrades.bloom);
    this.state.bloomUntil = Date.now() + duration;
    this.state.inspiration = 0;
    this.addLog('✨ Éclosion activée : croissance et récoltes boostées.');
    this.updateBloomUI();
  }

  isBloomActive() {
    return Date.now() < this.state.bloomUntil;
  }

  updateBloomUI() {
    if (!this.inspirationFillEl || !this.inspirationStatusEl) return;
    this.inspirationFillEl.style.width = `${this.state.inspiration}%`;
    if (this.isBloomActive()) {
      const remaining = Math.ceil((this.state.bloomUntil - Date.now()) / 1000);
      this.inspirationStatusEl.textContent = `Éclosion active • ${remaining}s`;
      if (this.bloomButton) {
        this.bloomButton.disabled = true;
        this.bloomButton.textContent = 'Éclosion en cours';
      }
    } else {
      this.inspirationStatusEl.textContent = `Inspiration : ${this.state.inspiration}/100`;
      if (this.bloomButton) {
        this.bloomButton.disabled = this.state.inspiration < 100;
        this.bloomButton.textContent = 'Déclencher l\'Éclosion';
      }
    }
  }

  updateStorage() {
    if (!this.storageEl) return;
    this.storageEl.innerHTML = Object.entries(this.state.storage)
      .map(([resource, amount]) => `
        <div class="agri-resource">
          <span>${resource}</span>
          <strong>${formatNumber(amount)}</strong>
        </div>
      `)
      .join('');
  }

  updateFocus() {
    if (!this.focusEl) return;
    const focusItems = CROPS.map((crop) => {
      const affinity = this.state.affinity[crop.id] || 0;
      const bonus = 1 + affinity * 0.04;
      return `
        <div class="agri-focus-card">
          <div>
            <strong>${crop.name}</strong>
            <span>${crop.resource}</span>
          </div>
          <span class="agri-focus-level">Affinité ${affinity}/10 • x${bonus.toFixed(2)}</span>
        </div>
      `;
    }).join('');

    this.focusEl.innerHTML = focusItems;
  }

  updateUpgradeCards() {
    if (!this.upgradeListEl) return;
    this.upgradeListEl.innerHTML = Object.entries(UPGRADE_CONFIG)
      .map(([id, config]) => {
        const level = this.state.upgrades[id] || 0;
        const maxed = level >= config.maxLevel;
        const goldCost = Math.round(config.baseGold * (1 + level * 0.7));
        const resourceCosts = config.baseResources.map((resource) => ({
          ...resource,
          amount: Math.round(resource.amount * (1 + level * 0.6))
        }));
        const costLabel = resourceCosts.map((resource) => `${resource.amount} ${resource.name}`).join(', ');
        return `
          <div class="upgrade-card" data-upgrade="${id}">
            <div>
              <h4>${config.name}</h4>
              <p class="upgrade-desc">${config.description}</p>
              <p class="upgrade-level">Niveau : ${level}/${config.maxLevel}</p>
              <p class="upgrade-cost">Coût : ${formatNumber(goldCost)} Gold${costLabel ? ` + ${costLabel}` : ''}</p>
            </div>
            <button class="upgrade-button" data-upgrade-button="${id}" ${maxed ? 'disabled' : ''}>${maxed ? 'Max' : 'Améliorer'}</button>
          </div>
        `;
      })
      .join('');
  }

  purchaseUpgrade(upgradeId) {
    const config = UPGRADE_CONFIG[upgradeId];
    if (!config) return;
    const currentLevel = this.state.upgrades[upgradeId] || 0;
    if (currentLevel >= config.maxLevel) {
      return;
    }
    const goldCost = Math.round(config.baseGold * (1 + currentLevel * 0.7));
    if (this.gameState.player.gold < goldCost) {
      this.gameState.emit('toast', {
        type: 'warning',
        message: 'Or insuffisant pour cette amélioration.'
      });
      return;
    }
    const resourceCosts = config.baseResources.map((resource) => ({
      ...resource,
      amount: Math.round(resource.amount * (1 + currentLevel * 0.6))
    }));
    const hasResources = resourceCosts.every((resource) => (this.state.storage[resource.name] || 0) >= resource.amount);
    if (!hasResources) {
      this.gameState.emit('toast', {
        type: 'warning',
        message: 'Ressources agricoles insuffisantes.'
      });
      return;
    }
    this.gameState.updateGold(-goldCost);
    resourceCosts.forEach((resource) => {
      this.state.storage[resource.name] -= resource.amount;
    });
    this.state.upgrades[upgradeId] = currentLevel + 1;
    this.addLog(`🔧 ${config.name} améliorée.`);
    this.updateStorage();
    this.updateUpgradeCards();
  }

  addLog(message) {
    this.logMessages.unshift(message);
    if (this.logMessages.length > 6) {
      this.logMessages.pop();
    }
    if (this.logEl) {
      this.logEl.innerHTML = this.logMessages.map((entry) => `<div>${entry}</div>`).join('');
    }
  }

  getPlotConfig(plotId) {
    return PLOTS.find((plot) => plot.id === plotId);
  }
}
