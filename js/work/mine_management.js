//mine-management.js
import { updatePlayerStats } from "../player.js";
/*Gameplan
* 1. Load the mine data
* 2. Differentiate between the different types of mines
* 3. It's different from the wood management 
* 4. The player can upgrade the mine
* 5. It's a grid 10*10 player can mine 1 square at a time and discover the resources
* 6. The player can upgrade the mine to get more resources
* 7. The upgrade can a the beginning mine random and a the end the upgrade can mine 2*2 or 3*3 etc
* 8. resources are automatically added to the player's inventory and sell for gold
* 9. all the resources are :
        "copperOre": 0,
        "ironOre": 0,
        "silverOre": 0,
        "goldOre": 0,
        "mithrilOre": 0,
        "diamondOre": 0,
        "emeraldOre": 0,
        "puregoldOre": 0,
        "puremithrilOre": 0,
        "pureemeraldOre": 0,
        "purediamondOre": 0,
        "DivineOre": 0
* 10. Square can be empty or contain a resource
* 11. All resources is available in the mine and the player can mine it 
* 12. Every resources has different value and probability to be found
* 13. The mine is like stage 1, stage 2, stage 3 etc and more the stage is high more the resources are valuable
*/

// mine-management.js

export function initMineManagement(playerData, resourcesData, buildingsData) {
    console.log('Initialisation de la gestion de la mine');
    // Charger et initialiser les données de la mine
    const mineData = loadMineData();

    // Créer et afficher la grille de mine
    createMineGrid(playerData, resourcesData, buildingsData);
    MineUpgradeTick(playerData, resourcesData, buildingsData);
    displayProbability(resourcesData);



    // Mettre à jour les statistiques du joueur
    updatePlayerStats(playerData);
}

function createMineGrid(playerData, resourcesData, buildingsData) {
    const gridContainer = document.getElementById("mine-grid");
    gridContainer.innerHTML = ''; // Nettoyer la grille existante

    for (let i = 0; i < 10; i++) {
        const row = document.createElement("div");
        row.className = "mine-row";

        for (let j = 0; j < 10; j++) {
            const cell = document.createElement("button");
            cell.className = "mine-cell";
            //on rajoute un id pour que chaque cellule soit unique et est une probaliter de 50% d'avoir un bacjground et 50% d'avoir un autre background pour une question de visuel
            cell.id = `mine-cell-${i}-${j}`;
            if (Math.random() > 0.5) {
                /* on veut rajouter sa background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat; */
                cell.style.background = "url('../../assets/images/Ore/Cell2.jpg')";
                cell.style.backgroundSize = "cover";
                cell.style.backgroundPosition = "center";
                cell.style.backgroundRepeat = "no-repeat";
                } else {
                    cell.style.background = "url('../../assets/images/Ore/Cell2.jpg')";
                    cell.style.backgroundSize = "cover";
                    cell.style.backgroundPosition = "center";
                    cell.style.backgroundRepeat = "no-repeat";
            }
            if (playerData.MiningUpgrade.Drill > 0) {
                cell.onclick = function() { DrillUpgrades(i, j, playerData, resourcesData, buildingsData); };
            } else {
                cell.onclick = function() { handleMineCellClick(i, j, playerData, resourcesData, buildingsData); };
            }
            row.appendChild(cell);
        }

        gridContainer.appendChild(row);
    }
}

