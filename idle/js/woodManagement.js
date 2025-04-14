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
    const baseDamage = this.clickDamage;
    // Utilisation du bonus de clic issu du niveau
    const effectiveDamage = baseDamage * this.gameState.player.forceMultiplier * this.gameState.player.bonuses.clickDamageMultiplier;
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
  
  updateMilestoneUI(totalCoupes) {
    const base = 10;          // Nombre de coups requis pour le premier palier.
    const multiplier = 1.5;   // Chaque palier requiert 1.5 fois plus de coups.
    
    let level = 0;
    let cumulated = 0;
    let requiredForCurrent = base * Math.pow(multiplier, level);
    
    // Détermine le niveau en soustrayant les coups nécessaires pour chaque palier complet
    while (cumulated + requiredForCurrent <= totalCoupes) {
      cumulated += requiredForCurrent;
      level++;
      requiredForCurrent = base * Math.pow(multiplier, level);
    }
    
    let remainder = totalCoupes - cumulated;
    
    // Calcul de la progression dans le palier actuel (en %)
    const progressPercent = (remainder / requiredForCurrent) * 100;
    if (this.treeMilestoneEl) {
      this.treeMilestoneEl.style.height = progressPercent + '%';
    }
    
    // Nombre de coups restants pour atteindre le prochain palier
    let coupesRestantes = Math.ceil(requiredForCurrent - remainder);
    
    // Bonus prévu pour le prochain palier (exemple : +20% par palier)
    let nextMilestoneBonus = (level + 1) * 20;
    
    // Sauvegarder le niveau actuel dans la mémoire
    this.currentMilestoneLevel = level;
    
    // Mettre à jour le texte d'information
    const milestoneTextEl = document.getElementById('milestone-text');
    if (milestoneTextEl && this.currentTree) {
      milestoneTextEl.innerHTML = `
        <strong>Arbre actuel :</strong> ${this.currentTree.name}<br>
        <strong>Total Coupes :</strong> ${totalCoupes}<br>
        <strong>Palier actuel :</strong> ${level}<br>
        <strong>Prochain palier dans :</strong> ${coupesRestantes} coupes<br>
        <strong>Bonus au prochain palier :</strong> +${nextMilestoneBonus}% HP / +${nextMilestoneBonus}% Gold / +${nextMilestoneBonus}% XP
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
    // Dans spawnNewTree()
    this.updateMilestoneUI(milestoneCount);

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
    // Le palier actuel est basé sur le nombre total de coups déjà effectués
    let milestoneLevel = Math.floor(currentCount / 10);
    // Bonus milestone : par exemple, +20% par palier
    const milestoneBonus = 1 + milestoneLevel * 0.2;
    // Bonus de niveau issu des calculs dans GameState (défini par recalcBonuses)
    const levelRewardMultiplier = this.gameState.player.bonuses.rewardMultiplier || 1;
    
    // Calcule les récompenses effectives en appliquant les deux bonus
    const effectiveGoldReward = Math.floor(this.currentTree.goldReward * milestoneBonus * levelRewardMultiplier);
    const effectiveXPReward   = Math.floor(this.currentTree.xpReward   * milestoneBonus * levelRewardMultiplier);
    const woodReward = this.currentTree.woodReward; // On laisse le woodReward inchangé ou vous pouvez aussi y appliquer un bonus si souhaité
    
    // Mise à jour des ressources et de l'xp
    this.gameState.updateGold(effectiveGoldReward);
    this.gameState.updateInventory("Wood", woodReward);
    this.gameState.updateXP(effectiveXPReward);
    
    // Incrémente le compteur de coups pour ce type d'arbre
    currentCount++;
    this.gameState.player.milestones[treeType] = currentCount;
    
    // Met à jour l'affichage du milestone en passant le total complet (sans modulo)
    this.updateMilestoneUI(currentCount);
    
    // Lancer le spawn d'un nouvel arbre
    this.spawnNewTree();
  }
  
  
}
