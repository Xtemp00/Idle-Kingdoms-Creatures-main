import { updatePlayerStats } from "../player.js";

export function initWoodManagement(playerData, resourcesData, buildingsData) {
  resourcesData.forEach(resource => {
      setupResourceButton(resource, playerData, buildingsData);
  });

  // Démarre la vérification périodique
  periodicCheck(playerData, resourcesData,buildingsData);
}

function setupResourceButton(resource, playerData, buildingsData) {
  const resourceName = resource.name.toLowerCase();
  const resourceButton = document.getElementById(`${resourceName}-button`);
  const unlockButton = document.getElementById(`${resourceName}-unlock-button`);
  const upgradeButtonLumberJack = document.getElementById(`Lumberjack-${resourceName}-upgrade-button`);
  const upgradeButtonSawmill = document.getElementById(`Sawmill-${resourceName}-upgrade-button`);
  const upgradeButtonFactory = document.getElementById(`Factory-${resourceName}-upgrade-button`);
  const upgradeButtonWarehouse = document.getElementById(`Warehouse-${resourceName}-upgrade-button`);
  const upgradeButtonMarket = document.getElementById(`Market-${resourceName}-upgrade-button`);




  if (resourceButton) {
    resourceButton.addEventListener('click', () => handleResourceClick(resource, playerData, buildingsData));
  } else {
    console.error(`Button for ${resourceName} not found.`);
  }

  // Ajout d'un écouteur d'événements pour le bouton d'amélioration
  if (upgradeButtonLumberJack) {
    upgradeButtonLumberJack.addEventListener('click', () => UpgradeLumberjack(playerData, buildingsData, resource));
  } else {
      console.error(`Upgrade button for ${resourceName} not found.`);
  }

  if (upgradeButtonSawmill) {
    upgradeButtonSawmill.addEventListener('click', () => UpgradeSawmill(playerData, buildingsData, resource));
  } else {
      console.error(`Upgrade button for ${resourceName} not found.`);
  }

  if (upgradeButtonFactory) {
    upgradeButtonFactory.addEventListener('click', () => UpgradeFactory(playerData, buildingsData, resource));
  } else {
      console.error(`Upgrade button for ${resourceName} not found.`);
  }

  if (upgradeButtonWarehouse) {
    upgradeButtonWarehouse.addEventListener('click', () => UpgradeWarehouse(playerData, buildingsData, resource));
  } else {
      console.error(`Upgrade button for ${resourceName} not found.`);
  }

  if (upgradeButtonMarket) {
    upgradeButtonMarket.addEventListener('click', () => UpgradeMarket(playerData, buildingsData, resource));
  } else {
      console.error(`Upgrade button for ${resourceName} not found.`);
  }


}

function handleResourceClick(resource, playerData, buildingsData) {
  const currentTime = Date.now();
  const lastHarvestTime = playerData.lastHarvestTime[resource.name] || 0;
  const elapsedTime = (currentTime - lastHarvestTime) / 1000;

  if (elapsedTime >= resource.harvestTime) {
      incrementResource(resource, playerData, buildingsData);
      updateResourceDisplay(resource.name, playerData);
      startTimer(resource, playerData, buildingsData);
  } else {
      const waitTime = resource.harvestTime - elapsedTime;
      console.log(`Attendez ${waitTime.toFixed(1)} secondes avant de récolter à nouveau.`);
  }
}

function periodicCheck(playerData, resourcesData,buildingsData) {
  setInterval(() => {
      resourcesData.forEach(resource => {
          if (shouldUnlockResource(playerData, resource)) {
              unlockNextResource(playerData, resource);
          }
          //si le joueur possede le lumberjack niveau dans le type de ressource alors le timer pour miner la ressource est declenché a chaque fois que le harvestTime est atteint
          //playerData.woodUpgradeData.res
          let resources = resource.name;
          if ( playerData.woodUpgrade[resource.name]["LumberJack"] > 0){
            const currentTime = Date.now();
            const lastHarvestTime = playerData.lastHarvestTime[resource.name] || 0;
            const elapsedTime = (currentTime - lastHarvestTime) / 1000;
          
            if ((elapsedTime >= resource.harvestTime) && (playerData.IsUnlockresources[resource.name] == true)) {
              updateMultipliers(playerData, buildingsData);
              incrementResource(resource, playerData, buildingsData);
              updateResourceDisplay(resource.name, playerData);
              incrementWoodcuttingLevel(playerData);
              updateWoodcuttingXpBar(playerData);
              updatePlayerStats(playerData);
              startTimer(resource, playerData, buildingsData);
            }
          }
      });
      updateMultipliers(playerData, buildingsData);
      incrementWoodcuttingLevel(playerData);
      updateWoodcuttingXpBar(playerData);
      updatePlayerStats(playerData);
  }, 50);
}