function handleMineCellClick(x, y, playerData, resourcesData, buildingsData) {

    // Vérifiez si la cellule a déjà été minée
    if (cellIsAlreadyMined(x, y, playerData)) {
        return;
    }

    // Déterminer la ressource trouvée
    let foundResource = determineResourceFound(resourcesData);

    // Ajouter la ressource à l'inventaire du joueur si elle est trouvée
    if (foundResource) {
        playerData.inventory[foundResource.name] = (playerData.inventory[foundResource.name] || 0) + 1;
        playerData.stats["gold"] += foundResource.value; // Ajouter la valeur de la ressource à l'or du joueur
        playerData.inventory["Mine"] = (playerData.inventory["Mine"] || 0) + 1;
        // Mettre à jour l'interface utilisateur
        updateUIWithFoundResource(x, y, foundResource, playerData);
    } else {
        console.log("Pas de ressource trouvée dans cette cellule.");
    }

    // Marquer la cellule comme minée
    markCellAsMined(x, y, playerData);

    // Mettre à jour les statistiques du joueur
    updatePlayerStats(playerData);
    if (Gridcompleted(playerData)) {
        // Si oui, initialiser un nouveau niveau
        
        initNextLevel(playerData, resourcesData, buildingsData);
    }

}

function cellIsAlreadyMined(x, y, playerData) {
    // Vérifier si l'attribut minedCells existe dans playerData 
    if (x == null || y == null) {
        return false;
    }
    if (!playerData.minedCells) {
        // Si non, initialiser minedCells comme un tableau de 10x10 avec toutes les valeurs à false
        playerData.minedCells = Array(10).fill().map(() => Array(10).fill(false));
    }

    // Retourner l'état de la cellule (minée ou non)
    return playerData.minedCells[x][y];
}

function markCellAsMined(x, y, playerData) {
    // Marquer la cellule comme minée
    playerData.minedCells[x][y] = true;
    //ajouter une class html nommé mined pour marquer la cellule comme minée
    document.querySelector(`.mine-row:nth-child(${x + 1}) .mine-cell:nth-child(${y + 1})`).classList.add('mined');
}

function determineResourceFound(mineOreData) {
    let totalProbability = 0;
    mineOreData.forEach(ore => totalProbability += ore.probability);
    
    let random = Math.random() * totalProbability;
    let cumulativeProbability = 0;
    
    for (let ore of mineOreData) {
        cumulativeProbability += ore.probability;
        if (random <= cumulativeProbability) {
            return ore;
        }
    }
    
    return null; // Dans le cas où aucune ressource n'est trouvée
}

function updateUIWithFoundResource(x, y , resource, playerData) {
    // Afficher un message indiquant la ressource trouvée
    const messageArea = document.getElementById('mine-message-area');
    if (messageArea) {
        messageArea.textContent = `Vous avez trouvé ${resource.name}!`;
    }

    // Mettre à jour l'affichage de l'inventaire pour la ressource trouvée
    const resourceInventoryDisplay = document.getElementById(`${resource.name}-inventory`);
    if (resourceInventoryDisplay) {
        resourceInventoryDisplay.textContent = playerData.inventory[resource.name];
    }

    //on va chercher la case qui a été minée et on va lui rajouter un background pour indiquer que la case a été minée avec 
    if (Math.random() > 0.5) {
        const cell = document.getElementById(`mine-cell-${x}-${y}`);
        cell.style.background = "url('../../assets/images/Ore/BrokenCell3.jpg')";
        cell.style.backgroundSize = "cover";
        cell.style.backgroundPosition = "center";
        cell.style.backgroundRepeat = "no-repeat";
    } else {
        const cell = document.getElementById(`mine-cell-${x}-${y}`);
        cell.style.background = "url('../../assets/images/Ore/BrokenCell3.jpg')";
        cell.style.backgroundSize = "cover";
        cell.style.backgroundPosition = "center";
        cell.style.backgroundRepeat = "no-repeat";
    }
    // Ajouter toute animation ou effet visuel supplémentaire si nécessaire
    // Par exemple, faire clignoter la cellule de la grille de la mine où la ressource a été trouvée
    // ou afficher une animation de particules pour indiquer la découverte de la ressource

}

function Gridcompleted(playerData) {
    // Vérifier si toutes les cellules de la grille ont été minées
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            if (!cellIsAlreadyMined(i, j, playerData)) {
                return false;
            }
        }
    }

    return true;
}

