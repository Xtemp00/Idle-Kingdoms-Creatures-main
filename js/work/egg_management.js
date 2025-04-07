import { updatePlayerStats } from "../player.js";

export function initEggManagement(playerData, PetsData) {
    //on crée le menu de base
    displayNormalEggSection(playerData, PetsData);
    DisplayMenu(playerData, PetsData);
    /*displayNormalEggSection(playerData, PetsData);
    displayPetInventory(playerData);*/
}

//fonction pour afficher la section normal egg de l'oeuf
function displayNormalEggSection(playerData, PetsData) {

    let eggsection = document.getElementById("egg-section");
    eggsection.style.display = "grid";
    // Configuration for normal-egg-section
    let normalEggSection = document.getElementById("normal-egg-section");
    normalEggSection.style.margin = "10px";
    normalEggSection.style.padding = "10px";
    normalEggSection.style.backgroundColor = "#f8f0e3";
    normalEggSection.style.border = "1px solid #c0a080";
    normalEggSection.style.borderRadius = "10px";
    normalEggSection.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.5)";
    normalEggSection.style.textAlign = "center";
    normalEggSection.style.color = "#000";
    normalEggSection.style.width = "700px";
    normalEggSection.style.position = "absolute"; // Changed to absolute
    normalEggSection.style.left = "10px"; // Position to the left
    normalEggSection.style.top = "620px"; // Position below the egg button
    normalEggSection.style.display = "grid";
    normalEggSection.style.gridTemplateColumns = "repeat(3, 1fr)";


    //le normal-egg-button est placer en plein milieu en gros et a pour background l'image de l'oeuf
    let eggButton = document.getElementById("normal-egg-button");
    eggButton.style.backgroundImage = "url('../../assets/images/Egg/NormalEgg.jpg')";
    eggButton.style.backgroundSize = "cover";
    eggButton.style.backgroundPosition = "center";
    eggButton.style.backgroundRepeat = "no-repeat";
    eggButton.style.width = "500px";
    eggButton.style.height = "500px";
    eggButton.style.border = "none";
    eggButton.style.cursor = "pointer";
    eggButton.style.margin = "auto";    
    eggButton.style.display = "block";
    eggButton.style.marginTop = "10px";
    eggButton.style.marginBottom = "10px";
    eggButton.style.position = "relative"; // Ensure this is positioned relatively
    eggButton.style.zIndex = "2"; // Higher z-index to ensure it's above the section


    eggButton.addEventListener("click", function() {
        openNormalEgg(playerData,PetsData);
    });

    for (let i = 0; i < PetsData.NormalEgg.length; i++) {
            let pet = PetsData.NormalEgg[i];
            let petDiv = document.createElement("div");
            petDiv.className = "pet-div";
            petDiv.style.margin = "10px";
            petDiv.style.padding = "10px";
            petDiv.style.backgroundColor = "#f8f0e3";
            petDiv.style.border = "1px solid #c0a080";
            petDiv.style.borderRadius = "10px";
            petDiv.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.5)";
            petDiv.style.textAlign = "center";
            petDiv.style.color = "#000";
            petDiv.style.width = "80%";
            petDiv.style.height = "80%";
            //padding pour centrer le texte
            petDiv.style.display = "flex";
            petDiv.style.flexDirection = "column";
            petDiv.style.justifyContent = "center";
            petDiv.style.alignItems = "center";
            
        
            // il faut que le background de la div soit l'image
            petDiv.style.backgroundImage = "url('../../assets/images/pets/" + pet.name + ".jpg')";
            petDiv.style.backgroundSize = "cover";
            petDiv.style.backgroundPosition = "center";
            petDiv.style.backgroundRepeat = "no-repeat";
        
            let petName = document.createElement("p");
            petName.textContent = pet.name;
            petName.style.fontSize = "2em";
            petName.style.fontWeight = "bold";

            petDiv.appendChild(petName);

            let petProbability = document.createElement("p");
            petProbability.textContent = pet.probability * 100 + "%";
            // on met en gras et de maniere plus lisible
            petProbability.style.fontSize = "4em";
            petProbability.style.fontWeight = "bold";
            //on arrondit le pourcentage a 3 chiffres apres la virgule
            petProbability.textContent = (Math.round(pet.probability * 1000) / 10) + "%";
            

            petDiv.appendChild(petProbability);
            // Ajouter d'autres détails comme rarity, skills, etc.
        
            normalEggSection.appendChild(petDiv);
    }

    //si on appuie sur le bouton retour on revient au menu de base
    //le bouton est deja crée et s'appelle Return-Button
    let returnButton = document.getElementById("Return-Button-button");
    //on met un peu de style pour le bouton
    returnButton.style.padding = "10px";
    returnButton.style.border = "none";
    returnButton.style.borderRadius = "5px";
    returnButton.style.backgroundColor = "#c0a080";
    returnButton.style.color = "#fff";
    returnButton.style.cursor = "pointer";
    returnButton.style.fontSize = "1.5em";
    returnButton.style.position = "relative";
    returnButton.style.bottom = "10px";
    returnButton.style.width = "100%";
    returnButton.style.zIndex = "1"; // Lower z-index to ensure it's below the egg button
 
    returnButton.addEventListener("click", function() {
        //TODO :
        let eggmenu = document.getElementById("egg-menu");
        DisplayMenu(playerData, PetsData);
        eggmenu.style.display = "block";
        eggsection.style.display = "nobe";
    });
}       

