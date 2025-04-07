// menu.js


export function showMenu() {
    var menuContainer = document.getElementById('menu-container');
    if (menuContainer) {
        menuContainer.style.display = 'block'; // Affiche le menu
    }
}

export function hideMenu() {
    var menuContainer = document.getElementById('menu-container');
    if (menuContainer) {
        menuContainer.style.display = 'none'; // Cache le menu
    }
}