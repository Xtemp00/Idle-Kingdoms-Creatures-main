import { trees } from './woods.js';

export class WoodManager {
  constructor(gameState) {
    this.gameState = gameState;
    if (!this.gameState.player.woodUpgrades) {
      this.gameState.player.woodUpgrades = { lumberjack: 0, sawmill: 0 };
    }
    this.clickDamage = 1;
    this.treeElement = document.getElementById('tree');
    this.treeProgressBar = document.getElementById('tree-progress');
    this.treeNameEl = document.getElementById('tree-name');
    this.treeHealthEl = document.getElementById('tree-health');

    this.currentTree = null;
    this.currentTreeHealth = 0;
    this.maxTreeHealth = 0;
    this.progressionMultiplier = 1;

    this.init();
  }

  init() {
    this.spawnNewTree();
    this.attachClickListener();
    setInterval(() => {
      this.applyDPS();
    }, 1000);
  }

  attachClickListener() {
    if (this.treeElement) {
      this.treeElement.addEventListener('click', () => {
        this.applyClickDamage();
      });
    }
  }

  applyClickDamage() {
    // La force du joueur multiplie les dégâts de clic
    const effectiveDamage = this.clickDamage * this.gameState.player.forceMultiplier;
    this.dealDamage(effectiveDamage);
}


  applyDPS() {
    const lumberjackDPS = this.gameState.player.woodUpgrades.lumberjack * 1;
    const sawmillDPS = this.gameState.player.woodUpgrades.sawmill * 10;
    const totalDPS = lumberjackDPS + sawmillDPS;
    if (totalDPS > 0) {
      this.dealDamage(totalDPS);
    }
  }

  dealDamage(amount) {
    if (!this.currentTree) return;
    this.currentTreeHealth = Math.max(this.currentTreeHealth - amount, 0);
    this.updateTreeUI();
    if (this.currentTreeHealth === 0) {
      this.treeChopped();
    }
  }

  updateTreeUI() {
    if (this.treeProgressBar) {
      const percent = (this.currentTreeHealth / this.maxTreeHealth) * 100;
      this.treeProgressBar.style.width = `${percent}%`;
    }
    if (this.treeHealthEl) {
      this.treeHealthEl.textContent = `${Math.ceil(this.currentTreeHealth)} / ${this.maxTreeHealth}`;
    }
  }

  spawnNewTree() {
    this.currentTree = this.selectRandomTree();
    console.log("Arbre sélectionné :", this.currentTree);
    if (this.treeElement && this.currentTree.image) {
      this.treeElement.style.backgroundImage = `url(${this.currentTree.image})`;
      this.treeElement.style.backgroundSize = "contain";
      this.treeElement.style.backgroundRepeat = "no-repeat";
      this.treeElement.style.backgroundPosition = "center";
    }
    this.maxTreeHealth = Math.floor(this.currentTree.baseHealth * this.progressionMultiplier);
    this.currentTreeHealth = this.maxTreeHealth;
    if (this.treeNameEl) {
      this.treeNameEl.textContent = this.currentTree.name;
    }
    this.updateTreeUI();
  }

  selectRandomTree() {
    const totalWeight = trees.reduce((sum, tree) => sum + tree.rarity, 0);
    let random = Math.random() * totalWeight;
    for (const tree of trees) {
      random -= tree.rarity;
      if (random <= 0) {
        return tree;
      }
    }
    return trees[0];
  }

  treeChopped() {
    const goldReward = this.currentTree.goldReward;
    const woodReward = this.currentTree.woodReward;
    this.gameState.updateGold(goldReward);
    this.gameState.updateInventory("Wood", woodReward);
    this.progressionMultiplier *= 1.1;
    this.spawnNewTree();
  }
}