function initNextLevel(playerData, resourcesData, buildingsData) {
    // Incrémenter le niveau de la mine dans playerData
    playerData.skills["mining"] = (playerData.skills["mining"] || 1) + 1;

    // Afficher un message pour le nouveau niveau
    console.log(`Bienvenue à l'étage ${playerData.skills["mining"]} de la mine!`);
    document.getElementById('stage').textContent = `Etage ${playerData.skills["mining"]}`;
    // Créer et afficher la nouvelle grille de mine
    createMineGrid(playerData, resourcesData, buildingsData);

    // Réinitialiser les cellules minées
    playerData.minedCells = Array(10).fill().map(() => Array(10).fill(false));

    if (playerData.MiningUpgrade.NuclearQuarry > 0) {
        NuclearQuarryUpgradesChoose(playerData);
    }
}

//achat d'amélioration de la mine
//TODO: Ajouter une fonctionnalité pour acheter des améliorations de la mine

//fonction qui est appelée toute les 1secondes pour effectuer les action des améliorations de la mine
function MineUpgradeTick(playerData, resourcesData, buildingsData) {
    // Ici, vous pouvez gérer les actions périodiques des améliorations de la mine
    // Par exemple, vérifier si le joueur a une amélioration qui automatise certaines actions de minage
    let x = 0;
    let y = 0;

    setInterval(() => {
        if (playerData.skills["mining"] <= 200) {
            UnlockUpgrade(playerData, resourcesData, buildingsData);
        }
        
        if (playerData.MiningUpgrade.Miner > 0) {
            // Supposons que automaticMiner est une amélioration qui mine automatiquement une case toutes les N secondes
            let currentTime = Date.now();
            let elapsedTime = (currentTime - playerData.lastHarvestTime["Miner"]) / 1000;

            //incrementer a chaque x et y pour parcourir toute la grille


            if (elapsedTime >= buildingsData.buildings.find(building => building.name === "Miner").cooldown) {
                MinerUpgrades(playerData, resourcesData, buildingsData);
                playerData.lastHarvestTime["Miner"] = currentTime;
            }
        }
        if (playerData.MiningUpgrade.Refinery > 0) {

            let currentTime = Date.now();
            let elapsedTime = (currentTime - playerData.lastHarvestTime["Refinery"]) / 1000;


            if (elapsedTime >= buildingsData.buildings.find(building => building.name === "Refinery").cooldown) {
                RefineryUpgrades(playerData, resourcesData, buildingsData);
                playerData.lastHarvestTime["Refinery"] = currentTime;
            }
        }
        if (playerData.MiningUpgrade.Quarry > 0) {

            let currentTime = Date.now();
            let elapsedTime = (currentTime - playerData.lastHarvestTime["Quarry"]) / 1000;


            if (elapsedTime >= buildingsData.buildings.find(building => building.name === "Quarry").cooldown) {
                QuarryUpgrades(x, y, playerData, resourcesData, buildingsData);
                playerData.lastHarvestTime["Quarry"] = currentTime;
            }
        }
        if (playerData.MiningUpgrade.ChemicalFactory > 0) {

            let currentTime = Date.now();
            let elapsedTime = (currentTime - playerData.lastHarvestTime["ChemicalFactory"]) / 1000;

            if (elapsedTime >= buildingsData.buildings.find(building => building.name === "ChemicalFactory").cooldown) {
                ChemicalfactoryUpgrades(playerData, resourcesData, buildingsData);
                playerData.lastHarvestTime["ChemicalFactory"] = currentTime;
            }
        }   
        if (playerData.MiningUpgrade.NuclearQuarry > 0) {
            //attendre 100ms
            setTimeout(() => {
            }, 100);
            NuclearQuarryUpgrades(playerData.nuclearQuarryTarget["x"], playerData.nuclearQuarryTarget["y"], playerData, resourcesData, buildingsData);

        }
        if (x < 9) {
            x++;
        } else if (x == 9 && y == 9) {
            x = 0;
            y = 0;
        } else {
            x = 0;
            y++;
        }
        
    }, 50);
}

