// dpsCalculator.js
import { formatNumber, formatMultiplier } from './utils.js';

export class DPSCalculator {
    constructor(gameState) {
      this.gameState = gameState;
      // Tableau qui contiendra les événements de clic récent : {timestamp, damage}
      this.clickEvents = [];
      // Fenêtre d'analyse en secondes (exemple: 5 secondes)
      this.windowSize = 5;
      
      // UI : élément qui affiche le DPS
      this.dpsDisplayEl = document.getElementById('dps-display');
      // UI : panneau détaillé pour afficher toutes les informations DPS
      this.dpsDetailsEl = document.getElementById('dps-details');
      this.toggleDetailsButton = document.getElementById('toggle-dps-details');
      this.clickDamageEl = document.getElementById('stat-click-damage');
      this.autoDpsEl = document.getElementById('stat-auto-dps');
      this.rewardMultiEl = document.getElementById('stat-reward-multi');
      
      // Au clic sur le dpsDisplay, on bascule l'affichage du panneau détaillé
      if (this.dpsDisplayEl) {
        this.dpsDisplayEl.addEventListener('click', () => {
          this.toggleDetails();
        });
      }
      if (this.toggleDetailsButton) {
        this.toggleDetailsButton.addEventListener('click', () => {
          this.toggleDetails();
        });
      }
      
      // Mise à jour périodique du DPS toutes les secondes
      setInterval(() => {
        this.updateDPS();
      }, 1000);
    }
    
    // Enregistre un clic avec le dégât infligé
    recordClick(damage) {
      const now = Date.now();
      this.clickEvents.push({ timestamp: now, damage: damage });
      this.cleanOldEvents();
    }
    
    // Supprime les événements trop anciens pour la fenêtre d'analyse
    cleanOldEvents() {
      const now = Date.now();
      this.clickEvents = this.clickEvents.filter(ev => (now - ev.timestamp) <= this.windowSize * 1000);
    }
    
    // Calcule le DPS moyen des clics sur la fenêtre donnée
    getClickDPS() {
      this.cleanOldEvents();
      const totalDamage = this.clickEvents.reduce((sum, ev) => sum + ev.damage, 0);
      return totalDamage / this.windowSize;
    }
    
    // Calcule l'auto DPS provenant des améliorations
    // Bûcheron DPS = niveau * 1, Scierie DPS = niveau * 10
    getAutoDPS() {
      const upgrades = this.gameState.player.woodUpgrades || { lumberjack: 0, sawmill: 0 };
      const lumberjackDPS = upgrades.lumberjack * 1;
      const sawmillDPS = upgrades.sawmill * 10;
      return {
        autoDPS: lumberjackDPS + sawmillDPS,
        lumberjackDPS: lumberjackDPS,
        sawmillDPS: sawmillDPS
      };
    }
    
    // Met à jour l'affichage du DPS total et, si visible, le panneau détaillé
    updateDPS() {
      const clickDPS = this.getClickDPS();
      const autoData = this.getAutoDPS();
      const petBonus = this.gameState.player.petBonuses || { clickDamageMultiplier: 1, dpsMultiplier: 1 };
      const adjustedClickDPS = clickDPS * petBonus.clickDamageMultiplier;
      const adjustedAutoDPS = autoData.autoDPS * petBonus.dpsMultiplier;
      const totalDPS = adjustedClickDPS + adjustedAutoDPS;
      if (this.dpsDisplayEl) {
        this.dpsDisplayEl.textContent = `DPS: ${formatNumber(totalDPS)}`;
      }

      const clickDamage = this.getClickDamage();
      if (this.clickDamageEl) {
        this.clickDamageEl.textContent = formatNumber(clickDamage);
      }
      if (this.autoDpsEl) {
        this.autoDpsEl.textContent = formatNumber(adjustedAutoDPS);
      }
      if (this.rewardMultiEl) {
        const rewardMulti = (this.gameState.player.bonuses.rewardMultiplier || 1)
          * (this.gameState.player.petBonuses?.rewardMultiplier || 1);
        this.rewardMultiEl.textContent = formatMultiplier(rewardMulti);
      }
      
      if (this.dpsDetailsEl && this.dpsDetailsEl.style.display === 'block') {
        // Affichage détaillé incluant la décomposition du auto DPS
        this.dpsDetailsEl.innerHTML = `
          <h4>Détail DPS</h4>
          <p><strong>Auto DPS:</strong> ${formatNumber(adjustedAutoDPS)}</p>
          <ul>
            <li>Bûcheron: ${formatNumber(autoData.lumberjackDPS)}</li>
            <li>Scierie: ${formatNumber(autoData.sawmillDPS)}</li>
          </ul>
          <p><strong>Click DPS (moyenne sur ${this.windowSize} s):</strong> ${formatNumber(adjustedClickDPS)}</p>
          <p><strong>Total DPS:</strong> ${formatNumber(totalDPS)}</p>
          <p><strong>Clics récents:</strong> ${this.clickEvents.length}</p>
        `;
      }
    }

    getClickDamage() {
      const baseDamage = this.gameState.player.baseClickDamage || 1;
      const petBonus = this.gameState.player.petBonuses?.clickDamageMultiplier || 1;
      return baseDamage
        * (this.gameState.player.forceMultiplier || 1)
        * (this.gameState.player.bonuses.clickDamageMultiplier || 1)
        * petBonus;
    }
    
    // Bascule l'affichage du panneau détaillé
    toggleDetails() {
      if (this.dpsDetailsEl) {
        const nextState = this.dpsDetailsEl.style.display !== 'block';
        this.dpsDetailsEl.style.display = nextState ? 'block' : 'none';
        if (this.toggleDetailsButton) {
          this.toggleDetailsButton.setAttribute('aria-expanded', nextState.toString());
        }
      }
    }
  }
  
