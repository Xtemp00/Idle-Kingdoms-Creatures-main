import { clamp, formatNumber } from './utils.js';

const GRID_SIZE = 10;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;

const ORES = [
  {
    id: 'charbon',
    name: 'Charbon',
    rarity: 'Commun',
    minDepth: 1,
    baseWeight: 40,
    gold: 3,
    xp: 2
  },
  {
    id: 'cuivre',
    name: 'Cuivre',
    rarity: 'Commun',
    minDepth: 1,
    baseWeight: 35,
    gold: 5,
    xp: 3
  },
  {
    id: 'etain',
    name: 'Étain',
    rarity: 'Inhabituel',
    minDepth: 3,
    baseWeight: 25,
    gold: 8,
    xp: 5
  },
  {
    id: 'fer',
    name: 'Fer',
    rarity: 'Inhabituel',
    minDepth: 5,
    baseWeight: 22,
    gold: 12,
    xp: 8
  },
  {
    id: 'argent',
    name: 'Argent',
    rarity: 'Rare',
    minDepth: 8,
    baseWeight: 15,
    gold: 20,
    xp: 12
  },
  {
    id: 'or',
    name: 'Or',
    rarity: 'Rare',
    minDepth: 12,
    baseWeight: 10,
    gold: 30,
    xp: 18
  },
  {
    id: 'mithril',
    name: 'Mithril',
    rarity: 'Épique',
    minDepth: 16,
    baseWeight: 6,
    gold: 50,
    xp: 30
  },
  {
    id: 'adamantite',
    name: 'Adamantite',
    rarity: 'Épique',
    minDepth: 22,
    baseWeight: 4,
    gold: 80,
    xp: 45
  },
  {
    id: 'orichalque',
    name: 'Orichalque',
    rarity: 'Légendaire',
    minDepth: 30,
    baseWeight: 2,
    gold: 130,
    xp: 70
  },
  {
    id: 'etherium',
    name: 'Étherium',
    rarity: 'Mythique',
    minDepth: 40,
    baseWeight: 1,
    gold: 200,
    xp: 120
  }
];

const UPGRADE_CONFIG = {
  quarry: {
    name: 'Quarry directionnelle',
    maxLevel: 1,
    baseGold: 1200,
    baseResources: [
      { name: 'Charbon', amount: 25 },
      { name: 'Cuivre', amount: 15 }
    ],
    description: 'Mine automatiquement de haut en bas, colonne par colonne.'
  },
  randomStrike: {
    name: 'Frappes erratiques',
    maxLevel: 1,
    baseGold: 1800,
    baseResources: [
      { name: 'Fer', amount: 20 },
      { name: 'Argent', amount: 8 }
    ],
    description: 'Tape aléatoirement une case de la grille.'
  },
  pickaxePower: {
    name: 'Renfort de pioche',
    maxLevel: 3,
    baseGold: 400,
    baseResources: [
      { name: 'Cuivre', amount: 10 },
      { name: 'Fer', amount: 6 }
    ],
    description: "Augmente l'or et l'XP obtenus en minant."
  },
  pickaxePrecision: {
    name: 'Affûtage',
    maxLevel: 3,
    baseGold: 450,
    baseResources: [
      { name: 'Étain', amount: 10 },
      { name: 'Argent', amount: 4 }
    ],
    description: 'Augmente les chances de trouver un minerai.'
  }
};

const DEFAULT_MINING_STATE = {
  floor: 1,
  cells: [],
  quarryIndex: 0,
  upgrades: {
    quarry: 0,
    randomStrike: 0,
    pickaxePower: 0,
    pickaxePrecision: 0
  }
};

const createEmptyCells = () => Array.from({ length: CELL_COUNT }, () => ({
  revealed: false,
  type: 'hidden',
  oreId: null
}));

