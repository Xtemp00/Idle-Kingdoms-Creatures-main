//a chaque instant on actualise les statistiques du joueur
//on va chercher les données du joueur PlayerDate dans le fichier player.js

export function updatePlayerStats(playerData) {
    //l'argent, le niveau etc

    const gold = playerData.stats["gold"];
    const level = playerData.stats["lvl"];
    const totalwood = playerData.inventory["Wood"];
    const name = playerData.name;
    const totalmine = playerData.inventory["Mine"];
    
    //on les affiche
    document.getElementById('player-gold').textContent = gold + " PO";
    document.getElementById('player-level').textContent = level + " lvl";
    document.getElementById('player-wood').textContent = totalwood + " Wood Cutted";
    document.getElementById('player-name').textContent = name;
    document.getElementById('player-ore').textContent = totalmine + " Ore mined";

}

//on appelle la fonction pour actualiser les statistiques du joueur toute les 50ms
