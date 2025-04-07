// Fonction pour afficher/masquer les sections
function toggleSections(sectionToShow) {
    const citymap = document.getElementById('game-citymap');
    const woodSection = document.getElementById('game-part-wood');
    const woodXp = document.getElementById('wood-xp-progress-bar');
    const minimapWood = document.getElementById('wood-minimap');
    const minimapMine = document.getElementById('mine-minimap');
    const minimapEgg = document.getElementById('egg-minimap');
    const minimapFish = document.getElementById('fish-minimap');
    const mineSection = document.getElementById('game-part-mine');
    const eggSection = document.getElementById('game-part-egg');
    const fishSection = document.getElementById('game-part-fish');
    const fishXp = document.getElementById('fish-xp-progress-bar');

    // Masquer la citymap
    citymap.style.display = 'none';

    // Masquer toutes les sections
    woodSection.style.display = 'none';
    woodXp.style.display = 'none';
    mineSection.style.display = 'none';
    eggSection.style.display = 'none';
    fishSection.style.display = 'none';
    fishXp.style.display = 'none';

    // Afficher la section demandée
    if (sectionToShow === 'wood') {
        woodSection.style.display = 'grid';
        woodXp.style.display = 'flex';
        minimapWood.style.display = 'flex';
        minimapMine.style.display = 'none';
        minimapEgg.style.display = 'none';
        minimapFish.style.display = 'none';
    } 
    else if (sectionToShow === 'mine') {
        mineSection.style.display = 'grid';
        minimapMine.style.display = 'flex';
        minimapWood.style.display = 'none';
        minimapEgg.style.display = 'none';
        minimapFish.style.display = 'none';
    } 
    else if (sectionToShow === 'egg') {
        eggSection.style.display = 'grid';
        minimapMine.style.display = 'none';
        minimapWood.style.display = 'none';
        minimapEgg.style.display = 'flex';
        minimapFish.style.display = 'none';
    }
    else if (sectionToShow === 'citymap') {
        citymap.style.display = 'flex';
        minimapWood.style.display = 'none';
        minimapMine.style.display = 'none';
        minimapEgg.style.display = 'none';
        minimapFish.style.display = 'none';
        console.log('citymap');
    }
    else if (sectionToShow === 'fish') {
        fishSection.style.display = 'grid';
        fishXp.style.display = 'flex';
        minimapFish.style.display = 'flex';
        minimapWood.style.display = 'none';
        minimapMine.style.display = 'none';
        minimapEgg.style.display = 'none';
        console.log('fish');
    }

}

// Ajouter des écouteurs d'événements aux boutons
document.getElementById('wood-button').addEventListener('click', function() {
    toggleSections('wood');
});

document.getElementById('mine-button').addEventListener('click', function() {
    toggleSections('mine');
});

document.getElementById('egg-button').addEventListener('click', function() {
    toggleSections('egg');
});

document.getElementById('fish-button').addEventListener('click', function() {
    toggleSections('fish');
});

document.addEventListener('DOMContentLoaded', function() {
    // Ajouter un écouteur d'événements au bouton de la minimap qui est une classe nommé minimap-button

    const minimapButtons = document.getElementsByClassName('minimap-button');
    for (let i = 0; i < minimapButtons.length; i++) {
        minimapButtons[i].addEventListener('click', function() {
            toggleSections('citymap');
        });
    }
});




// fonction pour afficher le menu amélioration
function showOakUpgradeMenu() {
    const upgradeMenu = document.getElementById('oak-upgrade-menu');
    upgradeMenu.style.display = 'grid';
}

document.getElementById('Oak-upgrade-button').addEventListener('click', function() {
    showOakUpgradeMenu();
});

// fonction pour cacher le menu amélioration
function hideOakUpgradeMenu() {
    const upgradeMenu = document.getElementById('oak-upgrade-menu');
    upgradeMenu.style.display = 'none';
}

document.getElementById('Oak-upgrade-close-button').addEventListener('click', function() {
    hideOakUpgradeMenu();
});

// fonction pour afficher le menu amélioration
function showBirchUpgradeMenu() {
    const upgradeMenu = document.getElementById('birch-upgrade-menu');
    upgradeMenu.style.display = 'grid';
}

document.getElementById('Birch-upgrade-button').addEventListener('click', function() {
    showBirchUpgradeMenu();
});

// fonction pour cacher le menu amélioration
function hideBirchUpgradeMenu() {
    const upgradeMenu = document.getElementById('birch-upgrade-menu');
    upgradeMenu.style.display = 'none';
}

document.getElementById('Birch-upgrade-close-button').addEventListener('click', function() {
    hideBirchUpgradeMenu();
});

// fonction pour afficher le menu amélioration
function showPineUpgradeMenu() {
    const upgradeMenu = document.getElementById('pine-upgrade-menu');
    upgradeMenu.style.display = 'grid';
}

document.getElementById('Pine-upgrade-button').addEventListener('click', function() {
    showPineUpgradeMenu();
});

