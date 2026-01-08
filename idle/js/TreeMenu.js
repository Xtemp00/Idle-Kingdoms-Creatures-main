// TreeMenu.js
import { trees } from './woods.js';

export class TreeMenu {
  constructor(gameState) {
    this.gameState = gameState;
    // On suppose qu'il y a un élément avec id "tree-menu" pour le menu
    this.menuEl = document.getElementById("tree-menu");
    this.searchInput = document.getElementById("tree-search");
    this.filterSelect = document.getElementById("tree-filter");
    this.init();
  }
  
  init() {
    this.renderMenu();
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.renderMenu());
    }
    if (this.filterSelect) {
      this.filterSelect.addEventListener('change', () => this.renderMenu());
    }
  }
  
  renderMenu() {
    // Vider le menu
    this.menuEl.innerHTML = "";
    const filteredTrees = this.getFilteredTrees();
    if (filteredTrees.length === 0) {
      const emptyEl = document.createElement('p');
      emptyEl.textContent = 'Aucun arbre trouvé.';
      this.menuEl.appendChild(emptyEl);
      return;
    }
    filteredTrees.forEach(tree => {
      const item = document.createElement("div");
      item.classList.add("tree-menu-item");
      // On utilise l'image et le nom dans chaque item
      item.innerHTML = `
        <img src="${tree.image}" alt="${tree.name}" />
        <span>${tree.name}</span>
        <em>${this.getRarityLabel(tree.rarity)}</em>
      `;
      item.addEventListener("click", () => {
        this.showTreeDetails(tree);
      });
      this.menuEl.appendChild(item);
    });
  }
  
  showTreeDetails(tree) {
    // Récupération de la progression de milestone pour ce type d'arbre
    const milestoneCount = this.gameState.player.milestones ? (this.gameState.player.milestones[tree.name] || 0) : 0;
    const milestoneLevel = this.getMilestoneLevel(milestoneCount);
    const hpMultiplier = 1 + milestoneLevel * 0.2;
    const effectiveHP = Math.floor(tree.baseHealth * hpMultiplier);
    // Bonus gold applique pareil : +20% par palier
    const rewardMultiplier = 1 + milestoneLevel * 0.2;
    const effectiveGold = Math.floor(tree.goldReward * rewardMultiplier);
    
    // Calcul du taux de drop théorique (basé sur la rareté relative)
    const totalWeight = trees.reduce((sum, t) => sum + t.rarity, 0);
    const dropRate = ((tree.rarity / totalWeight) * 100).toFixed(1);
    
    // Nombre de spawn
    const spawnCount = this.gameState.player.spawnCount ? (this.gameState.player.spawnCount[tree.name] || 0) : 0;
    const totalSpawns = this.gameState.player.totalSpawns || 0;
    
    // Préparation du contenu HTML à afficher dans le modal
    const detailsHTML = `
      <h3>${tree.name}</h3>
      <p><strong>Base Health:</strong> ${tree.baseHealth}</p>
      <p><strong>Effective Health (après milestones):</strong> ${effectiveHP}</p>
      <p><strong>Gold Reward (après milestones):</strong> ${effectiveGold}</p>
      <p><strong>Wood Reward:</strong> ${tree.woodReward}</p>
      <p><strong>Milestone Progression:</strong> ${milestoneCount} coupes (Palier ${milestoneLevel})</p>
      <p><strong>Rareté:</strong> ${this.getRarityLabel(tree.rarity)}</p>
      <p><strong>Taux de drop théorique:</strong> ${dropRate}%</p>
      <p><strong>Spawn count:</strong> ${spawnCount} sur ${totalSpawns}</p>
    `;
    
    // Appel de la fonction globale pour ouvrir le modal avec les détails
    openTreeDetailModal(detailsHTML);
  }
  
  // Méthode pour obtenir un label de rareté
  getRarityLabel(rarity) {
    if (rarity >= 0.7) return "Commun";
    if (rarity >= 0.4) return "Inhabituel";
    if (rarity >= 0.2) return "Rare";
    return "Épique";
  }

  getFilteredTrees() {
    const query = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
    const filter = this.filterSelect ? this.filterSelect.value : 'all';
    const filterMap = {
      common: 'commun',
      uncommon: 'inhabituel',
      rare: 'rare',
      epic: 'épique'
    };
    return trees.filter(tree => {
      const matchesQuery = !query || tree.name.toLowerCase().includes(query);
      const rarity = this.getRarityLabel(tree.rarity).toLowerCase();
      const matchesFilter = filter === 'all' || rarity.startsWith(filterMap[filter] || filter);
      return matchesQuery && matchesFilter;
    });
  }

  getMilestoneLevel(totalCoupes) {
    const base = 10;
    const multiplier = 1.5;
    let level = 0;
    let cumulated = 0;
    let requiredForCurrent = base * Math.pow(multiplier, level);

    while (cumulated + requiredForCurrent <= totalCoupes) {
      cumulated += requiredForCurrent;
      level++;
      requiredForCurrent = base * Math.pow(multiplier, level);
    }

    return level;
  }
}
