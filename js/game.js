import { initWoodManagement } from './work/wood_management.js';
import { updatePlayerStats } from './player.js';
import { initMineManagement } from './work/mine_management.js';
import { initEggManagement } from './work/egg_management.js';
import { initFishManagement } from './work/fish_management.js';

let woodbuildingsData, resourcesData, playerData, resourcesDataMines, minebuildingsData, petData, resourcesDataFish;

async function loadGameData() {
    try {
        const buildingsResponse = await fetch('../data/woodbuild.json');
        console.log(buildingsResponse);
        woodbuildingsData = await buildingsResponse.json();

        const buildingsResponseM = await fetch('../data/minebuild.json');
        minebuildingsData = await buildingsResponseM.json();

        const resourcesResponse = await fetch('../data/ressources.json');
        const resourcesRawData = await resourcesResponse.json();
        resourcesData = resourcesRawData.woods; // Accédez à la clé "woods" du JSON
        resourcesDataMines = resourcesRawData.MineOre; // Accédez à la clé "mines" du JSON
        resourcesDataFish = resourcesRawData.Fish; // Accédez à la clé "fish" du JSON

        const playerResponse = await fetch('../data/player.json');
        playerData = await playerResponse.json();

        const petResponse = await fetch('../data/pets.json');
        petData = await petResponse.json();

        console.log('Données du jeu chargées:', woodbuildingsData, resourcesData, playerData, resourcesDataMines, minebuildingsData, petData);

        initWoodManagement(playerData,resourcesData,woodbuildingsData);
        initMineManagement(playerData,resourcesDataMines,minebuildingsData);
        initEggManagement(playerData,petData);
        
    } catch (error) {
        console.error('Erreur lors du chargement des données du jeu:', error);
    }

}

export function initGame() {
    loadGameData();
}