function mineRandomCell(playerData, resourcesData, buildingsData) {
    // Choisir une cellule aléatoire non minée et la miner
    let x = Math.floor(Math.random() * 10);
    let y = Math.floor(Math.random() * 10);

    if (!cellIsAlreadyMined(x, y, playerData)) {
        handleMineCellClick(x, y, playerData, resourcesData, buildingsData);
    }
}


function MinerUpgrades(playerData, resourcesData, buildingsData) {
    //fonction qui permet de miner d'apres un cooldown donner par l'amélioration de 1 case au hasard
    //donner une case au hasard non minée et la miner
    mineRandomCell(playerData, resourcesData, buildingsData);

}

function RefineryUpgrades(playerData, resourcesData, buildingsData) {
    mineRandomCell(playerData, resourcesData, buildingsData);
    mineRandomCell(playerData, resourcesData, buildingsData);
}

function QuarryUpgrades(x, y, playerData, resourcesData, buildingsData) {
    //fonction qui permet de miner d'apres un cooldown donner par l'amélioration de 1 case au hasard
    if (!cellIsAlreadyMined(x, y, playerData)) {
        handleMineCellClick(x, y, playerData, resourcesData, buildingsData);
    }
}

function ChemicalfactoryUpgrades(playerData, resourcesData, buildingsData) {
    //TODO: mine tout l'etage tout les x secondes
    //parcourir toute la grille et miner toute les cases
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            if (!cellIsAlreadyMined(i, j, playerData)) {
                handleMineCellClick(i, j, playerData, resourcesData, buildingsData);
            }
        }
    }

}

function DrillUpgrades(x, y, playerData, resourcesData, buildingsData) {
    // Fonction qui améliore le click du joueur pour miner en 3x3
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            let newX = x + dx;
            let newY = y + dy;

            // Vérifier si la nouvelle cellule est dans les limites du terrain
            if (!isValidCell(newX, newY, playerData)) {
                continue;
            }

            // Vérifier si la cellule a déjà été minée
            if (cellIsAlreadyMined(newX, newY, playerData)) {
                continue;
            }

            // Déterminer la ressource trouvée
            let foundResource = determineResourceFound(resourcesData);

            // Ajouter la ressource à l'inventaire du joueur si elle est trouvée
            if (foundResource) {
                playerData.inventory[foundResource.name] = (playerData.inventory[foundResource.name] || 0) + 1;
                playerData.stats["gold"] += foundResource.value; // Ajouter la valeur de la ressource à l'or du joueur
                playerData.inventory["Mine"] = (playerData.inventory["Mine"] || 0) + 1;
                // Mettre à jour l'interface utilisateur
                updateUIWithFoundResource(newX, newY, foundResource, playerData);
            } else {
                console.log("Pas de ressource trouvée dans cette cellule.");
            }

            // Marquer la cellule comme minée
            markCellAsMined(newX, newY, playerData);
        }
    }

    // Mettre à jour les statistiques du joueur
    updatePlayerStats(playerData);
    if (Gridcompleted(playerData)) {
        // Si oui, initialiser un nouveau niveau
        initNextLevel(playerData, resourcesData, buildingsData);
    }
}

function isValidCell(x, y, playerData) {
    // Cette fonction vérifie si les coordonnées (x, y) sont dans les limites du terrain
    // Implémentez la logique selon la structure de votre terrain et données du joueur
    return x >= 0 && x < 10 && y >= 0 && y < 10;
}