//fonction pour ouvrir l'oeuf normalfunction openNormalEgg(playerData, PetsData) {
function openNormalEgg(playerData, PetsData) {
        let totalProbability = 0;
        // Convert probability strings to numbers and sum up
        PetsData.NormalEgg.forEach(pet => totalProbability += parseFloat(pet.probability));

        //le prix de l'oeuf est de 10000
        if (playerData.stats["gold"] < 10000) {
            console.log("You don't have enough coins to buy this egg!");
            return;
        } else { 

            playerData.stats["gold"] -= 10000;
            let random = Math.random() * totalProbability;
            let cumulativeProbability = 0;
            let pet = null;
        
            for (let i = 0; i < PetsData.NormalEgg.length; i++) {
                let currentPet = PetsData.NormalEgg[i];
                cumulativeProbability += parseFloat(currentPet.probability);
                if (random <= cumulativeProbability) {
                    pet = currentPet;
                    break;
                }
            }
        
            if (pet) {
                let message = "Congratulations! You got a " + pet.name + "!";
                console.log(message);
                updatePlayerStats(playerData);
                playerData.PetInventory[pet.name] = playerData.PetInventory[pet.name] + 1 || 1; // Handle undefined pet
            } else {
                console.log("You got nothing!");
            }
        }
        
}

//fonction qui affiche les pets dans l'inventaire sur la console toute les 2 secondes
function displayPetInventory(playerData) {
    setInterval(function() {
        console.log(playerData.PetInventory);
    }, 2000);
}



//on va crée le menu de base contenant en haut sur toute la longueur un menu deroulant de la liste des oeufs
//on peut cliquer sur l'oeuf pour aller dans sont menu
//en dessous du menu deroulant se trouve l'invetaire des pets obtenus et leur nombre 
//de plus il y a a gauche de cette inventaire les pets que l'on peut equiper

//on va crée une fonction qui va crée le menu de base
function DisplayMenu(playerData, PetsData) {

    let eggsection = document.getElementById("egg-section");
    eggsection.style.display = "none";

    // Supposons que votre section de navigation est déjà en place
    // Nous allons créer la barre de défilement pour les œufs et l'inventaire des pets

    // Création de la barre de défilement pour les œufs
    let eggScrollContainer = document.createElement("div");
    eggScrollContainer.style.display = "block";
    eggScrollContainer.style.width = "100%";
    eggScrollContainer.style.height = "150px"; // Hauteur suffisante pour les images des œufs
    eggScrollContainer.style.overflowX = "auto"; // Active le défilement horizontal
    eggScrollContainer.style.whiteSpace = "nowrap"; // Permet aux éléments de rester en ligne
    eggScrollContainer.style.display = "flex"; // Utilise flexbox pour aligner les éléments
    eggScrollContainer.style.alignItems = "center"; // Centre les éléments verticalement

    // Ajout d'espaces pour les œufs (remplacés par des images à l'avenir)
    Object.keys(PetsData).forEach(eggType => {
        let eggSlot = document.createElement("div");
        eggSlot.style.width = "100px"; // Largeur pour l'image de l'œuf
        eggSlot.style.height = "100px"; // Hauteur pour l'image de l'œuf
        eggSlot.style.border = "1px solid #000"; // Bordure pour visualiser l'emplacement
        eggSlot.style.margin = "10px"; // Marge autour de chaque œuf
        eggSlot.style.display = "inline-block"; // Affichage en ligne pour le défilement
        eggSlot.textContent = eggType; // Texte temporaire à remplacer par une image
        eggScrollContainer.appendChild(eggSlot);
        
        // Ajouter un gestionnaire de clic pour naviguer vers la section de l'œuf
        eggSlot.addEventListener('click', () => navigateToEggSection(eggType));
    });

    // Fonction pour la navigation vers la section de l'œuf
    function navigateToEggSection(eggType) {
        console.log("Navigating to section:", eggType);
        eggsection.style.display = "grid";
        eggScrollContainer.style.display = "none";
        
        // Implémentez la logique de navigation ici
    }

    // Ajouter la barre de défilement au DOM
    let gamePartEgg = document.getElementById("egg-menu");
    gamePartEgg.appendChild(eggScrollContainer);

    // Appel de la fonction pour appliquer les styles
    applyStyles(eggScrollContainer);
}



function applyStyles(menuElement) {
    // Style pour le menu principal
    menuElement.style.padding = "20px";
    menuElement.style.marginTop = "10px";
    menuElement.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    menuElement.style.borderRadius = "8px";
    menuElement.style.width = "80%";
    menuElement.style.maxWidth = "600px"; // Limite la largeur pour les grands écrans
    menuElement.style.backgroundColor = "#fff";

    // Styles pour le dropdown
    const dropdown = menuElement.querySelector("select");
    if (dropdown) {
        dropdown.style.padding = "10px";
        dropdown.style.borderRadius = "5px";
        dropdown.style.marginBottom = "20px";
        dropdown.style.width = "100%";
        dropdown.style.boxSizing = "border-box"; // Assure que le padding ne dépasse pas la largeur définie
    }

    // Styles pour l'inventaire des pets et les sections de pets à équiper
    const divs = menuElement.querySelectorAll("div");
    divs.forEach(div => {
        div.style.marginBottom = "15px";
        div.style.textAlign = "center";
        if (!div.classList.contains('no-style')) { // Ajouter une classe "no-style" aux divs que vous ne voulez pas styler
            div.style.padding = "5px";
            div.style.borderRadius = "5px";
            div.style.backgroundColor = "#eaeaea";
            div.style.boxShadow = "inset 0 0 5px rgba(0, 0, 0, 0.2)";
        }
    });

    // Si vous avez d'autres éléments spécifiques à styler, ajoutez ici
}
