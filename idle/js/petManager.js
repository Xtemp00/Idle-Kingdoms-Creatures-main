import { petRarities, rollPet } from './pets.js';

export class PetManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.eggCountEl = document.getElementById('egg-count');
    this.openEggButton = document.getElementById('open-egg-button');
    this.collectionEl = document.getElementById('pet-collection');
    this.slotEls = document.querySelectorAll('.pet-slot');
    this.unequipButtons = document.querySelectorAll('.unequip-button');

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

    if (this.openEggButton) {
      this.openEggButton.addEventListener('click', () => this.openEgg());
    }

    this.unequipButtons.forEach(button => {
      button.addEventListener('click', () => {
        const slotIndex = Number(button.dataset.slot);
        this.unequipPet(slotIndex);
      });
    });

    this.updatePetBonuses();
    this.gameState.subscribe(() => this.render());
    this.render();
  }

  openEgg() {
    if (this.gameState.player.inventory.Egg <= 0) {
      alert('Tu n’as pas d’œuf à ouvrir.');
      return;
    }
    this.gameState.player.inventory.Egg -= 1;
    const newPet = rollPet();
    this.gameState.player.petsOwned.push(newPet);
    this.gameState.notifyObservers();
    this.updatePetBonuses();
  }

  equipPet(petInstanceId) {
    const emptySlotIndex = this.gameState.player.equippedPets.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) {
      alert('Tous les slots sont déjà occupés.');
      return;
    }
    this.gameState.player.equippedPets[emptySlotIndex] = petInstanceId;
    this.updatePetBonuses();
    this.gameState.notifyObservers();
  }

  unequipPet(slotIndex) {
    if (this.gameState.player.equippedPets[slotIndex]) {
      this.gameState.player.equippedPets[slotIndex] = null;
      this.updatePetBonuses();
      this.gameState.notifyObservers();
    }
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

    this.gameState.player.equippedPets.forEach(instanceId => {
      if (!instanceId) return;
      const pet = this.gameState.player.petsOwned.find(item => item.instanceId === instanceId);
      if (!pet) return;
      if (pet.bonusType === 'click') {
        bonuses.clickDamageMultiplier += pet.bonusValue;
      } else if (pet.bonusType === 'dps') {
        bonuses.dpsMultiplier += pet.bonusValue;
      } else {
        bonuses.rewardMultiplier += pet.bonusValue;
      }
    });

    this.gameState.player.petBonuses = bonuses;
  }

  render() {
    const equippedSet = new Set(this.gameState.player.equippedPets.filter(Boolean));

    if (this.eggCountEl) {
      this.eggCountEl.textContent = this.gameState.player.inventory.Egg;
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
          card.innerHTML = `
            <div class="pet-card-header">
              <span>${pet.name}</span>
              <em class="rarity-${pet.rarity}">${this.getRarityLabel(pet.rarity)}</em>
            </div>
            <p>Bonus : ${this.describeBonus(pet)}</p>
          `;
          const equipButton = document.createElement('button');
          if (equippedSet.has(pet.instanceId)) {
            equipButton.textContent = 'Équipé';
            equipButton.disabled = true;
          } else {
            equipButton.textContent = 'Équiper';
            equipButton.addEventListener('click', () => this.equipPet(pet.instanceId));
          }
          card.appendChild(equipButton);
          this.collectionEl.appendChild(card);
        });
      }
    }

    this.slotEls.forEach(slotEl => {
      const slotIndex = Number(slotEl.dataset.slot);
      const petInstanceId = this.gameState.player.equippedPets[slotIndex];
      const slotLabel = slotEl.querySelector('span');
      const pet = this.gameState.player.petsOwned.find(item => item.instanceId === petInstanceId);
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
    const percent = Math.round(pet.bonusValue * 100);
    if (pet.bonusType === 'click') {
      return `+${percent}% dégâts de clic`;
    }
    if (pet.bonusType === 'dps') {
      return `+${percent}% DPS auto`;
    }
    return `+${percent}% récompenses`;
  }
}
