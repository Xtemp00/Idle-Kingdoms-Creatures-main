// TreeMenu.js
import { trees } from './woods.js';

export class TreeMenu {
  constructor(gameState) {
    this.gameState = gameState;
    // On suppose qu'il y a un élément avec id "tree-menu" pour le menu et "tree-details" pour le panneau de détails
    this.menuEl = document.getElementById("tree-menu");
    this.detailsEl = document.getElementById("tree-details");
    this.init();
  }
  
  init() {
    this.renderMenu();
  }
  
  renderMenu() {
    // Vider le menu
    this.menuEl.innerHTML = "";
    trees.forEach(tree => {
      const item = document.createElement("div");
      item.classList.add("tree-menu-item");
      item.innerHTML = `<img src="${tree.image}" alt="${tree.name}" /><span>${tree.name}</span>`;
      item.addEventListener("click", () => {
        this.showTreeDetails(tree);
      });
      this.menuEl.appendChild(item);
    });
  }
  
  showTreeDetails(tree) {
    // On récupère la progression de milestone pour ce type
    const milestoneCount = this.gameState.player.milestones[tree.name] || 0;
    const milestoneLevel = Math.floor(milestoneCount / 10);
    const hpMultiplier = 1 + milestoneLevel * 0.2;
    const effectiveHP = Math.floor(tree.baseHealth * hpMultiplier);
    // Calcul du reward gold, appliquant le même bonus que dans woodManagement
    const rewardMultiplier = 1 + milestoneLevel * 0.2;
    const effectiveGold = Math.floor(tree.goldReward * rewardMultiplier);
    
    // Calcul du taux de drop théorique (basé sur la rareté relative)
    const totalWeight = trees.reduce((sum, t) => sum + t.rarity, 0);
    const dropRate = ((tree.rarity / totalWeight) * 100).toFixed(1);
    
    // Nombre de spawn
    const spawnCount = this.gameState.player.spawnCount ? (this.gameState.player.spawnCount[tree.name] || 0) : 0;
    const totalSpawns = this.gameState.player.totalSpawns || 0;
    
    this.detailsEl.innerHTML = `
      <h3>${tree.name}</h3>
      <p><strong>Base Health:</strong> ${tree.baseHealth}</p>
      <p><strong>Health (après milestones):</strong> ${effectiveHP}</p>
      <p><strong>Gold Reward (après milestones):</strong> ${effectiveGold}</p>
      <p><strong>Wood Reward:</strong> ${tree.woodReward}</p>
      <p><strong>Milestone Progression:</strong> ${milestoneCount} coupes (palier ${milestoneLevel})</p>
      <p><strong>Rareté:</strong> ${this.getRarityLabel(tree.rarity)}</p>
      <p><strong>Taux de drop théorique:</strong> ${dropRate}%</p>
      <p><strong>Spawn count:</strong> ${spawnCount} sur ${totalSpawns}</p>
    `;
  }
  
  // Une méthode pour donner un label à la rareté
  getRarityLabel(rarity) {
    if(rarity >= 0.7) return "Commun";
    if(rarity >= 0.4) return "Inhabituel";
    if(rarity >= 0.2) return "Rare";
    return "Épique";
  }
}
