# Script pour compter le nombre de ligne de code dans tout le fichier
# Prise en charge : html - css - javasript
# Auteur: Loureau Ryan

import os
import re

# Fonction pour compter le nombre de ligne de code
def count_line(file):
    # Ouvrir le fichier
    with open(file, 'r') as f:
        # Lire le fichier
        data = f.read()
        # Compter le nombre de ligne
        lines = data.split('\n')
        # Retourner le nombre de ligne
        return len(lines)
    
# Fonction récursive pour parcourir les dossiers
def count_lines(path):
    # Initialiser le nombre de ligne
    total_lines = 0
    # Parcourir les dossiers
    for root, dirs, files in os.walk(path):
        for file in files:
            # Vérifier si le fichier est un fichier html, css ou javascript
            if re.search(r'\.html$', file) or re.search(r'\.css$', file) or re.search(r'\.js$', file):
                # Compter le nombre de ligne
                total_lines += count_line(os.path.join(root, file))
    # Retourner le nombre de ligne
    return total_lines

# Appel de la fonction de la où est le fichier
print(count_lines(os.path.dirname(os.path.abspath(__file__))))