function NuclearQuarryUpgradesChoose(playerData) {
    let attempts = 0;
    let x, y;

    do {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
        attempts++;
    } while (cellIsAlreadyMined(x, y, playerData) && attempts < 100);

    if (attempts >= 100) {
        console.log("Toutes les cellules sont minées. Sélection d'une nouvelle cible au prochain étage.");
        return;
    }

    // Marquer visuellement la case cible de NuclearQuarry
    const cell = document.getElementById(`mine-cell-${x}-${y}`);
    cell.style.background = "url('../../assets/images/Ore/QuarryLadder.jpg')";
    cell.style.backgroundSize = "cover";
    cell.style.backgroundPosition = "center";
    cell.style.backgroundRepeat = "no-repeat";

    playerData.nuclearQuarryTarget = { x, y };
}


function NuclearQuarryUpgrades(x, y, playerData, resourcesData, buildingsData) {
    // Utiliser la cible stockée dans playerData pour NuclearQuarry
    if (cellIsAlreadyMined(x, y, playerData)) {
        // Miner tout l'étage si la cible est minée
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (!cellIsAlreadyMined(i, j, playerData)) {
                    handleMineCellClick(i, j, playerData, resourcesData, buildingsData);
                }
            }
        }

    }
}

function UnlockUpgrade(playerData, resourcesData, buildingsData) {
    //fonction qui permet de débloquer les améliorations de la mine
    //on va unlock les ameliorations de la mine en fonction des etages decrit dans le fichier minebuild.json
    //on va chercher le niveau de la mine dans playerData
    let level = playerData.skills["mining"];
    //on va chercher les améliorations de la mine dans buildingsData
    let Miner = buildingsData.buildings.find(building => building.name === "Miner");
    let Refinery = buildingsData.buildings.find(building => building.name === "Refinery");
    let Quarry = buildingsData.buildings.find(building => building.name === "Quarry");
    let ChemicalFactory = buildingsData.buildings.find(building => building.name === "ChemicalFactory");
    let NuclearQuarry = buildingsData.buildings.find(building => building.name === "NuclearQuarry");
    let Drill = buildingsData.buildings.find(building => building.name === "Drill");

    //on va comparer le niveau de la mine avec le niveau de déblocage des améliorations
    if (level >= Miner.unlockstage) {
        playerData.MiningUpgrade.Miner = 1;
        document.getElementById('Miner-lock').style.display = 'none';
        document.getElementById('Miner-unlock').style.display = 'block';
    }

    if (level >= Refinery.unlockstage) {
        playerData.MiningUpgrade.Refinery = 1;
        document.getElementById('Refinery-lock').style.display = 'none';
        document.getElementById('Refinery-unlock').style.display = 'block';
    }

    if (level >= Quarry.unlockstage) {
        playerData.MiningUpgrade.Quarry = 1;
        document.getElementById('Quarry-lock').style.display = 'none';
        document.getElementById('Quarry-unlock').style.display = 'block';
    }

    if (level >= ChemicalFactory.unlockstage) {
        playerData.MiningUpgrade.ChemicalFactory = 1;
        document.getElementById('ChemicalFactory-lock').style.display = 'none';
        document.getElementById('ChemicalFactory-unlock').style.display = 'block';
    }

    if (level >= Drill.unlockstage) {
        playerData.MiningUpgrade.Drill = 1;
        document.getElementById('Drill-lock').style.display = 'none';
        document.getElementById('Drill-unlock').style.display = 'block';
    }

    if (level >= NuclearQuarry.unlockstage) {
        playerData.MiningUpgrade.NuclearQuarry = 1;
        document.getElementById('NuclearQuarry-lock').style.display = 'none';
        document.getElementById('NuclearQuarry-unlock').style.display = 'block';
    }

}

//fonction qui affiche la probabilité pour chaque resources
function displayProbability(resourcesData) {
    for (let i = 0; i < resourcesData.length; i++) {
        let resource = resourcesData[i];
        console.log(resource.name);

        let element = document.getElementById(resource.name);
        if (element) {
            element.textContent = "Probabilité d'apparition : " + (resource.probability * 100).toFixed(2) + "%";
        } else {
            console.error("Element not found for ID: ItemOre-" + resource.name);
        } 
    }
}



function loadMineData() {
    // Charger les données de la mine depuis le serveur

}