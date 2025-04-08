// woodManagement.js
import { trees } from './woods.js';

export class WoodManager {
  constructor(gameState) {
    this.gameState = gameState;
    // S'assurer que l'objet milestones existe pour stocker le compteur par type d'arbre
    if (!this.gameState.player.milestones) {
      this.gameState.player.milestones = {};
    }
    
    if (!this.gameState.player.woodUpgrades) {
      this.gameState.player.woodUpgrades = { lumberjack: 0, sawmill: 0 };
    }
    this.clickDamage = 1;
    this.treeElement = document.getElementById('tree');
    this.treeProgressBar = document.getElementById('tree-progress');
    this.treeNameEl = document.getElementById('tree-name');
    this.treeHealthEl = document.getElementById('tree-health');
    
    // Élément pour afficher la progression du milestone (par exemple, une barre verticale)
    this.treeMilestoneEl = document.getElementById('tree-milestone');
    
    this.currentTree = null;
    this.currentTreeHealth = 0;
    this.maxTreeHealth = 0;
    // Suppression de progressionMultiplier pour que l'augmentation ne se fasse qu'avec le bonus milestone
    // this.progressionMultiplier = 1;
    
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

  setDPSCalculator(dpsCalculator) {
    this.dpsCalculator = dpsCalculator;
  }
    
  applyClickDamage() {
    const effectiveDamage = this.clickDamage * this.gameState.player.forceMultiplier;
    this.dealDamage(effectiveDamage);
    if (this.dpsCalculator) {
      this.dpsCalculator.recordClick(effectiveDamage);
    }
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
  
  updateMilestoneUI(milestoneCount) {
    // Calcul du pourcentage de la barre
    let progressPercent = (milestoneCount % 10) / 10 * 100;
    if (this.treeMilestoneEl) {
      this.treeMilestoneEl.style.height = progressPercent + '%';
    }
  
    // Calcul de combien de coupes pour le prochain palier
    let coupesRestantes = 10 - ((milestoneCount % 10) === 0 ? 10 : (milestoneCount % 10));
    // Bonus actuel (milestoneLevel), ou bonus du prochain palier
    let milestoneLevel = Math.floor(milestoneCount / 10);
    let nextMilestoneBonus = (milestoneLevel + 1) * 20; // Ex: +20%, +40%, etc.
  
    // Mettre à jour le texte dans #milestone-text
    const milestoneTextEl = document.getElementById('milestone-text');
    if (milestoneTextEl) {
      milestoneTextEl.innerHTML = `
        <strong>Arbre actuel :</strong> ${this.currentTree.name}<br>
        <strong>Coupe n° :</strong> ${milestoneCount}<br>
        <strong>Prochain palier dans :</strong> ${coupesRestantes} coupes<br>
        <strong>Bonus au prochain palier :</strong> +${nextMilestoneBonus}% HP / +${nextMilestoneBonus}% Gold
      `;
    }
  }
  
  
  spawnNewTree() {
    // Sélectionner l’arbre aléatoirement
    this.currentTree = this.selectRandomTree();
    console.log("Arbre sélectionné :", this.currentTree.name);
    
    // Mettez à jour le compteur de spawn pour cet arbre
    this.gameState.player.totalSpawns = (this.gameState.player.totalSpawns || 0) + 1;
    if (!this.gameState.player.spawnCount) {
      this.gameState.player.spawnCount = {};
    }
    this.gameState.player.spawnCount[this.currentTree.name] =
      (this.gameState.player.spawnCount[this.currentTree.name] || 0) + 1;
    
    if (this.treeElement && this.currentTree.image) {
      this.treeElement.style.backgroundImage = `url(${this.currentTree.image})`;
      this.treeElement.style.backgroundSize = "contain";
      this.treeElement.style.backgroundRepeat = "no-repeat";
      this.treeElement.style.backgroundPosition = "center";
    }
    
    // Récupérer le nombre de coupures déjà effectuées pour ce type d’arbre
    let milestoneCount = this.gameState.player.milestones[this.currentTree.name] || 0;
    let milestoneLevel = Math.floor(milestoneCount / 10);
    // HP bonus uniquement si le milestone est atteint : +20% par tranche de 10
    const hpMultiplier = 1 + milestoneLevel * 0.2;
    
    this.maxTreeHealth = Math.floor(this.currentTree.baseHealth * hpMultiplier);
    this.currentTreeHealth = this.maxTreeHealth;
    if (this.treeNameEl) {
      this.treeNameEl.textContent = this.currentTree.name;
    }
    this.updateTreeUI();
    this.updateMilestoneUI(milestoneCount % 10);
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
    // Récupère le compteur actuel pour ce type d'arbre
    const treeType = this.currentTree.name;
    let currentCount = this.gameState.player.milestones[treeType] || 0;
    let milestoneLevel = Math.floor(currentCount / 10);
    // Calcul du multiplicateur pour les récompenses en or : +20% par palier
    const rewardMultiplier = 1 + milestoneLevel * 0.2;
    const goldReward = Math.floor(this.currentTree.goldReward * rewardMultiplier);
    const woodReward = this.currentTree.woodReward;
    
    this.gameState.updateGold(goldReward);
    this.gameState.updateInventory("Wood", woodReward);
    
    // Incrémente le compteur de coupures pour ce type d'arbre
    currentCount++;
    this.gameState.player.milestones[treeType] = currentCount;
    
    // Met à jour l'affichage du milestone pour ce type
    this.updateMilestoneUI(currentCount % 10);
    
    // Lancer le spawn d'un nouvel arbre (le bonus HP ne s'appliquera que si le milestone est atteint)
    this.spawnNewTree();
  }
}