function shouldUnlockResource(playerData, resource) {
  const currentResourceCount = playerData.inventory[resource.name] || 0;
  return currentResourceCount >= 100 && resource.next;
}

function unlockNextResource(playerData, resource) {
  let nextResourceName = resource.next.toLowerCase();
  const resourceButton = document.getElementById(`${nextResourceName}-button`);
  const unlockButton = document.getElementById(`${nextResourceName}-unlock-button`);
  //on met la premeir lettre en majuscule pour que le nom de la ressource soit reconnu
  nextResourceName = nextResourceName.charAt(0).toUpperCase() + nextResourceName.slice(1);


  playerData.IsUnlockresources[nextResourceName] = true;


  if (resourceButton && unlockButton) {
      unlockButton.style.display = 'none';
      //faire apparaitre le bouton de récolte
      resourceButton.style.display = 'inline-block';
  }
}

function incrementResource(resource, playerData) {
  const resourceName = resource.name;
  playerData.inventory[resourceName] = (playerData.inventory[resourceName] || 0) + playerData.skills.woodcutting;
  
  let xpGain = resource.hardness * 0.1 * playerData.skills.woodcutting;


  let goldGain = resource.value * playerData.skills.woodcutting   +  (playerData.woodUpgrade[resource.name].LumberJack * playerData.Multipliers["WoodGold"]);
  playerData.SkillsXp["woodcuttingXp"] = (playerData.SkillsXp["woodcuttingXp"] || 0) + xpGain;
  playerData.stats["gold"] = (playerData.stats["gold"] || 0) + goldGain;
  playerData.inventory["Wood"] = (playerData.inventory["Wood"] || 0) + playerData.skills.woodcutting;


}

function incrementWoodcuttingLevel(playerData) {
  let currentLevel = playerData.skills.woodcutting;
  let currentXp = playerData.SkillsXp["woodcuttingXp"];
  let xpForNextLevel = 100 * Math.pow(2, currentLevel - 1); // XP requise pour le niveau actuel

  if (currentXp >= xpForNextLevel) {
      playerData.skills.woodcutting += 1; // Augmente le niveau
      // Ne pas réinitialiser l'XP, le surplus d'XP reste pour le prochain niveau
      console.log(`Le joueur a atteint le niveau ${playerData.skills.woodcutting} en woodcutting`);
  }

  // Pas besoin de soustraire l'XP ici, car nous gardons le total cumulé
}

function updateWoodcuttingXpBar(playerData) {
  const woodcuttingXp = playerData.SkillsXp["woodcuttingXp"];
  const progressElement = document.getElementById('wood-xp-progress');
  
  if (progressElement) {
      const currentLevel = playerData.skills.woodcutting;
      const xpForCurrentLevel = 100 * Math.pow(2, currentLevel - 2); // XP total pour atteindre le niveau actuel
      const xpForNextLevel = 100 * Math.pow(2, currentLevel - 1); // XP total pour atteindre le prochain niveau
      const xpNeeded = xpForNextLevel - woodcuttingXp;
      const progressPercent = ((woodcuttingXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
      
      progressElement.style.width = `${progressPercent.toFixed(2)}%`;
      progressElement.textContent = `XP: ${(woodcuttingXp - xpForCurrentLevel).toFixed(2)} / ${(xpForNextLevel - xpForCurrentLevel).toFixed(2)} (${xpNeeded.toFixed(2)} restant)`;
  } else {
      console.error('Element woodcutting-xp-progress non trouvé');
  }
}

function updateResourceDisplay(resourceName, playerData) {
  const resourceAmount = playerData.inventory[resourceName] || 0;
  const displayElement = document.getElementById(`${resourceName.toLowerCase()}-amount`);
  if (displayElement) {
      displayElement.textContent = resourceAmount;
  }
}

function startTimer(resource, playerData, buildingsData) {
  playerData.lastHarvestTime[resource.name] = Date.now();
  let timerInterval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = (currentTime - playerData.lastHarvestTime[resource.name]) / 1000; // Toujours en secondes
      const remainingTime = Math.max((resource.harvestTime / playerData.Multipliers["WoodSpeed"])- elapsedTime, 0);

      if (remainingTime <= 0) {
          clearInterval(timerInterval);
      } else {
          const progressPercent = (1 - remainingTime / resource.harvestTime) * 100;
          const progressElement = document.getElementById(`${resource.name.toLowerCase()}-timer-progress`);
          if (progressElement) {
              progressElement.style.width = progressPercent + '%';
          }
          
      }
  }, 50); // Mise à jour toutes les 100 millisecondes
  updatePlayerStats(playerData);
}




