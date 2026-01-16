import { clamp, formatNumber } from './utils.js';

export class FishingManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.state = 'idle';
    this.biteRemaining = 0;
    this.biteTotal = 0;
    this.hookRemaining = 0;
    this.hookTotal = 0;
    this.catchProgress = 0;
    this.catchTarget = 100;
    this.lastTick = performance.now();
    this.autoCastTimeout = null;

    this.ensureFishingState();
    this.cacheElements();
    this.bindEvents();
    this.updateUI();
    this.startTicker();
  }

  ensureFishingState() {
    const player = this.gameState.player;
    if (!player.skills) {
      player.skills = {};
    }
    if (!player.skills.fishing) {
      player.skills.fishing = 1;
    }
    if (!player.fishing) {
      player.fishing = {
        level: 1,
        xp: 0,
        upgrades: {
          rod: 0,
          reel: 0,
          autoCast: 0
        },
        stats: {
          fishCaught: 0,
          currentStreak: 0,
          bestStreak: 0
        }
      };
    }
  }

  cacheElements() {
    this.castButton = document.getElementById('fishing-cast-button');
    this.reelButton = document.getElementById('fishing-reel-button');
    this.statusEl = document.getElementById('fishing-status');
    this.biteProgressEl = document.getElementById('fishing-bite-progress');
    this.catchProgressEl = document.getElementById('fishing-catch-progress');
    this.logEl = document.getElementById('fishing-log');
    this.levelEl = document.getElementById('fishing-level');
    this.streakEl = document.getElementById('fishing-streak');
    this.fishCountEl = document.getElementById('fishing-count');
    this.upgradeCards = document.querySelectorAll('[data-fishing-upgrade]');
  }

  bindEvents() {
    if (this.castButton) {
      this.castButton.addEventListener('click', () => this.castLine());
    }
    if (this.reelButton) {
      this.reelButton.addEventListener('click', () => this.reel());
    }
    if (this.upgradeCards?.length) {
      this.upgradeCards.forEach((card) => {
        const button = card.querySelector('[data-upgrade-button]');
        const upgradeId = card.dataset.fishingUpgrade;
        if (button && upgradeId) {
          button.addEventListener('click', () => this.buyUpgrade(upgradeId));
        }
      });
    }
  }

  startTicker() {
    this.tickInterval = setInterval(() => this.tick(), 120);
  }

  tick() {
    const now = performance.now();
    const deltaMs = now - this.lastTick;
    this.lastTick = now;
    const deltaSec = deltaMs / 1000;

    if (this.state === 'waiting') {
      this.biteRemaining = Math.max(this.biteRemaining - deltaMs, 0);
      if (this.biteRemaining === 0) {
        this.onBite();
      }
      this.updateUI();
      return;
    }

    if (this.state === 'hooked') {
      this.hookRemaining = Math.max(this.hookRemaining - deltaMs, 0);
      const decay = this.getCatchDecay();
      const autoReel = this.getAutoReelRate();
      this.catchProgress = clamp(
        this.catchProgress + autoReel * deltaSec - decay * deltaSec,
        0,
        this.catchTarget
      );

      if (this.catchProgress >= this.catchTarget) {
        this.catchFish();
      } else if (this.hookRemaining === 0) {
        this.escapeFish();
      }
      this.updateUI();
    }
  }

  castLine() {
    if (this.state !== 'idle') {
      return;
    }
    this.clearAutoCast();
    this.state = 'waiting';
    this.biteTotal = this.getBiteTime();
    this.biteRemaining = this.biteTotal;
    this.catchProgress = 0;
    this.log('Vous lancez la ligne et attendez une touche...');
    this.updateUI();
  }

  onBite() {
    this.state = 'hooked';
    this.hookTotal = this.getHookWindow();
    this.hookRemaining = this.hookTotal;
    this.catchProgress = 0;
    this.log('Un poisson mord ! Moulinet !');
  }

  reel() {
    if (this.state !== 'hooked') {
      return;
    }
    this.catchProgress = clamp(
      this.catchProgress + this.getReelPower(),
      0,
      this.catchTarget
    );
    this.updateUI();
  }

  catchFish() {
    const rewardMultiplier =
      this.gameState.player.bonuses.rewardMultiplier
      * (this.gameState.player.petBonuses?.rewardMultiplier || 1)
      * this.gameState.getPrestigeBoost();
    const fishAmount = Math.max(1, Math.floor((1 + this.getBaitBonus()) * rewardMultiplier));
    const goldAmount = Math.ceil((6 + this.getFishingLevel()) * rewardMultiplier);
    const xpAmount = Math.ceil((8 + this.getFishingLevel()) * rewardMultiplier);

    this.gameState.updateInventory('Fish', fishAmount);
    this.gameState.updateGold(goldAmount);
    this.gameState.updateXP(xpAmount);
    this.addFishingXP(6 + this.getFishingLevel());

    this.gameState.player.fishing.stats.fishCaught += fishAmount;
    this.gameState.player.fishing.stats.currentStreak += 1;
    this.gameState.player.fishing.stats.bestStreak = Math.max(
      this.gameState.player.fishing.stats.bestStreak,
      this.gameState.player.fishing.stats.currentStreak
    );

    this.state = 'idle';
    this.log(`Capture ! +${fishAmount} poisson(s), +${goldAmount} gold.`);
    this.scheduleAutoCast();
    this.updateUI();
  }

  escapeFish() {
    this.state = 'idle';
    this.gameState.player.fishing.stats.currentStreak = 0;
    this.log('Le poisson s’échappe... retentez.');
    this.scheduleAutoCast();
    this.updateUI();
  }

  scheduleAutoCast() {
    if (this.gameState.player.fishing.upgrades.autoCast <= 0) {
      return;
    }
    const delay = this.getAutoCastDelay();
    this.clearAutoCast();
    this.autoCastTimeout = setTimeout(() => {
      if (this.state === 'idle') {
        this.castLine();
      }
    }, delay);
  }

  clearAutoCast() {
    if (this.autoCastTimeout) {
      clearTimeout(this.autoCastTimeout);
      this.autoCastTimeout = null;
    }
  }

  addFishingXP(amount) {
    const fishing = this.gameState.player.fishing;
    fishing.xp += amount;
    let needed = this.getFishingXpNeeded(fishing.level);
    while (fishing.xp >= needed) {
      fishing.xp -= needed;
      fishing.level += 1;
      needed = this.getFishingXpNeeded(fishing.level);
    }
    this.gameState.player.skills.fishing = fishing.level;
  }

  getFishingXpNeeded(level) {
    return Math.ceil(40 + level * 20);
  }

  getFishingLevel() {
    return this.gameState.player.fishing.level;
  }

  getUpgradeData() {
    return {
      rod: {
        label: 'Canne équilibrée',
        description: 'Réduit le temps avant la morsure.',
        baseCost: 60,
        scale: 1.55
      },
      reel: {
        label: 'Moulinet orbital',
        description: 'Ajoute un auto-moulinage constant.',
        baseCost: 140,
        scale: 1.6
      },
      autoCast: {
        label: 'Capteur autonome',
        description: 'Relance la ligne automatiquement après une prise.',
        baseCost: 320,
        scale: 1.75
      }
    };
  }

  getUpgradeLevel(id) {
    return this.gameState.player.fishing.upgrades[id] || 0;
  }

  getUpgradeCost(id) {
    const upgrade = this.getUpgradeData()[id];
    if (!upgrade) return null;
    const level = this.getUpgradeLevel(id);
    return Math.ceil(upgrade.baseCost * Math.pow(upgrade.scale, level));
  }

  buyUpgrade(id) {
    const cost = this.getUpgradeCost(id);
    if (cost === null) return;
    if (this.gameState.player.gold < cost) {
      this.log('Pas assez de gold pour cette amélioration.');
      return;
    }
    this.gameState.updateGold(-cost);
    this.gameState.player.fishing.upgrades[id] += 1;
    this.log(`Amélioration achetée : ${this.getUpgradeData()[id].label}.`);
    this.updateUI();
  }

  getBiteTime() {
    const rodLevel = this.getUpgradeLevel('rod');
    const levelBonus = this.getFishingLevel() * 0.02;
    const reduction = rodLevel * 0.08 + levelBonus;
    const base = 8000;
    return Math.max(2200, base * (1 - clamp(reduction, 0, 0.65)));
  }

  getHookWindow() {
    const levelBonus = this.getFishingLevel() * 0.2;
    return Math.max(7000, 10500 + levelBonus * 1000);
  }

  getReelPower() {
    const reelLevel = this.getUpgradeLevel('reel');
    return 9 + reelLevel * 3 + this.getFishingLevel() * 0.6;
  }

  getAutoReelRate() {
    const reelLevel = this.getUpgradeLevel('reel');
    return reelLevel * 2.2 + this.getFishingLevel() * 0.12;
  }

  getCatchDecay() {
    return Math.max(1.5, 4 - this.getFishingLevel() * 0.05);
  }

  getBaitBonus() {
    return this.getUpgradeLevel('rod') * 0.2;
  }

  getAutoCastDelay() {
    return Math.max(1400, 3600 - this.getUpgradeLevel('autoCast') * 500);
  }

  updateUI() {
    if (this.statusEl) {
      if (this.state === 'idle') {
        this.statusEl.textContent = 'Prêt à lancer la ligne.';
      }
      if (this.state === 'waiting') {
        this.statusEl.textContent = 'Morsure imminente...';
      }
      if (this.state === 'hooked') {
        this.statusEl.textContent = 'Poisson accroché ! Gardez le rythme.';
      }
    }
    if (this.castButton) {
      this.castButton.disabled = this.state !== 'idle';
    }
    if (this.reelButton) {
      this.reelButton.disabled = this.state !== 'hooked';
    }

    if (this.biteProgressEl) {
      const percent = this.biteTotal ? (1 - this.biteRemaining / this.biteTotal) * 100 : 0;
      this.biteProgressEl.style.width = `${clamp(percent, 0, 100)}%`;
    }
    if (this.catchProgressEl) {
      const percent = (this.catchProgress / this.catchTarget) * 100;
      this.catchProgressEl.style.width = `${clamp(percent, 0, 100)}%`;
    }

    if (this.levelEl) {
      const fishing = this.gameState.player.fishing;
      const needed = this.getFishingXpNeeded(fishing.level);
      this.levelEl.textContent = `Niveau ${fishing.level} (${formatNumber(fishing.xp)} / ${formatNumber(needed)} xp)`;
    }
    if (this.streakEl) {
      const stats = this.gameState.player.fishing.stats;
      this.streakEl.textContent = `Série : ${stats.currentStreak} (record ${stats.bestStreak})`;
    }
    if (this.fishCountEl) {
      const stats = this.gameState.player.fishing.stats;
      this.fishCountEl.textContent = `Poissons attrapés : ${formatNumber(stats.fishCaught)}`;
    }
    if (this.upgradeCards?.length) {
      this.upgradeCards.forEach((card) => {
        const upgradeId = card.dataset.fishingUpgrade;
        const levelEl = card.querySelector('[data-upgrade-level]');
        const costEl = card.querySelector('[data-upgrade-cost]');
        const button = card.querySelector('[data-upgrade-button]');
        if (!upgradeId) return;
        const level = this.getUpgradeLevel(upgradeId);
        const cost = this.getUpgradeCost(upgradeId);
        if (levelEl) {
          levelEl.textContent = `Niveau : ${level}`;
        }
        if (costEl) {
          costEl.textContent = `Coût : ${formatNumber(cost)} gold`;
        }
        if (button) {
          button.disabled = this.gameState.player.gold < cost;
        }
      });
    }
  }

  log(message) {
    if (!this.logEl) return;
    const entry = document.createElement('div');
    entry.textContent = message;
    this.logEl.prepend(entry);
    const entries = this.logEl.querySelectorAll('div');
    if (entries.length > 6) {
      entries[entries.length - 1].remove();
    }
  }
}
