export const petRarities = [
  { key: 'common', label: 'Commun', weight: 60 },
  { key: 'rare', label: 'Rare', weight: 25 },
  { key: 'epic', label: 'Épique', weight: 12 },
  { key: 'legendary', label: 'Légendaire', weight: 3 }
];

export const pets = [
  { id: 'mushroom_sprite', name: 'Esprit Champi', rarity: 'common', bonusType: 'reward', bonusValue: 0.04 },
  { id: 'tiny_beaver', name: 'Castor Mini', rarity: 'common', bonusType: 'dps', bonusValue: 0.05 },
  { id: 'forest_fairy', name: 'Fée Sylve', rarity: 'rare', bonusType: 'reward', bonusValue: 0.1 },
  { id: 'stone_owl', name: 'Hibou de Pierre', rarity: 'rare', bonusType: 'click', bonusValue: 0.08 },
  { id: 'ember_fox', name: 'Renard Braise', rarity: 'epic', bonusType: 'dps', bonusValue: 0.15 },
  { id: 'ancient_stag', name: 'Cerf Ancien', rarity: 'epic', bonusType: 'reward', bonusValue: 0.18 },
  { id: 'golden_drake', name: 'Drake Doré', rarity: 'legendary', bonusType: 'reward', bonusValue: 0.35 }
];

const rarityWeights = petRarities.reduce((sum, rarity) => sum + rarity.weight, 0);

function rollRarity() {
  let roll = Math.random() * rarityWeights;
  for (const rarity of petRarities) {
    roll -= rarity.weight;
    if (roll <= 0) {
      return rarity.key;
    }
  }
  return petRarities[0].key;
}

export function rollPet() {
  const rarity = rollRarity();
  const availablePets = pets.filter(pet => pet.rarity === rarity);
  const pick = availablePets[Math.floor(Math.random() * availablePets.length)];
  return {
    ...pick,
    instanceId: `${pick.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  };
}