// Place for the Upgrade Menu
//le but de ccette endroit est de gerer l'amelioration des ressources
function UpgradeLumberjack(playerData, buildingsData, resource) {
  // Récupérer le niveau actuel d'amélioration pour le bûcheron du type de bois spécifié
  let currentLevel = playerData.woodUpgrade[resource.name].LumberJack || 0;
  const resourceName = resource.name;
  // Calculer le coût de l'amélioration
  //buildingsData.find is not a function
  let cost = buildingsData.buildings.find(building => building.name === "LumberJack").GoldCost * Math.pow(2, currentLevel) * (currentLevel + 1);
  let woodcost = buildingsData.buildings.find(building => building.name === "LumberJack").WoodCost * Math.pow(2, currentLevel) * (currentLevel + 1);  

  // Vérifier si le joueur a assez d'or pour l'amélioration
  if (playerData.stats["gold"] >= cost && playerData.inventory[resourceName] >= woodcost) {
      // Déduire le coût et augmenter le niveau d'amélioration
      playerData.stats["gold"] -= cost;
      playerData.woodUpgrade[resource.name].LumberJack = currentLevel + 1;
      //afficher sur le fichier html les nouveaux prix et le niveau
      let resourceNameLower = resource.name.toLowerCase();

      let resourcelvlId = `Lumberjack-${resourceNameLower}-level`;
      let resourcewoodcostId = `Lumberjack-${resourceNameLower}-woodcost`;
      let resourcecostId = `Lumberjack-${resourceNameLower}-cost`;
  
      let resourcelvl = document.getElementById(resourcelvlId);
      let resourcecost = document.getElementById(resourcecostId);
      let resourcewoodcost = document.getElementById(resourcewoodcostId);
  
      if (resourcelvl && resourcecost) {
          resourcelvl.textContent = `Niveau: ${currentLevel + 1}`;
          resourcecost.textContent = `Coût en PO: ${cost}`;
          resourcewoodcost.textContent = `Coût en bois: ${woodcost}`;


      } else {
          console.error("Élément HTML non trouvé pour", resourcelvlId, "ou", resourcecostId);
      }

    } else {
      // Gérer le cas où le joueur n'a pas assez d'or (afficher un message, etc.)
      console.log(`Il manque ${cost-playerData.stats["gold"]} ou ${woodcost-resourceName} d or pour cette amélioration !`);
  }


  // Mettre à jour les statistiques du joueur (cette fonction doit être définie ailleurs dans votre code)
  updatePlayerStats(playerData);
}

function UpgradeSawmill(playerData, buildingsData, resource) {
  // Récupérer le niveau actuel d'amélioration pour le bûcheron du type de bois spécifié
  let currentLevel = playerData.woodUpgrade[resource.name].Sawmill || 0;
  const resourceName = resource.name;

  // Calculer le coût de l'amélioration
  //buildingsData.find is not a function
  let cost = buildingsData.buildings.find(building => building.name === "SawMill").GoldCost * Math.pow(2, currentLevel) * (currentLevel + 1);
  let woodcost = buildingsData.buildings.find(building => building.name === "SawMill").WoodCost * Math.pow(2, currentLevel) * (currentLevel + 1);
  // Vérifier si le joueur a assez d'or pour l'amélioration


  if (playerData.stats["gold"] >= cost && playerData.inventory[resourceName] >= woodcost) {
      // Déduire le coût et augmenter le niveau d'amélioration
      playerData.stats["gold"] -= cost;
      playerData.woodUpgrade[resource.name].Sawmill = currentLevel + 1;
      //afficher sur le fichier html les nouveaux prix et le niveau
      let resourceNameLower = resource.name.toLowerCase();

      let resourcelvlId = `Sawmill-${resourceNameLower}-level`;
      let resourcewoodcostId = `Sawmill-${resourceNameLower}-woodcost`;
      let resourcecostId = `Sawmill-${resourceNameLower}-cost`;
  
      let resourcelvl = document.getElementById(resourcelvlId);
      let resourcecost = document.getElementById(resourcecostId);
      let resourcewoodcost = document.getElementById(resourcewoodcostId);
  
      if (resourcelvl && resourcecost) {
          resourcelvl.textContent = `Niveau: ${currentLevel + 1}`;
          resourcecost.textContent = `Coût: ${cost}`;
          resourcewoodcost.textContent = `Coût en bois: ${woodcost}`;

      } else {
          console.error("Élément HTML non trouvé pour", resourcelvlId, "ou", resourcecostId);
      }

      } else {
      // Gérer le cas où le joueur n'a pas assez d'or (afficher un message, etc.)
      console.log(`Il manque ${cost-playerData.stats["gold"]} ou ${woodcost-resourceName} d or pour cette amélioration !`);
  }

  // Mettre à jour les statistiques du joueur (cette fonction doit être définie ailleurs dans votre code)
  updatePlayerStats(playerData);
}

