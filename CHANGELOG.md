# CHANGELOG - Module JaxX_tables

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [Unreleased] - 2026-04-01 03:36
### ⚖️ Licence & Crédits
- 01/04/2026 03:36 : [IA] Ajout de la licence **CC BY-NC-SA 4.0** (Non-lucrative).
- 01/04/2026 03:36 : [IA] Insertion des filigranes techniques (headers) avec liens vers **AnunaQi.com** et GitHub dans tous les fichiers sources.
- 01/04/2026 03:36 : [IA] Création des fichiers `LICENSE` et `.gitignore`.

## [Unreleased] - 2026-04-01 03:20
### 📝 Documentation
- 01/04/2026 03:20 : [IA] Nettoyage et correction de la mise en forme Markdown du `README.md` (blocs de code, alertes, espacement).

## [Unreleased] - 2026-03-31 05:04
### 🔥 Réécriture complète — Stabilisation
- 31/03/2026 16:05 : [IA] Expand conditionnel : chevron uniquement sur les lignes avec contenu, colonne expand masquée si aucun contenu, réapparition via AJAX.
- 31/03/2026 16:05 : [IA] Zébrage par classes `jx_row_even`/`jx_row_odd` au lieu de `nth-child` (fix décalage par `jx_row_details`).
- 31/03/2026 16:05 : [IA] Suppression doublon champ recherche (était dans PHP controls + JS toolbar).
- 31/03/2026 16:03 : [IA] Outils tri/filtre repositionnés au-dessus du label dans les en-têtes de colonnes.
- 31/03/2026 15:38 : [IA] Section 6 : Tutoriel d'intégration (PHP statique, Mode Cartes, AJAX).
- 31/03/2026 15:34 : [IA] Restauration JaxX_tables_demo_ajax.php (vidé par accident).
- 31/03/2026 03:43 : [IA] Mode Cartes : Suppression du trigger chevron, remplacement par bouton "+ Info" en bas de carte.
- 31/03/2026 03:30 : [IA] Toolbar Cartes : Tri à gauche/droite (▲ Label ▼) et support des filtres.
- 31/03/2026 03:20 : [IA] Section 5 : Documentation générée par le module. Correction expand (slideToggle).
- 31/03/2026 01:10 : [IA] Support images, scrollbars stylées, border-radius.
- **31/03/2026 05:04** : [IA] Corrections post-réécriture (Round 5).
    - **Fix reset** : Le bouton "Réinitialiser les préférences" ne recharge plus la page — reset en place (clear filtres, tri, search, retour mode table).
    - **Fix popover filtre** : Ancré en `position: absolute` sous le `<th>` parent au lieu de `position: fixed` sur le body (était déconnecté du bouton).
    - **Fix AJAX Section 2** : Correction `table_id` (`table_ajax` au lieu de `clients_table`) + ajout fallback default pour `$columns` (erreur PHP `Undefined variable`).
    - **Fix overflow cartes** : Ajout padding sur `.jx_table_body` et `overflow: visible` sur `.jx_table_scroll_container` en mode cartes pour éviter la coupure lors du hover scale.
    - **Données enrichies** : 15 lignes en Section 1 (statique), 12 cartes en Section 4 — suffisant pour le défilement vertical.
- **31/03/2026 04:48** : [IA] Réécriture complète JS + séparation CSS.
    - **RÉÉCRITURE** `JaxX_tables.js` : code nettoyé de zéro, suppression des doublons, blocs orphelins, handlers multiples.
    - **Filtres checkbox** : Remplacement des inputs texte par des listes à cocher avec valeurs uniques, compteurs, recherche dans la liste, boutons "Tout/Aucun".
    - **Séparation CSS** : `JaxX_tables.css` = structurel pur (layout, dimensions, resets). `JaxX_tables_demo.css` = design premium dark mode (couleurs, ombres, animations).
    - **Bouton Reset** : Ajout visible dans la toolbar pour réinitialiser le localStorage.
    - **Clipboard mobile** : Boutons de copie toujours visibles sur touch (`@media (hover: none)`), hover au desktop.
    - **Filtres AJAX** : Support appel dédié `get_jx_unique_values` pour récupérer toutes les valeurs possibles (pas seulement DOM).

### Historique précédent
- **31/03/2026 05:00** : [IA] Corrections Bug Racine + Export CSV.
    - **Fix critique** : Suppression appel `bindFilterEvents()` inexistant qui faisait crasher tout le JS.
    - **Fix design** : Suppression `border-bottom` sur `.jx_col_label` (rectangles blancs dans les headers).
    - **Export CSV** : Nouveau bouton `export_csv => true` — télécharge les données visibles avec BOM UTF-8 (compatible Excel).
    - Réécriture de `JaxX_tables_demo.php` : sortie du `echo` global (PHP affiché en texte brut corrigé).
    - Ajout des variables CSS manquantes `--slate-*` et `--sky-*` dans `:root`.
    - Correction `overflow: hidden` → `overflow: visible` sur `.jx_table_wrapper` (popovers coupés).
    - Fix HTML invalide : `div.jx_row_actions` sorti du `<tr>`, replacé dans un `<td>` valide.
    - Correction structurelle `JaxX_tables.js` : fermeture manquante de `bindEvents()`.
- **31/03/2026 04:30** : [IA]### Phase 6 : Finitions & Optimisations UI
    - [x] Correction bug expand (slideToggle stable)
    - [x] Support images (pleine largeur en cartes, auto en tableau)
    - [x] Toolbar Cartes : Boutons de tri ▲ Label ▼
    - [x] Toolbar Cartes : Support des filtres colonnes `filterable`
    - [x] Mode Cartes : Bouton "+ Info" en bas au lieu du chevron
    - [x] Section 5 : Génération dynamique de la doc
    - [ ] Test final & Nettoyage (console.log)
    - Optimisation des micro-animations sur les cartes (hover scale/shadow).
    - Finalisation de la documentation interactive dans `JaxX_tables_demo.php`.
    - Sécurisation des appels AJAX avec gestion d'erreurs native.
    - Simplification du Toggle Mode (bouton unique avec icône dynamique).
- **[UI]** Effet "Liquidglass" (Backdrop-filter blur) sur l'en-tête collant.
- **[UI]** Système de lignes déployables (`slideToggle`) avec trigger en début de ligne.
- **[UX]** Animations d'apparition séquencée (staggered) pour les lignes (40ms d'intervalle).
- **[UX]** Transition fluide animée entre le mode Tableau et le mode Cartes.
- **[UX]** Tri à deux boutons distincts (ASC/DESC) pour une meilleure précision.

### 🛠️ Améliorations & Corrections
- **[DOC]** Standardisation des en-têtes techniques selon `documentation_code.md`.
- **[JS]** Architecture multi-instances via la classe `JaxX_table`.
- **[CSS]** Isolation complète via le préfixe `jx_`.

## [1.0.0] - 2026-03-30
- Initialisation du module JaxX_tables (V2).
- Moteur de rendu de base (PHP, CSS, JS).
