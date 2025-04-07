// introduction.js
import { initGame } from './game.js';

export function startIntroduction() {
    // Afficher l'écran d'introduction
    // ...

    setTimeout(function() {
        endIntroduction();
    }, 500);
}

function endIntroduction() {
    // Terminer l'écran d'introduction et commencer le jeu principal
    initGame();
}