function UpgradeFactory(playerData, buildingsData, resource) {
  // Récupérer le niveau actuel d'amélioration pour le bûcheron du type de bois spécifié
  let currentLevel = playerData.woodUpgrade[resource.name].Factory || 0;
  const resourceName = resource.name;

  // Calculer le coût de l'amélioration
  //buildingsData.find is not a function
  let cost = buildingsData.buildings.find(building => building.name === "Factory").GoldCost * Math.pow(2, currentLevel) * (currentLevel + 1);
  let woodcost = buildingsData.buildings.find(building => building.name === "Factory").WoodCost * Math.pow(2, currentLevel) * (currentLevel + 1);  

  // Vérifier si le joueur a assez d'or pour l'amélioration
  if (playerData.stats["gold"] >= cost && playerData.inventory[resourceName] >= woodcost) {
      // Déduire le coût et augmenter le niveau d'amélioration
      playerData.stats["gold"] -= cost;
      playerData.woodUpgrade[resource.name].Factory = currentLevel + 1;
      //afficher sur le fichier html les nouveaux prix et le niveau
      let resourceNameLower = resource.name.toLowerCase();

      let resourcelvlId = `Factory-${resourceNameLower}-level`;
      let resourcewoodcostId = `Factory-${resourceNameLower}-woodcost`;
      let resourcecostId = `Factory-${resourceNameLower}-cost`;
  
      let resourcelvl = document.getElementById(resourcelvlId);
      let resourcecost = document.getElementById(resourcecostId);
      let resourcewoodcost = document.getElementById(resourcewoodcostId);
  
      if (resourcelvl && resourcecost) {
          resourcelvl.textContent = `Niveau: ${currentLevel + 1}`;
          resourcecost.textContent = `Coût: ${cost}`;
          resourcewoodcost.textContent = `Coût en bois: ${woodcost}`;
      } else {
          console.error("Élément HTML non trouvé pour", resourcelvlId, "ou", resourcecostId);
      }

      } else {
      // Gérer le cas où le joueur n'a pas assez d'or (afficher un message, etc.)
      console.log(`Il manque ${cost-playerData.stats["gold"]} ou ${woodcost-resourceName} d or pour cette amélioration !`);
  }

  // Mettre à jour les statistiques du joueur (cette fonction doit être définie ailleurs dans votre code)
  updatePlayerStats(playerData);
}

function UpgradeWarehouse(playerData, buildingsData, resource) {
  // Récupérer le niveau actuel d'amélioration pour le bûcheron du type de bois spécifié
  let currentLevel = playerData.woodUpgrade[resource.name].Warehouse || 0;
  const resourceName = resource.name;

  // Calculer le coût de l'amélioration
  //buildingsData.find is not a function
  let cost = buildingsData.buildings.find(building => building.name === "Warehouse").GoldCost * Math.pow(2, currentLevel) * (currentLevel + 1);
  let woodcost = buildingsData.buildings.find(building => building.name === "Warehouse").WoodCost * Math.pow(2, currentLevel) * (currentLevel + 1);  

  // Vérifier si le joueur a assez d'or pour l'amélioration
  if (playerData.stats["gold"] >= cost && playerData.inventory[resourceName] >= woodcost) {
      // Déduire le coût et augmenter le niveau d'amélioration
      playerData.stats["gold"] -= cost;
      playerData.woodUpgrade[resource.name].Warehouse = currentLevel + 1;
      //afficher sur le fichier html les nouveaux prix et le niveau
      let resourceNameLower = resource.name.toLowerCase();

      let resourcelvlId = `Warehouse-${resourceNameLower}-level`;
      let resourcewoodcostId = `Warehouse-${resourceNameLower}-woodcost`;
      let resourcecostId = `Warehouse-${resourceNameLower}-cost`;
  
      let resourcelvl = document.getElementById(resourcelvlId);
      let resourcecost = document.getElementById(resourcecostId);
      let resourcewoodcost = document.getElementById(resourcewoodcostId);
  
      if (resourcelvl && resourcecost) {
          resourcelvl.textContent = `Niveau: ${currentLevel + 1}`;
          resourcecost.textContent = `Coût: ${cost}`;
          resourcewoodcost.textContent = `Coût en bois: ${woodcost}`;
      } else {
          console.error("Élément HTML non trouvé pour", resourcelvlId, "ou", resourcecostId);
      }

      } else {
      // Gérer le cas où le joueur n'a pas assez d'or (afficher un message, etc.)
      console.log(`Il manque ${cost-playerData.stats["gold"]} ou ${woodcost-resourceName} d or pour cette amélioration !`);
  }

  // Mettre à jour les statistiques du joueur (cette fonction doit être définie ailleurs dans votre code)
  updatePlayerStats(playerData);
}