export class MiningManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.gridEl = document.getElementById('mine-grid');
    if (!this.gridEl) {
      return;
    }
    this.floorEl = document.getElementById('mine-floor');
    this.progressEl = document.getElementById('mine-progress');
    this.logEl = document.getElementById('mine-log');
    this.oreListEl = document.getElementById('mine-ore-list');
    this.upgradeListEl = document.getElementById('mine-upgrades');
    this.resetButton = document.getElementById('mine-reset-grid');
    this.scanButton = document.getElementById('mine-scan-grid');

    this.oreCounts = {};
    this.logMessages = [];
    this.quarryInterval = null;
    this.randomStrikeInterval = null;

    this.initState();
    this.renderGrid();
    this.renderOreList();
    this.updateUpgradeCards();
    this.updateProgress();
    this.attachEvents();
    this.startAutomation();

    this.gameState.subscribe(() => {
      this.updateOreCounts();
      this.updateUpgradeCards();
    });
  }

  initState() {
    const player = this.gameState.player;
    if (!player.mining) {
      player.mining = JSON.parse(JSON.stringify(DEFAULT_MINING_STATE));
    }
    player.mining = {
      ...DEFAULT_MINING_STATE,
      ...player.mining,
      upgrades: {
        ...DEFAULT_MINING_STATE.upgrades,
        ...(player.mining.upgrades || {})
      }
    };
    if (!Array.isArray(player.mining.cells) || player.mining.cells.length !== CELL_COUNT) {
      player.mining.cells = createEmptyCells();
    }
    this.state = player.mining;
  }

  attachEvents() {
    this.gridEl.addEventListener('click', (event) => {
      const cell = event.target.closest('.mine-cell');
      if (!cell) {
        return;
      }
      const index = Number(cell.dataset.index);
      if (Number.isNaN(index)) {
        return;
      }
      this.revealCell(index, 'joueur');
    });

    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => {
        this.resetGrid();
      });
    }

    if (this.scanButton) {
      this.scanButton.addEventListener('click', () => {
        const odds = this.getOutcomeOdds();
        this.gameState.emit('toast', {
          type: 'success',
          message: `Analyse : ${Math.round(odds.ore * 100)}% minerai, ${Math.round(odds.ladder * 100)}% échelle, ${Math.round(odds.hole * 100)}% trou.`
        });
      });
    }

    if (this.upgradeListEl) {
      this.upgradeListEl.addEventListener('click', (event) => {
        const button = event.target.closest('[data-upgrade-button]');
        if (!button) {
          return;
        }
        const card = button.closest('[data-upgrade]');
        if (!card) {
          return;
        }
        this.purchaseUpgrade(card.dataset.upgrade);
      });
    }
  }

  renderGrid() {
    this.gridEl.innerHTML = '';
    this.state.cells.forEach((cell, index) => {
      const button = document.createElement('button');
      button.className = 'mine-cell';
      button.dataset.index = index.toString();
      button.setAttribute('aria-label', `Case ${index + 1}`);
      this.gridEl.appendChild(button);
      if (cell.revealed) {
        this.updateCellElement(button, cell);
      }
    });
    this.updateFloorDisplay();
  }

  renderOreList() {
    if (!this.oreListEl) {
      return;
    }
    this.oreListEl.innerHTML = '';
    this.oreCounts = {};

    ORES.forEach((ore) => {
      const row = document.createElement('div');
      row.className = 'ore-row';
      row.innerHTML = `
        <div>
          <strong>${ore.name}</strong>
          <span class="ore-meta">${ore.rarity}</span>
          <span class="ore-meta">${ore.gold}g / ${ore.xp}xp</span>
        </div>
        <div class="ore-count">0</div>
      `;
      const countEl = row.querySelector('.ore-count');
      this.oreCounts[ore.id] = countEl;
      this.oreListEl.appendChild(row);
    });

    this.updateOreCounts();
  }

  updateOreCounts() {
    ORES.forEach((ore) => {
      const countEl = this.oreCounts[ore.id];
      if (!countEl) {
        return;
      }
      const count = this.gameState.player.inventory[ore.name] || 0;
      countEl.textContent = formatNumber(count);
    });
  }

  updateCellElement(button, cell) {
    button.classList.remove('is-empty', 'is-ore', 'is-ladder', 'is-hole');
    if (cell.type === 'empty') {
      button.classList.add('is-empty');
      button.textContent = '·';
      return;
    }
    if (cell.type === 'ladder') {
      button.classList.add('is-ladder');
      button.textContent = '🪜';
      return;
    }
    if (cell.type === 'hole') {
      button.classList.add('is-hole');
      button.textContent = '⬇️';
      return;
    }
    if (cell.type === 'ore') {
      const ore = ORES.find((item) => item.id === cell.oreId);
      button.classList.add('is-ore', `rarity-${this.getRarityClass(ore?.rarity)}`);
      button.textContent = ore ? ore.name.slice(0, 2) : '⛏️';
    }
  }

  updateFloorDisplay() {
    if (this.floorEl) {
      this.floorEl.textContent = this.state.floor.toString();
    }
  }

  updateProgress() {
    if (!this.progressEl) {
      return;
    }
    const revealed = this.state.cells.filter((cell) => cell.revealed).length;
    this.progressEl.textContent = `${revealed}/${CELL_COUNT}`;
  }

  getOutcomeOdds() {
    const baseOreChance = 0.55 + this.state.floor * 0.005 + this.getPrecisionBonus();
    const oreChance = clamp(baseOreChance, 0.55, 0.85);
    const ladderChance = 0.05;
    const holeChance = 0.01;
    const emptyChance = clamp(1 - oreChance - ladderChance - holeChance, 0.1, 0.6);
    return {
      ore: oreChance,
      ladder: ladderChance,
      hole: holeChance,
      empty: emptyChance
    };
  }

  rollOutcome() {
    const odds = this.getOutcomeOdds();
    const roll = Math.random();
    if (roll < odds.hole) {
      return { type: 'hole' };
    }
    if (roll < odds.hole + odds.ladder) {
      return { type: 'ladder' };
    }
    if (roll < odds.hole + odds.ladder + odds.ore) {
      const ore = this.pickOre();
      return { type: 'ore', oreId: ore?.id };
    }
    return { type: 'empty' };
  }

  pickOre() {
    const floor = this.state.floor;
    const available = ORES.filter((ore) => floor >= ore.minDepth);
    const weighted = available.map((ore) => ({
      ore,
      weight: ore.baseWeight + Math.max(0, floor - ore.minDepth) * 0.8
    }));
    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const item of weighted) {
      roll -= item.weight;
      if (roll <= 0) {
        return item.ore;
      }
    }
    return weighted[0]?.ore;
  }

  revealCell(index, source) {
    const cell = this.state.cells[index];
    if (!cell || cell.revealed) {
      return;
    }
    const outcome = this.rollOutcome();
    cell.revealed = true;
    cell.type = outcome.type;
    cell.oreId = outcome.oreId || null;

    const button = this.gridEl.querySelector(`[data-index="${index}"]`);
    if (button) {
      this.updateCellElement(button, cell);
    }

    if (outcome.type === 'ore' && outcome.oreId) {
      const ore = ORES.find((item) => item.id === outcome.oreId);
      if (ore) {
        const rewardMultiplier = this.getRewardMultiplier();
        const gold = Math.round(ore.gold * rewardMultiplier);
        const xp = Math.round(ore.xp * rewardMultiplier);
        this.gameState.updateInventory(ore.name, 1);
        this.gameState.updateGold(gold);
        this.gameState.updateXP(xp);
        this.addLog(`⛏️ ${source} trouve ${ore.name} (+${gold}g, +${xp}xp).`);
      }
    }

    if (outcome.type === 'ladder') {
      this.addLog('🪜 Une échelle apparaît. Descente d\'un étage.');
      this.advanceFloor(1);
      return;
    }

    if (outcome.type === 'hole') {
      const drop = Math.floor(Math.random() * 3) + 2;
      this.addLog(`⬇️ Un trou rare ! Descente de ${drop} étages.`);
      this.advanceFloor(drop);
      return;
    }

    if (outcome.type === 'empty') {
      this.addLog('... Du vide.');
    }

    this.updateProgress();
  }

  resetGrid() {
    this.state.cells = createEmptyCells();
    this.state.quarryIndex = 0;
    this.renderGrid();
    this.addLog('Vous repartez à zéro sur cet étage.');
    this.updateProgress();
  }

  advanceFloor(delta) {
    this.state.floor += delta;
    this.state.cells = createEmptyCells();
    this.state.quarryIndex = 0;
    this.renderGrid();
    this.updateProgress();
  }

  addLog(message) {
    this.logMessages.unshift(message);
    this.logMessages = this.logMessages.slice(0, 6);
    if (this.logEl) {
      this.logEl.innerHTML = this.logMessages.map((entry) => `<p>${entry}</p>`).join('');
    }
  }

  getRarityClass(rarity) {
    return (rarity || 'Commun')
      .toLowerCase()
      .replace('é', 'e')
      .replace('è', 'e')
      .replace('ê', 'e')
      .replace('û', 'u')
      .replace('ô', 'o')
      .replace('ï', 'i');
  }

  getRewardMultiplier() {
    const pickaxePower = this.state.upgrades.pickaxePower || 0;
    return (1 + pickaxePower * 0.2) * (this.gameState.player.bonuses?.rewardMultiplier || 1);
  }

  getPrecisionBonus() {
    const precisionLevel = this.state.upgrades.pickaxePrecision || 0;
    return precisionLevel * 0.04;
  }

  purchaseUpgrade(upgradeId) {
    const config = UPGRADE_CONFIG[upgradeId];
    if (!config) {
      return;
    }
    const currentLevel = this.state.upgrades[upgradeId] || 0;
    if (currentLevel >= config.maxLevel) {
      this.gameState.emit('toast', {
        type: 'warning',
        message: `${config.name} est déjà au maximum.`
      });
      return;
    }

    const cost = this.getUpgradeCost(upgradeId, currentLevel + 1);
    if (!this.canAfford(cost)) {
      this.gameState.emit('toast', {
        type: 'warning',
        message: `Ressources insuffisantes pour ${config.name}.`
      });
      return;
    }

    this.gameState.updateGold(-cost.gold);
    cost.resources.forEach((resource) => {
      this.gameState.updateInventory(resource.name, -resource.amount);
    });

    this.state.upgrades[upgradeId] = currentLevel + 1;
    this.updateUpgradeCards();
    this.startAutomation();

    this.gameState.emit('toast', {
      type: 'success',
      message: `${config.name} améliorée !`
    });
  }

  getUpgradeCost(upgradeId, level) {
    const config = UPGRADE_CONFIG[upgradeId];
    const multiplier = Math.max(1, level);
    const gold = Math.round(config.baseGold * multiplier * (upgradeId.includes('pickaxe') ? 1.2 : 1));
    const resources = config.baseResources.map((resource) => ({
      name: resource.name,
      amount: resource.amount * multiplier
    }));
    return { gold, resources };
  }

  canAfford(cost) {
    if (this.gameState.player.gold < cost.gold) {
      return false;
    }
    return cost.resources.every((resource) => {
      return (this.gameState.player.inventory[resource.name] || 0) >= resource.amount;
    });
  }

  updateUpgradeCards() {
    if (!this.upgradeListEl) {
      return;
    }
    const cards = this.upgradeListEl.querySelectorAll('[data-upgrade]');
    cards.forEach((card) => {
      const upgradeId = card.dataset.upgrade;
      const config = UPGRADE_CONFIG[upgradeId];
      if (!config) {
        return;
      }
      const level = this.state.upgrades[upgradeId] || 0;
      const levelEl = card.querySelector('[data-upgrade-level]');
      const costEl = card.querySelector('[data-upgrade-cost]');
      const button = card.querySelector('[data-upgrade-button]');

      if (levelEl) {
        levelEl.textContent = `Niveau : ${level}/${config.maxLevel}`;
      }
      if (level >= config.maxLevel) {
        if (costEl) {
          costEl.textContent = 'Amélioration au maximum.';
        }
        if (button) {
          button.disabled = true;
          button.textContent = 'Max';
        }
        return;
      }
      const nextCost = this.getUpgradeCost(upgradeId, level + 1);
      if (costEl) {
        const resourceText = nextCost.resources
          .map((resource) => `${resource.amount} ${resource.name}`)
          .join(' + ');
        costEl.textContent = `Coût : ${formatNumber(nextCost.gold)}g + ${resourceText}`;
      }
      if (button) {
        button.disabled = false;
        button.textContent = 'Acheter';
      }
    });
  }

  startAutomation() {
    if (this.state.upgrades.quarry > 0 && !this.quarryInterval) {
      this.quarryInterval = setInterval(() => {
        const index = this.findNextQuarryCell();
        if (index !== null) {
          this.revealCell(index, 'quarry');
        }
      }, 1200);
    }

    if (this.state.upgrades.randomStrike > 0 && !this.randomStrikeInterval) {
      this.randomStrikeInterval = setInterval(() => {
        const index = this.findRandomCell();
        if (index !== null) {
          this.revealCell(index, 'frappe');
        }
      }, 1600);
    }
  }

  findNextQuarryCell() {
    for (let offset = 0; offset < CELL_COUNT; offset += 1) {
      const index = (this.state.quarryIndex + offset) % CELL_COUNT;
      if (!this.state.cells[index].revealed) {
        this.state.quarryIndex = (index + 1) % CELL_COUNT;
        return index;
      }
    }
    return null;
  }

  findRandomCell() {
    const available = this.state.cells
      .map((cell, index) => (!cell.revealed ? index : null))
      .filter((index) => index !== null);
    if (!available.length) {
      return null;
    }
    const roll = Math.floor(Math.random() * available.length);
    return available[roll];
  }
}
