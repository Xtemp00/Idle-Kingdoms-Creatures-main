import { petRarities, pets, rollPet } from './pets.js';

const PET_MILESTONES = [1, 10, 25, 50];
const EVOLUTION_BONUS_STEP = 0.25;

export class PetManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.eggCountEl = document.getElementById('egg-count');
    this.openEggButton = document.getElementById('open-egg-button');
    this.collectionEl = document.getElementById('pet-collection');
    this.slotEls = document.querySelectorAll('.pet-slot');
    this.unequipButtons = document.querySelectorAll('.unequip-button');
    this.equippedCountEl = document.getElementById('pet-equipped-count');
    this.unequipAllButton = document.getElementById('unequip-all-button');

    this.init();
  }

  init() {
    if (!this.gameState.player.petsOwned) {
      this.gameState.player.petsOwned = [];
    }
    if (!this.gameState.player.equippedPets) {
      this.gameState.player.equippedPets = [null, null, null];
    }
    if (!this.gameState.player.petBonuses) {
      this.gameState.player.petBonuses = {
        clickDamageMultiplier: 1,
        dpsMultiplier: 1,
        rewardMultiplier: 1
      };
    }

    this.normalizePetCollection();
    if (this.openEggButton) {
      this.openEggButton.addEventListener('click', () => this.openEgg());
    }

    this.unequipButtons.forEach(button => {
      button.addEventListener('click', () => {
        const slotIndex = Number(button.dataset.slot);
        this.unequipPet(slotIndex);
      });
    });
    if (this.unequipAllButton) {
      this.unequipAllButton.addEventListener('click', () => this.unequipAll());
    }

    this.updatePetBonuses();
    this.gameState.subscribe(() => {
      this.normalizePetCollection();
      this.render();
    });
    this.render();
  }

  openEgg() {
    if (this.gameState.player.inventory.Egg <= 0) {
      this.gameState.emit('toast', {
        type: 'warning',
        message: 'Tu n’as pas d’œuf à ouvrir.'
      });
      return;
    }
    this.gameState.updateInventory('Egg', -1);
    const newPet = rollPet();
    const evolved = this.addOrEvolvePet(newPet);
    this.gameState.notifyObservers();
    this.updatePetBonuses();
    this.gameState.emit('toast', {
      type: 'success',
      message: evolved
        ? `${newPet.name} évolue ! Niveau ${this.getTierLabel(evolved.tier)}.`
        : `Nouveau compagnon obtenu : ${newPet.name} !`
    });
  }

  equipPet(petId) {
    const emptySlotIndex = this.gameState.player.equippedPets.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) {
      this.gameState.emit('toast', {
        type: 'warning',
        message: 'Tous les slots sont déjà occupés.'
      });
      return;
    }
    this.gameState.player.equippedPets[emptySlotIndex] = petId;
    this.updatePetBonuses();
    this.gameState.notifyObservers();
    this.gameState.emit('toast', {
      type: 'success',
      message: 'Compagnon équipé !'
    });
  }

  unequipPet(slotIndex) {
    if (this.gameState.player.equippedPets[slotIndex]) {
      this.gameState.player.equippedPets[slotIndex] = null;
      this.updatePetBonuses();
      this.gameState.notifyObservers();
      this.gameState.emit('toast', {
        type: 'warning',
        message: 'Compagnon retiré.'
      });
    }
  }

  unequipAll() {
    this.gameState.player.equippedPets = [null, null, null];
    this.updatePetBonuses();
    this.gameState.notifyObservers();
    this.gameState.emit('toast', {
      type: 'warning',
      message: 'Tous les compagnons ont été retirés.'
    });
  }

  getRarityLabel(rarityKey) {
    const rarity = petRarities.find(item => item.key === rarityKey);
    return rarity ? rarity.label : rarityKey;
  }

  updatePetBonuses() {
    const bonuses = {
      clickDamageMultiplier: 1,
      dpsMultiplier: 1,
      rewardMultiplier: 1
    };

    this.gameState.player.equippedPets.forEach(petId => {
      if (!petId) return;
      const pet = this.gameState.player.petsOwned.find(item => item.id === petId);
      if (!pet) return;
      const bonusValue = this.getPetBonusValue(pet);
      if (pet.bonusType === 'click') {
        bonuses.clickDamageMultiplier += bonusValue;
      } else if (pet.bonusType === 'dps') {
        bonuses.dpsMultiplier += bonusValue;
      } else {
        bonuses.rewardMultiplier += bonusValue;
      }
    });

    this.gameState.player.petBonuses = bonuses;
  }

  render() {
    const equippedSet = new Set(this.gameState.player.equippedPets.filter(Boolean));

    if (this.eggCountEl) {
      this.eggCountEl.textContent = this.gameState.player.inventory.Egg;
    }
    if (this.equippedCountEl) {
      const equippedCount = this.gameState.player.equippedPets.filter(Boolean).length;
      this.equippedCountEl.textContent = `${equippedCount}/3`;
    }
    if (this.openEggButton) {
      const hasEggs = this.gameState.player.inventory.Egg > 0;
      this.openEggButton.disabled = !hasEggs;
      this.openEggButton.textContent = hasEggs ? 'Ouvrir un œuf' : 'Aucun œuf';
    }

    if (this.collectionEl) {
      this.collectionEl.innerHTML = '';
      if (this.gameState.player.petsOwned.length === 0) {
        const emptyEl = document.createElement('p');
        emptyEl.textContent = 'Aucun compagnon pour le moment.';
        this.collectionEl.appendChild(emptyEl);
      } else {
        this.gameState.player.petsOwned.forEach(pet => {
          const card = document.createElement('div');
          card.classList.add('pet-card');
          card.setAttribute('role', 'button');
          card.setAttribute('tabindex', '0');
          card.setAttribute('aria-label', `Voir les stats de ${pet.name}`);
          const nextMilestone = this.getNextMilestone(pet.count);
          const progress = this.getProgressPercent(pet.count);
          card.innerHTML = `
            <div class="pet-card-header">
              <span>${pet.name}</span>
              <em class="rarity-${pet.rarity}">${this.getRarityLabel(pet.rarity)}</em>
            </div>
            <div class="pet-meta">
              <span>Évolution ${this.getTierLabel(pet.tier)}</span>
              <span>${pet.count} obtenus</span>
            </div>
            <div class="pet-progress">
              <div class="pet-progress-bar" style="width:${progress}%;"></div>
            </div>
            <p>Bonus actif : ${this.describeBonus(pet)}</p>
            <p class="pet-meta">${nextMilestone ? `Prochaine évolution à ${nextMilestone}.` : 'Évolution maximale atteinte.'}</p>
          `;
          const equipButton = document.createElement('button');
          if (equippedSet.has(pet.id)) {
            equipButton.textContent = 'Équipé';
            equipButton.disabled = true;
          } else {
            equipButton.textContent = 'Équiper';
            equipButton.addEventListener('click', (event) => {
              event.stopPropagation();
              this.equipPet(pet.id);
            });
          }
          card.appendChild(equipButton);
          card.addEventListener('click', () => this.openPetDetails(pet));
          card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              this.openPetDetails(pet);
            }
          });
          this.collectionEl.appendChild(card);
        });
      }
    }

    this.slotEls.forEach(slotEl => {
      const slotIndex = Number(slotEl.dataset.slot);
      const petInstanceId = this.gameState.player.equippedPets[slotIndex];
      const slotLabel = slotEl.querySelector('span');
      const pet = this.gameState.player.petsOwned.find(item => item.id === petInstanceId);
      slotEl.classList.toggle('occupied', Boolean(pet));
      if (slotLabel) {
        if (pet) {
          slotLabel.innerHTML = `<strong>${pet.name}</strong><br><small>${this.describeBonus(pet)}</small>`;
        } else {
          slotLabel.textContent = `Slot ${slotIndex + 1}`;
        }
      }
    });
  }

  describeBonus(pet) {
    const percent = Math.round(this.getPetBonusValue(pet) * 100);
    if (pet.bonusType === 'click') {
      return `+${percent}% dégâts de clic`;
    }
    if (pet.bonusType === 'dps') {
      return `+${percent}% DPS auto`;
    }
    return `+${percent}% récompenses`;
  }

  addOrEvolvePet(newPet) {
    const existing = this.gameState.player.petsOwned.find(pet => pet.id === newPet.id);
    if (!existing) {
      const petEntry = {
        ...newPet,
        count: 1,
        tier: 1,
        baseBonusValue: newPet.baseBonusValue ?? newPet.bonusValue ?? 0
      };
      this.gameState.player.petsOwned.push(petEntry);
      return null;
    }
    existing.count += 1;
    const nextTier = this.getTierFromCount(existing.count);
    if (nextTier > existing.tier) {
      existing.tier = nextTier;
      return existing;
    }
    return null;
  }

  normalizePetCollection() {
    const petsOwned = Array.isArray(this.gameState.player.petsOwned)
      ? this.gameState.player.petsOwned
      : [];
    const byId = new Map();
    const instanceToId = new Map();

    petsOwned.forEach((pet) => {
      if (!pet?.id) return;
      if (pet.instanceId) {
        instanceToId.set(pet.instanceId, pet.id);
      }
      const baseData = pets.find(item => item.id === pet.id) || pet;
      const baseBonusValue = baseData.baseBonusValue ?? baseData.bonusValue ?? pet.baseBonusValue ?? pet.bonusValue ?? 0;
      const entry = byId.get(pet.id) || {
        id: pet.id,
        name: baseData.name || pet.name,
        rarity: baseData.rarity || pet.rarity,
        bonusType: baseData.bonusType || pet.bonusType,
        baseBonusValue,
        count: 0,
        tier: 1
      };
      entry.count += pet.count ?? 1;
      entry.tier = Math.max(entry.tier, pet.tier ?? 1);
      byId.set(pet.id, entry);
    });

    const normalized = Array.from(byId.values()).map((pet) => ({
      ...pet,
      tier: this.getTierFromCount(pet.count)
    }));
    this.gameState.player.petsOwned = normalized;

    const equipped = Array.isArray(this.gameState.player.equippedPets)
      ? this.gameState.player.equippedPets
      : [null, null, null];
    this.gameState.player.equippedPets = equipped.map((slot) => {
      if (!slot) return null;
      if (byId.has(slot)) return slot;
      return instanceToId.get(slot) || null;
    });
  }

  getTierFromCount(count) {
    let tier = 1;
    PET_MILESTONES.forEach((milestone, index) => {
      if (count >= milestone) {
        tier = index + 1;
      }
    });
    return tier;
  }

  getNextMilestone(count) {
    return PET_MILESTONES.find((milestone) => milestone > count) || null;
  }

  getProgressPercent(count) {
    const currentTier = this.getTierFromCount(count);
    const currentMilestone = PET_MILESTONES[currentTier - 1] || 1;
    const nextMilestone = PET_MILESTONES[currentTier] || currentMilestone;
    if (nextMilestone === currentMilestone) {
      return 100;
    }
    const progress = ((count - currentMilestone) / (nextMilestone - currentMilestone)) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  }

  getTierLabel(tier) {
    const labels = ['I', 'II', 'III', 'IV'];
    return labels[tier - 1] || `${tier}`;
  }

  getPetBonusValue(pet) {
    const base = pet.baseBonusValue ?? pet.bonusValue ?? 0;
    return base * (1 + (pet.tier - 1) * EVOLUTION_BONUS_STEP);
  }

  openPetDetails(pet) {
    const bonus = this.describeBonus(pet);
    const nextMilestone = this.getNextMilestone(pet.count);
    const detailHtml = `
      <p><strong>Rareté :</strong> ${this.getRarityLabel(pet.rarity)}</p>
      <p><strong>Évolution :</strong> Niveau ${this.getTierLabel(pet.tier)}</p>
      <p><strong>Nombre obtenu :</strong> ${pet.count}</p>
      <p><strong>Bonus actuel :</strong> ${bonus}</p>
      <p><strong>Prochaine évolution :</strong> ${nextMilestone ? `${nextMilestone} exemplaires` : 'Maximum atteint'}</p>
      <p>Chaque milestone améliore les statistiques, sans doublon dans la collection.</p>
    `;
    if (typeof window.openPetDetailModal === 'function') {
      window.openPetDetailModal(detailHtml, pet.name);
    }
  }
}