function UpgradeMarket(playerData, buildingsData, resource) {
  // Récupérer le niveau actuel d'amélioration pour le bûcheron du type de bois spécifié
  let currentLevel = playerData.woodUpgrade[resource.name].Market || 0;
  const resourceName = resource.name;

  // Calculer le coût de l'amélioration
  //buildingsData.find is not a function
  let cost = buildingsData.buildings.find(building => building.name === "Market").GoldCost * Math.pow(2, currentLevel) * (currentLevel + 1);
  let woodcost = buildingsData.buildings.find(building => building.name === "Market").WoodCost * Math.pow(2, currentLevel) * (currentLevel + 1);  

  // Vérifier si le joueur a assez d'or pour l'amélioration
  if (playerData.stats["gold"] >= cost && playerData.inventory[resourceName] >= woodcost) {
      // Déduire le coût et augmenter le niveau d'amélioration
      playerData.stats["gold"] -= cost;
      playerData.woodUpgrade[resource.name].Market = currentLevel + 1;
      //afficher sur le fichier html les nouveaux prix et le niveau
      let resourceNameLower = resource.name.toLowerCase();

      let resourcelvlId = `Market-${resourceNameLower}-level`;
      let resourcewoodcostId = `Market-${resourceNameLower}-woodcost`;
      let resourcecostId = `Market-${resourceNameLower}-cost`;
  
      let resourcelvl = document.getElementById(resourcelvlId);
      let resourcecost = document.getElementById(resourcecostId);
      let resourcewoodcost = document.getElementById(resourcewoodcostId);
  
      if (resourcelvl && resourcecost) {
          resourcelvl.textContent = `Niveau: ${currentLevel + 1}`;
          resourcecost.textContent = `Coût: ${cost}`;
          resourcewoodcost.textContent = `Coût en bois: ${woodcost}`;
      } else {
          console.error("Élément HTML non trouvé pour", resourcelvlId, "ou", resourcecostId);
      }

      } else {
      // Gérer le cas où le joueur n'a pas assez d'or (afficher un message, etc.)
      console.log(`Il manque ${cost-playerData.stats["gold"]} ou ${woodcost-resourceName} d or pour cette amélioration !`);
  }


  // Mettre à jour les statistiques du joueur (cette fonction doit être définie ailleurs dans votre code)
  updatePlayerStats(playerData);
}

//Fonction qui a chaque instant met a jour les multipliers du joueur en fonction de tout ces achat d'amélioration
function updateMultipliers(playerData, buildingsData){
  let woodSpeed = 1;
  let woodGold = 1;


  for (let resource in playerData.woodUpgrade){

    woodSpeed += (playerData.woodUpgrade[resource].LumberJack * buildingsData.buildings.find(building => building.name === "LumberJack").Speed) + (playerData.woodUpgrade[resource].SawMill * buildingsData.buildings.find(building => building.name === "SawMill").Speed) + (playerData.woodUpgrade[resource].Factory * buildingsData.buildings.find(building => building.name === "Factory").Speed) + (playerData.woodUpgrade[resource].Warehouse * buildingsData.buildings.find(building => building.name === "Warehouse").Speed) + (playerData.woodUpgrade[resource].Market * buildingsData.buildings.find(building => building.name === "Market").Speed);
    woodGold += (playerData.woodUpgrade[resource].LumberJack * buildingsData.buildings.find(building => building.name === "LumberJack").Gold) + (playerData.woodUpgrade[resource].SawMill * buildingsData.buildings.find(building => building.name === "SawMill").Gold) + (playerData.woodUpgrade[resource].Factory * buildingsData.buildings.find(building => building.name === "Factory").Gold) + (playerData.woodUpgrade[resource].Warehouse * buildingsData.buildings.find(building => building.name === "Warehouse").Gold) + (playerData.woodUpgrade[resource].Market * buildingsData.buildings.find(building => building.name === "Market").Gold);

  }

  playerData.Multipliers["WoodSpeed"] = woodSpeed;
  playerData.Multipliers["WoodGold"] = woodGold;

}