// fonction pour cacher le menu amélioration
function hidePineUpgradeMenu() {
    const upgradeMenu = document.getElementById('pine-upgrade-menu');
    upgradeMenu.style.display = 'none';
}

document.getElementById('Pine-upgrade-close-button').addEventListener('click', function() {
    hidePineUpgradeMenu();
});

// fonction pour afficher le menu amélioration Maple
function showMapleUpgradeMenu() {
    const upgradeMenu = document.getElementById('maple-upgrade-menu');
    upgradeMenu.style.display = 'grid';
}

document.getElementById('Maple-upgrade-button').addEventListener('click', function() {
    showMapleUpgradeMenu();
});

// fonction pour cacher le menu amélioration
function hideMapleUpgradeMenu() {
    const upgradeMenu = document.getElementById('maple-upgrade-menu');
    upgradeMenu.style.display = 'none';
}

document.getElementById('Maple-upgrade-close-button').addEventListener('click', function() {
    hideMapleUpgradeMenu();
});

// fonction pour afficher le menu amélioration Cherry
function showCherryUpgradeMenu() {
    const upgradeMenu = document.getElementById('cherry-upgrade-menu');
    upgradeMenu.style.display = 'grid';
}

document.getElementById('Cherry-upgrade-button').addEventListener('click', function() {
    showCherryUpgradeMenu();
});

// fonction pour cacher le menu amélioration
function hideCherryUpgradeMenu() {
    const upgradeMenu = document.getElementById('cherry-upgrade-menu');
    upgradeMenu.style.display = 'none';
}

document.getElementById('Cherry-upgrade-close-button').addEventListener('click', function() {
    hideCherryUpgradeMenu();
});

// fonction pour afficher le menu amélioration Walnut
function showWalnutUpgradeMenu() {
    const upgradeMenu = document.getElementById('walnut-upgrade-menu');
    upgradeMenu.style.display = 'grid';
}

document.getElementById('Walnut-upgrade-button').addEventListener('click', function() {
    showWalnutUpgradeMenu();
});

// fonction pour cacher le menu amélioration
function hideWalnutUpgradeMenu() {
    const upgradeMenu = document.getElementById('walnut-upgrade-menu');
    upgradeMenu.style.display = 'none';
}

document.getElementById('Walnut-upgrade-close-button').addEventListener('click', function() {
    hideWalnutUpgradeMenu();
});

// fonction pour afficher le menu amélioration Mahogany
function showMahoganyUpgradeMenu() {
    const upgradeMenu = document.getElementById('mahogany-upgrade-menu');
    upgradeMenu.style.display = 'grid';
}

document.getElementById('Mahogany-upgrade-button').addEventListener('click', function() {
    showMahoganyUpgradeMenu();
});

// fonction pour cacher le menu amélioration
function hideMahoganyUpgradeMenu() {
    const upgradeMenu = document.getElementById('mahogany-upgrade-menu');
    upgradeMenu.style.display = 'none';
}

document.getElementById('Mahogany-upgrade-close-button').addEventListener('click', function() {
    hideMahoganyUpgradeMenu();
});

// fonction pour afficher le menu amélioration Cedar
function showCedarUpgradeMenu() {
    const upgradeMenu = document.getElementById('cedar-upgrade-menu');
    upgradeMenu.style.display = 'grid';
}

document.getElementById('Cedar-upgrade-button').addEventListener('click', function() {
    showCedarUpgradeMenu();
});

// fonction pour cacher le menu amélioration
function hideCedarUpgradeMenu() {
    const upgradeMenu = document.getElementById('cedar-upgrade-menu');
    upgradeMenu.style.display = 'none';
}

document.getElementById('Cedar-upgrade-close-button').addEventListener('click', function() {
    hideCedarUpgradeMenu();
});

// fonction pour afficher le menu amélioration Bamboo
function showBambooUpgradeMenu() {
    const upgradeMenu = document.getElementById('bamboo-upgrade-menu');
    upgradeMenu.style.display = 'grid';
}

document.getElementById('Bamboo-upgrade-button').addEventListener('click', function() {
    showBambooUpgradeMenu();
});

// fonction pour cacher le menu amélioration
function hideBambooUpgradeMenu() {
    const upgradeMenu = document.getElementById('bamboo-upgrade-menu');
    upgradeMenu.style.display = 'none';
}

document.getElementById('Bamboo-upgrade-close-button').addEventListener('click', function() {
    hideBambooUpgradeMenu();
});

// fonction pour afficher le menu amélioration DivinE
function showDivinUpgradeMenu() {
    const upgradeMenu = document.getElementById('divine-upgrade-menu');
    upgradeMenu.style.display = 'grid';
}

document.getElementById('Divine-upgrade-button').addEventListener('click', function() {
    showDivinUpgradeMenu();
});

// fonction pour cacher le menu amélioration
function hideDivinUpgradeMenu() {
    const upgradeMenu = document.getElementById('divine-upgrade-menu');
    upgradeMenu.style.display = 'none';
}

document.getElementById('Divine-upgrade-close-button').addEventListener('click', function() {
    hideDivinUpgradeMenu();
});





