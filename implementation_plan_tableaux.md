# Module JaxX_tables — Documentation technique

> **Version** : 2.0.0-Beta
> **Créé** : 31/03/2026
> **Mis à jour** : 01/04/2026
> **Statut** : ✅ Implémenté — En cours de stabilisation
> **Priorité** : Haute — Module transversal utilisé par toutes les pages de listing

---

## 1. Contexte & Objectif

Remplacement du module `_modules/table/` (mono-instance, variables globales JS) par un moteur multi-instances, responsive, avec persistance d'état.

Les deux modules **coexistent** — la migration est progressive, page par page.

---

## 2. Fichiers du module

```
_modules/JaxX_tables/
├── JaxX_tables.php           — Moteur de rendu PHP
├── JaxX_tables.js            — Logique JS (pattern prototype ES5)
├── JaxX_tables.css           — CSS structurel (layout, pas de couleurs)
├── JaxX_tables_demo.php      — Page de démo + tutoriel d'intégration
├── JaxX_tables_demo.css      — Thème visuel dark pour la démo
├── JaxX_tables_demo.js       — Scripts spécifiques à la démo
└── JaxX_tables_demo_ajax.php — Endpoint AJAX de la démo (Section 2)
```

---

## 3. Intégration via autoloader (recommandé)

```php
// Dans cfg.php ou _brain.php de la page
$required_modules['JaxX_tables'] = 'JaxX_tables';
require($root . '_modules/autoloaders/autoloader_modules.php');
// → charge automatiquement JaxX_tables.php, enregistre .js dans $header_script et .css dans $css
```

Ou inclusion directe pour la démo / tests :
```php
require_once '_modules/JaxX_tables/JaxX_tables.php';
```

---

## 4. API PHP

### 4.1 Fonction principale

```php
echo return_JaxX_table($array_table);
```

### 4.2 Paramètres de `$array_table`

| Clé | Type | Défaut | Description |
|---|---|---|---|
| `table_id` | string | auto-généré | ID unique de l'instance. Clé du localStorage. |
| `ajax_url` | string | `""` | URL du handler AJAX. Si vide : données statiques. |
| `display_mode` | string | `"table"` | Mode initial : `"table"` ou `"cards"`. |
| `resizable` | bool | `true` | Colonnes redimensionnables par glisser. Double-clic = ajustement auto. |
| `responsive` | bool | `false` | Bascule automatique en mode cartes sous 768px. |
| `expandable` | bool | `false` | Active les lignes déployables (`jx_expand_content`). |
| `export_csv` | bool | `false` | Affiche le bouton d'export CSV. |
| `animated` | bool | `true` | Animation d'apparition séquencée des lignes. |
| `columns` | array | — | Définition des colonnes (voir §4.3). |
| `data` | array | — | Tableau de lignes (mode statique, sans AJAX). |

### 4.3 Paramètres de colonnes

```php
'columns' => [
    'ma_colonne' => [
        'label'      => 'Mon Label',   // Libellé en-tête
        'sortable'   => true,          // Boutons tri ASC/DESC
        'filterable' => true,          // Filtre checkbox (ou plage dates si type=date)
        'type'       => 'date',        // 'text' (défaut) ou 'date'
    ]
]
```

### 4.4 Paramètres de ligne (dans `data`)

```php
'data' => [
    [
        'ma_colonne'        => 'valeur',
        'id'                => 42,         // Exposé via data-row-id sur le <tr>
        'jx_expand_content' => '<p>HTML déployable</p>', // Nécessite expandable => true
    ]
]
```

### 4.5 Fonctions PHP exportées

| Fonction | Rôle |
|---|---|
| `return_JaxX_table($array_table)` | HTML complet (wrapper + header + lignes) |
| `return_JaxX_lines($array_table)` | HTML des lignes uniquement (pour handler AJAX) |
| `return_JaxX_title_cells($array_table)` | HTML de la ligne d'en-tête (interne) |
| `return_JaxX_controls($array_table)` | HTML de la barre de contrôles (interne) |

---

## 5. Fonctionnalités implémentées

### 5.1 Tableau des fonctionnalités

| Fonctionnalité | Statut | Notes |
|---|---|---|
| Multi-instances (plusieurs tableaux par page) | ✅ | Pattern prototype JS, scope par `table_id` |
| Chargement AJAX + infinite scroll | ✅ | POST `{table_id, page, query}` |
| Données statiques PHP (sans AJAX) | ✅ | Clé `data` dans `$array_table` |
| Tri par colonne ASC/DESC | ✅ | Côté client (statique) ou serveur (AJAX) |
| Filtre par colonne — liste checkbox | ✅ | Valeurs uniques extraites du DOM |
| Filtre par colonne — plage de dates | ✅ | Colonnes avec `type => 'date'` |
| Moteur de recherche global | ✅ | Debounce 300ms, filtre client-side |
| Lignes déployables (expand) | ✅ | `jx_expand_content` + slide animation |
| Mode tableau / mode cartes | ✅ | Toggle, labels affichés dans la carte |
| Bascule responsive automatique | ✅ | Option `responsive`, breakpoint 768px |
| Colonnes déplaçables (drag & drop) | ✅ | HTML5 DnD, indicateur ligne verticale |
| Colonnes redimensionnables | ✅ | Overlay technique (contourne conflit DnD) |
| Ajustement auto colonne (double-clic) | ✅ | Mesure `getBoundingClientRect` style Excel |
| Masquage de colonnes | ✅ | Popover checkbox, persisté en localStorage |
| Export CSV | ✅ | Données visibles dans le DOM |
| Copie cellule — Binaire Image | ✅ | Capture physique (Blob PNG) via Canvas |
| Copie ligne — Hybride Office/Chat | ✅ | Base64 HTML (Office) + Texte structuré (WhatsApp) |
| Persistance localStorage | ✅ | Ordre, largeurs, mode, filtres, colonnes masquées |
| Versionnement du state (anti-corruption) | ✅ | `JX_STATE_VERSION = "5"` — auto-purge |
| Animations d'apparition des lignes | ✅ | Stagger séquentiel |
| Empty state | ✅ | Icône + message "Aucune donnée" |
| Loader AJAX | ✅ | Spinner + fadeIn/fadeOut |
| Popover aide contextuelle | ✅ | Contenu dynamique selon options du tableau |
| Touch support (resize) | ✅ | `touchstart/move/end` |

### 5.2 Fonctionnalités non implémentées (prévues)

| Fonctionnalité | Priorité |
|---|---|
| Sélection de lignes (shift-clic multi-sélection) | 🟠 Important |
| Actions groupées sur la sélection | 🟠 Important |
| Injection AJAX du tableau lui-même dans un conteneur | 🟡 Utile |

---

## 6. Architecture JS

### 6.1 Pattern

Objet prototype ES5, une instance par tableau, scope privé total :

```javascript
function JaxX_table(table_id) { ... }

JaxX_table.prototype = {
    init(),
    bindEvents(),
    renderToolbar(),        // Toolbar mode cartes
    bindColumnResize(),     // Resize + double-clic auto-fit
    bindDragAndDrop(),      // Drag & drop colonnes
    bindResponsive(),       // Bascule auto mobile
    hideColumn(colId),
    showColumn(colId),
    openColumnsPicker(),    // Popover masquage colonnes
    saveState(),
    loadState(),
    applySort(colId, dir),
    refresh(),              // Filtre/tri côté client
    toggleMode(),           // Table ↔ cartes
    injectCardInfoButtons(),
    revealLines(),          // Animation stagger
    exportCsv(),
    loadLines(append),      // Chargement AJAX
};

// Auto-init au chargement DOM
$(".jx_table_wrapper[id]").each(function() {
    new JaxX_table($(this).attr("id"));
});
```

### 6.2 Sections repères dans JaxX_tables.js (`[CTRL+D]`)

| Repère | Contenu |
|---|---|
| `[CONSTRUCTOR]` | Propriétés de l'instance |
| `[INIT]` | Initialisation, loadState, bindings conditionnels |
| `[TOOLBAR]` | Rendu toolbar en mode cartes |
| `[EVENTS]` | Tous les event handlers |
| `[FILTERS]` | Popover filtre checkbox + plage de dates |
| `[DRAGDROP]` | Drag & drop colonnes avec indicateur |
| `[COLUMNRESIZE]` | Resize souris/touch + auto-fit double-clic |
| `[RESPONSIVE]` | Bascule auto sur resize fenêtre |
| `[COLUMNS]` | Masquage/affichage colonnes + picker |
| `[STORAGE]` | saveState / loadState localStorage |
| `[SORT]` | Tri par colonne |
| `[CLIENTFILTER]` | Filtre/tri côté client (données statiques) |
| `[TOGGLE]` | Bascule mode table/cartes |
| `[REVEAL]` | Animation d'apparition des lignes |
| `[CSV]` | Export CSV |
| `[COPY]` | Copie clipboard |
| `[AJAX]` | loadLines — infinite scroll |
| `[AUTOINIT]` | Initialisation automatique |

---

## 7. localStorage — Format du state

Clé : `jx_table_state_{table_id}`

```json
{
  "v":       "5",
  "mode":    "table",
  "order":   ["id", "nom", "ville", "date_insc"],
  "filters": { "ville": { "values": ["Paris", "Lyon"] } },
  "widths":  { "id": 80, "nom": 200, "ville": 150 },
  "hidden":  ["telephone", "departement"]
}
```

**Versionnement** : Si `state.v !== JX_STATE_VERSION`, le state est purgé automatiquement. Incrémenter `JX_STATE_VERSION` dans le JS après tout changement structurel du format.

---

## 8. API AJAX

### 8.1 Requête envoyée par le JS

```
POST ajax_url
{ table_id: "mon_tableau", page: 1, query: "" }
```

- `page` : incrémenté automatiquement après chaque chargement
- `query` : valeur du moteur de recherche global
- Réponse vide `""` → fin du scroll (message "— Fin du tableau —")

### 8.2 Handler PHP minimal

```php
<?php
require_once 'JaxX_tables.php'; // ou via cfg.php + autoloader

$page     = intval($_POST['page'] ?? 1);
$per_page = 20;
$offset   = ($page - 1) * $per_page;

// ... requête BDD ...
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($rows)) { echo ''; exit; }

echo return_JaxX_lines([
    'columns'    => [ /* même structure que l'appelant */ ],
    'data'       => $rows,
    'expandable' => true,
    'animated'   => true,
]);
```

---

## 9. CSS — Principes

### 9.1 `JaxX_tables.css` — structurel uniquement

- Préfixe `jx_` sur toutes les classes (isolation totale)
- Aucune couleur ni ombre — tout le design dans le CSS de destination
- Variables dimensionnelles surchargeable sur `#mon_tableau` ou `.jx_table_wrapper` :

```css
.jx_table_wrapper {
    --jx-cell-height:      2.4em;
    --jx-card-width:       280px;
    --jx-card-gap:         1em;
    --jx-popover-width:    240px;
    --jx-table-max-height: 70vh;
    --jx-table-radius:     8px;
    --jx-card-img-height:  160px;
}
```

### 9.2 `JaxX_tables_demo.css` — thème dark de référence

Fournit un exemple complet de thème visuel. À adapter ou remplacer dans le projet cible.

### 9.3 Sections CSS (`JaxX_tables.css`)

| Section | Contenu |
|---|---|
| 1 | Variables dimensionnelles |
| 2 | Wrapper principal |
| 3 | Barre de contrôles |
| 4 | Toolbar (mode cartes) |
| 5 | Conteneur scroll + table |
| 5b | Images dans les cellules |
| 6 | En-tête (thead) |
| 7 | Lignes de données (tbody) |
| 8 | Boutons tri / filtre |
| 9 | Boutons de copie |
| 10 | Mode cartes |
| 11 | Popover de filtre |
| 12 | Empty state / loader |
| 13 | Animations |
| 14 | Redimensionnement des colonnes |
| 15 | Drag & drop |
| 16 | Masquage de colonnes |
| 17 | Aide (popover info) |
| 18 | Responsive |

---

## 10. Page de démo (`JaxX_tables_demo.php`)

| Section | Contenu |
|---|---|
| 1 — Tableau statique | Toutes les colonnes, expand, tri, filtres, export CSV |
| 2 — Tableau AJAX | Infinite scroll, colonnes masquables |
| 3 — Multi-instances | 2 tableaux sur la même page, isolation JS totale |
| 4 — Mode cartes | Images couverture, expand en carte |
| 5 — Référence API | Tableau de toutes les options (généré via JaxX_tables) |
| 6 — Guide d'intégration | Autoloader, statique, cartes, AJAX — exemples copiables |

---

## 11. Points de vigilance

| Sujet | Détail |
|---|---|
| **Resize vs Drag & Drop** | Conflit navigateur résolu par overlay `position:fixed z-index:99999` au mousedown. Ne pas revenir au pattern `setPointerCapture`. |
| **Double-clic auto-fit** | Détection via `Date.now()` dans `mousedown` (< 400ms). L'overlay n'est créé qu'au premier `mousemove` réel. |
| **localStorage corruption** | Cause historique : `loadState` ne repositionnait pas les colonnes structurelles (`jx_col_expand_header`, `jx_col_actions_header`) et ne restaurait pas la largeur de la table. Corrigé en v5. |
| **AJAX + colonnes masquées** | Après chaque `body.append(html)`, re-parcourir les `th.jx_col_hidden` et appliquer la classe sur les nouvelles `td`. |
| **Label colonne** | Lire avec `.contents().filter(nodeType === 3)` — `.text()` inclut le texte des icônes Material Symbols enfants (`filter_list`, etc.). |
| **table-layout: fixed** | Requis pour le contrôle des largeurs. `snapshotLayout()` verrouille toutes les colonnes + la largeur de la table avant tout resize. |
| **`Ctrl+Shift+R`** | Ne purge PAS le localStorage. Seul "Clear site data" le fait. Le versionnement `JX_STATE_VERSION` remplace ce besoin. |

---

## 12. Migration depuis `_modules/table/`

Les deux modules coexistent sans conflit (préfixes CSS distincts).

Pour migrer une page :
1. Remplacer `$required_modules['table']` par `$required_modules['JaxX_tables']`
2. Adapter `$array_table` selon la nouvelle API (§4.2)
3. Mettre à jour le handler AJAX pour retourner `return_JaxX_lines()` (HTML pur, pas JSON)
4. Tester : chargement, filtres, tri, mode cartes, redimensionnement

---

## 13. Historique

| Date | Auteur | Action |
|---|---|---|
| 01/04/2026 | IA | Réécriture complète — reflet de l'état implémenté v2.0-Beta |
| 31/03/2026 | IA | Plan d'implémentation initial v1.0 |




___________________________________________________________________

Archive ne pas supprimer 

Tu es JaxX, développeur PHP/JavaScript full-stack expérimenté. Tu travailles sur le projet MaBorneRecharge.fr.

Tu dois créer un nouveau module transversal : `_modules/JaxX_tables/`.

Ce module doit remplacer et améliorer l'actuel `_modules/table/`.

Objectif : permettre d'afficher des données tabulaires avec de nombreuses fonctionnalités avancées, et surtout, permettre d'afficher **plusieurs tableaux sur une même page** sans aucun conflit.

Le module doit être injectable en AJAX (rendu partiel du tableau).

Voici les spécifications complètes.

---


# Version travaillée avec IA
---

# Module JaxX_tables — Plan d'Implémentation

> **Version** : 1.0.0  
> **Créé** : 31/03/2026  
> **Statut** : 📝 EN COURS DE RÉDACTION — À VALIDER PAR JaxX  
> **Priorité** : Haute — Module transversal utilisé par toutes les pages de listing

---

## 1. Contexte & Objectif

### Situation actuelle

Le projet utilise actuellement le module `_modules/table/` qui est mature (JS 729 lignes, CSS 690 lignes, PHP 332 lignes) mais présente des limitations :

| Limitation actuelle | Impact |
|---|---|
| Un seul tableau par page (variables globales) | Impossible d'avoir 2 tableaux simultan sur une page |
| `ajax_url` global en JS non scopé | Conflits si multi-tableaux |
| Pas de mode "cartes" | Pas de responsive adapté mobile |
| Colonnes fixes (pas de déplacement/redimensionnement) | UX limitée |
| Structure JS monolithique | Difficile à maintenir |
| Pas de documentation technique normée | Non conforme `documentation_code.md` |
| Fichier PHP avec balise `<?` courte | Non conforme V2 (`<?php`) |

### Objectif

Créer le module `_modules/JaxX_tables/` — **évolution complète** du module `_modules/table/` — avec tous les fonctionnalités avancées listées ci-dessous, compatible multi-instances, injectable en AJAX, et conforme au Framework JaxX V2 ainsi qu'aux guidelines UI/UX.

---

## 2. Périmètre fonctionnel

### 2.1 Fonctionnalités obligatoires (MVP)

| # | Fonctionnalité | Priorité |
|---|---|---|
| F01 | Chargement des données en AJAX avec infinite scroll | 🔴 Critique |
| F02 | Multi-instances : plusieurs tableaux par page sans conflit | 🔴 Critique |
| F03 | Moteur de recherche dans le header du tableau | 🔴 Critique |
| F04 | Tri par colonne (ASC/DESC) | 🔴 Critique |
| F05 | Filtres par colonne (liste déroulante multi-sélection) | 🔴 Critique |
| F06 | Détail dépliable par ligne (slideToggle) | 🔴 Critique |
| F07 | Mode tableau / mode cartes (toggle) | 🟠 Important |
| F08 | Afficher/masquer colonnes (toggle) | 🟠 Important |
| F09 | Colonnes déplaçables (drag & drop) | 🔴 Critique (MVP) |
| F10 | Colonnes redimensionnables (resize handle) | 🟡 Utile |
| F11 | Sélection de lignes (shift-click pour multi-sélection) | 🟠 Important |
| F12 | Actions groupées sur la sélection | 🟠 Important |
| F13 | Export CSV | 🟠 Important |
| F14 | Responsive / overflow horizontal auto | 🔴 Critique |
| F15 | Injectable en AJAX (rendu partiel du tableau) | 🔴 Critique |
| F16 | Aucune dépendance externe (uniquement jQuery) | 🔴 Critique |
| F17 | Persistance de l'état (localStorage) | 🟠 Important |

### 2.2 Fonctionnalités du mode Cartes

En mode `display_cards` :
- Les lignes se transforment en cartes visuelles
- Les têtes de colonnes apparaissent comme labels dans la carte
- Les filtres et le moteur de recherche restent fonctionnels
- Possibilité de définir une "colonne titre" mise en avant dans la carte

---

## 3. Architecture du module

### 3.1 Structure de fichiers

```
_modules/JaxX_tables/
├── JaxX_tables.php          # Contrôleur PHP (fonctions, déclaration CSS/JS)
├── JaxX_tables.js           # Logique JS (classe JaxX_tables)
├── JaxX_tables.css          # Styles du module
├── ajax_JaxX_tables.php     # Endpoint AJAX (actions serveur)
├── demo.php                 # Page démo + tutoriel d'utilisation
└── assets/                  # Icônes et ressources graphiques
    ├── table_display.png
    ├── cards_display.png
    └── CSV_download.png
```

> **Note** : Les assets (`assets/`) seront copiés depuis `_modules/table/icons/` et complétés.

### 3.2 Principe de multi-instances (Clé de l'architecture)

Chaque tableau est identifié par un **`table_id`** unique. En PHP, le `$array_table['table_id']` génère un `data-table-id="mon_tableau"` sur le wrapper HTML.

En JS, au lieu de variables globales, on utilise une **Class ES5-compatible** ou un **objet instancié par tableau** :

```javascript
// Principe (simplifié)
var JaxX_table_instances = {};

function JaxX_table_init( table_id )
{
    JaxX_table_instances[table_id] = {
        is_loading: false,
        ajax_url: '',
        // ...
    };
    // ...
}

// Au chargement : initialiser chaque tableau trouvé
$('.jx_table_wrapper').each(function()
{
    var table_id = $(this).data('table-id');
    JaxX_table_init( table_id );
});
```

---

## 4. API PHP — Variables `$array_table`

### 4.1 Paramètres globaux du tableau

```php
<?php

/* ============================================================
   CHARGEMENT DU MODULE
   ============================================================ */
$required_modules['JaxX_tables'] = 'JaxX_tables';
require($root.'_modules/autoloaders/autoloader_modules.php');

/* ============================================================
   PARAMÈTRES GLOBAUX
   ============================================================ */
$array_table['table_id']        = 'mon_tableau';          // OBLIGATOIRE — Identifiant unique (snake_case)
$array_table['ajax_url']        = $rootURL.'pages/MaPage/MaPage_ajax.php'; // URL endpoint AJAX
$array_table['table_title']     = '<span class="nb_total"></span> Éléments';
$array_table['end_content']     = "Pas d'autres résultats";
$array_table['search']          = true;                   // Moteur de recherche
$array_table['csv']             = true;                   // Export CSV
$array_table['display_mode']    = 'display_table';        // 'display_table' | 'display_cards'
$array_table['limite_nbr']      = 30;                     // Nombre de lignes par chargement AJAX

/* ============================================================
   DÉFINITION DES COLONNES
   ============================================================ */
$array_table['columns']['nom_colonne']['column_title']      = 'Nom';
$array_table['columns']['nom_colonne']['column_title_tile'] = 'Nom complet du client';
$array_table['columns']['nom_colonne']['orderable']         = true;
$array_table['columns']['nom_colonne']['hideable']          = true;   // Masquable
$array_table['columns']['nom_colonne']['resizable']         = true;   // Redimensionnable
$array_table['columns']['nom_colonne']['card_title']        = true;   // Titre principal en mode carte
$array_table['columns']['nom_colonne']['width']             = '15em'; // Largeur initiale (optionnel)

// Filtres pour une colonne
$array_table['columns']['statut']['filterable'][] = ['label' => 'Actif',   'value' => 'actif'];
$array_table['columns']['statut']['filterable'][] = ['label' => 'Inactif', 'value' => 'inactif'];

/* ============================================================
   LIGNES (optionnel — si chargement PHP direct, sans AJAX)
   ============================================================ */
$array_table['lines'][ $id_ligne ]['ID']        = $id_ligne;
$array_table['lines'][ $id_ligne ]['nom_colonne'] = $valeur;
$array_table['lines'][ $id_ligne ]['details']   = '<p>Contenu HTML du détail dépliable</p>';

/* ============================================================
   ACTIONS GROUPÉES (optionnel)
   ============================================================ */
$array_table['global_actions_tools'] = '<button class="bt">Supprimer</button>';

/* ============================================================
   RENDU DU TABLEAU
   ============================================================ */
$content .= return_JaxX_table( $array_table );
```

### 4.2 Fonctions PHP exportées par `JaxX_tables.php`

| Fonction | Rôle |
|---|---|
| `return_JaxX_table( $array_table )` | Retourne le HTML complet du tableau (wrapper + header + lignes) |
| `return_JaxX_lines( $array_table )` | Retourne uniquement les lignes (pour les appels AJAX) |
| `get_JaxX_title_cells( $array_table )` | Retourne le HTML de la ligne d'en-tête (privée) |

---

## 5. API AJAX — Côté serveur

### 5.1 Format de la requête POST

```javascript
// Données envoyées depuis JS
datas.table_id             = 'mon_tableau';
datas.current_line_number  = 0;   // Nombre de lignes déjà affichées
datas.limite_nbr           = 30;
datas.search               = '';
datas.filters              = { statut: 'actif|_|inactif' };
datas.order                = { ref: 'nom_colonne', type: 'ASC' };
```

### 5.2 Format de la réponse JSON attendue

```php
<?php
// Dans MaPage_ajax.php
if( $_POST['action'] == 'load_jx_lines' )
{
    $datas = $_POST['datas'];

    // ... Logique SQL basée sur $datas ...

    $array_table['lines'] = $lines_depuis_bdd;
    // Ou indiquer la fin :
    // $array_table['lines'] = [];

    $retour['table_lines'] = return_JaxX_lines( $array_table );
    $retour['total']       = $total_count;
    $retour['end']         = ($rows_count < $datas['limite_nbr']); // true = plus de données
}
```

---

## 6. Architecture JS — Class JaxX_table

### 6.1 Principe de la class (ES5 — compatible jQuery)

```javascript
/* ================================================================
   CLASSE : JaxX_table
   Gère une instance unique d'un tableau
   ================================================================ */
function JaxX_table( wrapper )
{
    this.$wrapper       = $(wrapper);
    this.table_id       = this.$wrapper.data('table-id');
    this.ajax_url       = this.$wrapper.data('ajax-url');
    this.limite_nbr     = this.$wrapper.data('limite-nbr') || 30;
    this.is_loading     = false;

    this.init();
}

JaxX_table.prototype.init = function()
{
    this.bind_events();
    this.infinite_loader();
};

JaxX_table.prototype.load_lines = function() { /* ... */ };
JaxX_table.prototype.infinite_loader = function() { /* ... */ };
JaxX_table.prototype.new_query = function() { /* ... */ };
JaxX_table.prototype.toggle_line_details = function() { /* ... */ };
JaxX_table.prototype.toggle_display_mode = function() { /* ... */ };  // table/cartes
JaxX_table.prototype.toggle_column_visibility = function() { /* ... */ };
JaxX_table.prototype.drag_column = function() { /* ... */ };
JaxX_table.prototype.resize_column = function() { /* ... */ };
JaxX_table.prototype.open_filter_list = function() { /* ... */ };
JaxX_table.prototype.click_filter = function() { /* ... */ };
JaxX_table.prototype.select_lines = function() { /* ... */ };
JaxX_table.prototype.export_csv = function() { /* ... */ };

/* ================================================================
   INITIALISATION GLOBALE AU CHARGEMENT DE LA PAGE
   ================================================================ */
$(function()
{
    $('.jx_table_wrapper').each(function()
    {
        new JaxX_table(this);
    });
});
```

### 6.2 Fonctions JS — Récapitulatif

| Méthode | Rôle |
|---|---|
| `init()` | Initialise les events + lance le premier chargement |
| `load_lines()` | Appel AJAX pour charger un batch de lignes |
| `infinite_loader()` | Surveille le scroll et déclenche `load_lines()` si besoin |
| `new_query()` | Vide le tableau et relance depuis zéro |
| `toggle_line_details()` | Déplie/replie le détail d'une ligne |
| `toggle_display_mode()` | Bascule table ↔ cartes |
| `toggle_column_visibility()` | Affiche/masque une colonne |
| `drag_column()` | Déplace une colonne par drag & drop |
| `resize_column()` | Redimensionne une colonne |
| `open_filter_list()` | Ouvre le panneau de filtres d'une colonne |
| `click_filter()` | Active/désactive un filtre |
| `change_criters()` | Compile les filtres et déclenche `new_query()` |
| `select_lines()` | Gère la sélection simple + shift-clic |
| `select_all_lines()` | Sélectionne / désélectionne toutes les lignes |
| `open_global_action_tools()` | Affiche/masque la barre d'actions groupées |
| `export_csv()` | Déclenche l'export CSV via AJAX |

---

## 7. Structure HTML générée

### 7.1 Wrapper du tableau

```html
<div class="jx_table_wrapper display_table"
     data-table-id="mon_tableau"
     data-ajax-url="/pages/MaPage/MaPage_ajax.php"
     data-limite-nbr="30">

    <div class="jx_table">

        <!-- Titre + Searchbox + Outils -->
        <h2 class="jx_table_title">
            <div class="jx_searchbox">...</div>
            <span class="jx_nb_total"></span> Éléments
            <div class="jx_action_bar">
                <div class="jx_bt jx_bt_display_table" title="Mode tableau"></div>
                <div class="jx_bt jx_bt_display_cards" title="Mode cartes"></div>
                <div class="jx_bt jx_bt_toggle_columns" title="Colonnes visibles"></div>
                <div class="jx_bt jx_csv_bt" title="Exporter en CSV"></div>
            </div>
        </h2>

        <!-- Actions groupées (masquées par défaut) -->
        <div class="jx_global_actions_wrapper" style="display:none;">
            Appliquer à la sélection : ...
        </div>

        <!-- Panneau de colonnes visibles (masqué par défaut) -->
        <div class="jx_columns_panel" style="display:none;">...</div>

        <!-- En-tête colonnes -->
        <div class="jx_line jx_head_line">
            <div class="jx_cells_wrapper">
                <div class="jx_cell jx_open_arrow"></div>
                <div class="jx_cell jx_select"></div>
                <div class="jx_cell nom_colonne" ref="nom_colonne">
                    <div class="jx_label">Nom</div>
                    <div class="jx_order_bt_wrapper">
                        <div class="jx_order_bt jx_bt_asc">△</div>
                        <div class="jx_order_bt jx_bt_desc">▽</div>
                    </div>
                    <div class="jx_filterable_wrapper" ref="nom_colonne">
                        <div class="jx_filter_trigger"></div>
                        <div class="jx_filters_wrapper" style="display:none;">...</div>
                    </div>
                    <div class="jx_resize_handle"></div>
                </div>
                <!-- ... autres colonnes ... -->
            </div>
        </div>

        <!-- Contenu -->
        <div class="jx_table_datas_content_wrapper">
            <div class="jx_table_datas_content">

                <!-- Ligne de données -->
                <div class="jx_line" id="123">
                    <div class="jx_cells_wrapper">
                        <div class="jx_cell jx_open_arrow"></div>
                        <div class="jx_cell jx_select"></div>
                        <div class="jx_cell nom_colonne">
                            <div class="jx_cell_title">Nom :</div>
                            <div class="jx_cell_data">Dupont</div>
                        </div>
                    </div>
                    <!-- Détail dépliable -->
                    <div class="jx_line_details" style="display:none;">...</div>
                </div>

                <!-- Ligne de fin -->
                <div class="jx_line jx_end">Pas d'autres résultats</div>

            </div>
        </div>

    </div>
</div>
```

> **Note** : Tous les noms de classes sont préfixés `jx_` pour éviter les conflits avec l'ancien module `table` qui peut coexister sur le projet.

---

## 8. CSS — Principes de design

### 8.1 Règles générales

- Préfixe `jx_` sur toutes les classes pour isolation totale
- Variables CSS du thème (`theme.css`) utilisées pour couleurs, border-radius, transitions
- Mode `display_table` et `display_cards` gérés via classes CSS sur le wrapper
- Sticky header de tableau (`jx_head_line`) collé en haut du `jx_table_datas_content_wrapper`
- Overflow horizontal automatique via `overflow-x: auto` sur le wrapper
- La hauteur du tableau s'adapte à `calc(100vh - Xrem)` configurable

### 8.2 Mode cartes

```css
/* En mode cartes */
.jx_table_wrapper.display_cards .jx_head_line { display: none; }
.jx_table_wrapper.display_cards .jx_line { display: inline-block; width: 280px; /* ... */ }
.jx_table_wrapper.display_cards .jx_cell { display: block; width: 100%; height: auto; }
.jx_table_wrapper.display_cards .jx_cell_title { display: inline-block; /* ... */ }
```

### 8.3 Variables spécifiques au module (dans `JaxX_tables.css`)

```css
.jx_table_wrapper
{
    --jx_cell_height: 2.4em;
    --jx_card_width: 280px;
    --jx_card_gap: 1em;
}
```

---

## 9. Intégration avec le Framework JaxX V2

### 9.1 Chargement via l'autoloader

Dans `cfg.php` ou dans le `_brain.php` de la page :

```php
<?php
$required_modules['JaxX_tables'] = 'JaxX_tables';
```

L'autoloader se charge d'injecter le CSS dans le `<head>` et le JS avant `</body>`.

### 9.2 Injection dans la vue

Dans `MaPage_brain.php` :
```php
<?php
// Requête SQL préalable si nécessaire pour les colonnes
// (les lignes sont chargées en AJAX)
$array_table['table_id']   = 'leads_table';
$array_table['ajax_url']   = $rootURL.'pages/MaPage/MaPage_ajax.php';
// ... définir les colonnes ...
```

Dans `MaPage_vue.php` :
```php
$content .= return_JaxX_table( $array_table );
```

Dans `MaPage_ajax.php` :
```php
<?php
require ('../../_Cfg/cfg.php');
$required_modules['JaxX_tables'] = 'JaxX_tables';
require ($root.'_modules/autoloaders/autoloader_modules.php');

if( $_POST['action'] == 'load_jx_lines' )
{
    // Logique de chargement des lignes
    $retour['table_lines'] = return_JaxX_lines( $array_table );
    $retour['total']       = $total;
    $retour['end']         = $is_end;
}
echo json_encode( $retour );
```

### 9.3 Injection AJAX (tableau chargé dynamiquement dans une page)

Si le tableau lui-même est injecté via AJAX dans un conteneur :
1. La réponse AJAX retourne le HTML de `return_JaxX_table( $array_table )`
2. Le JS principal injecte ce HTML dans le DOM
3. Un événement custom `jx_table_injected` est déclenché
4. Le module JaxX_tables écoute cet événement pour ré-initialiser les instances

---

## 10. Migration depuis `_modules/table/`

> ⚠️ Le module `_modules/table/` **ne sera pas supprimé**. Les deux modules coexistent.  
> La migration est progressive, page par page.

### Pages utilisant actuellement `_modules/table/`

À identifier via grep sur le projet :

```bash
grep -r "required_modules\['table'\]" _Dev/pages/
```

Pour chaque page migrée :
1. Remplacer `$required_modules['table']` par `$required_modules['JaxX_tables']`
2. Ajouter `$array_table['table_id']` unique
3. Ajouter `$array_table['ajax_url']` pointant vers le bon endpoint
4. Vérifier que l'action AJAX `load_jx_lines` est bien gérée dans `*_ajax.php`
5. Tester chargement, filtres, tri, mode cartes

---

## 11. Fichier démo `demo.php`

La page de démonstration doit servir de **tutoriel d'utilisation** complet :

### Structure de la démo

```
demo.php
├── Section 1 : Tableau basique (colonnes simples, AJAX)
├── Section 2 : Tableau avec filtres par colonne
├── Section 3 : Tableau avec mode cartes activé
├── Section 4 : Deux tableaux simultanés sur la même page
├── Section 5 : Tableau injecté en AJAX dans un conteneur
└── Section 6 : Référence complète des options $array_table
```

---

## 12. Documentation technique (conforme `documentation_code.md`)

Chaque fichier du module devra contenir l'en-tête normé :

```php
/**
 * ================================================================
 * FICHIER : JaxX_tables.php
 * EMPLACEMENT : _modules/JaxX_tables/JaxX_tables.php
 * SHORT_DESC : Module de tableaux avancés multi-instances pour JaxX V2
 * DESCRIPTION : Génère des tableaux HTML interactifs avec chargement AJAX
 *               en infinite scroll, multi-instances, mode table/cartes,
 *               filtres, tri, colonnes déplaçables et redimensionnables.
 *
 * SOMMAIRE :
 *   - [return_JaxX_table]      : Génère le HTML complet du tableau
 *   - [return_JaxX_lines]      : Génère uniquement les lignes (AJAX)
 *   - [get_JaxX_title_cells]   : Génère la ligne d'en-tête des colonnes
 *
 * DEPENDANCES :
 *   - jQuery (global)
 *   - _theme/theme.css (variables CSS)
 *   - JaxX_tables.js
 *   - JaxX_tables.css
 *
 * VARIABLES :
 *   - $array_table : Tableau de configuration du tableau (voir demo.php)
 *
 * MODIFICATIONS :
 *   - 31/03/2026 01:00 : Création initiale du module
 *
 * ================================================================
 */
```

---

## 13. Plan d'exécution — Étapes

### Phase 1 — Fondations (PHP + HTML)
- [ ] **1.1** Mettre à jour `JaxX_tables.php` : déclarer CSS/JS, fonctions PHP (`return_JaxX_table`, `return_JaxX_lines`, `get_JaxX_title_cells`)
- [ ] **1.2** Créer la structure HTML prefixée `jx_` avec support `data-table-id`, `data-ajax-url`, `data-limite-nbr`
- [ ] **1.3** Gérer les paramètres des colonnes (orderable, hideable, resizable, card_title, width)
- [ ] **1.4** Créer `demo.php` avec jeu de données fictif (tableaux de test, sans BDD)

### Phase 2 — CSS (styles de base)
- [ ] **2.1** Écrire `JaxX_tables.css` avec toutes les classes `jx_`
- [ ] **2.2** Implémenter le mode `display_table` (base)
- [ ] **2.3** Implémenter le mode `display_cards` (responsive cartes)
- [ ] **2.4** Styles : hover, sélection, sticky header, overflow horizontal

### Phase 3 — JS Core (infinite scroll + AJAX)
- [ ] **3.1** Créer la Class `JaxX_table` en JS
- [ ] **3.2** Implémenter `load_lines()` + `infinite_loader()` + `new_query()`
- [ ] **3.3** Initialisation automatique de toutes les instances `.jx_table_wrapper`
- [ ] **3.4** Mise à jour `ajax_JaxX_tables.php` avec action `load_jx_lines`

### Phase 4 — JS Interactivité
- [ ] **4.1** Tri par colonne (ASC/DESC)
- [ ] **4.2** Filtres par colonne (panneau flottant multi-sélection)
- [ ] **4.3** Moteur de recherche (debounce 300ms)
- [ ] **4.4** Détail dépliable par ligne (slideToggle)
- [ ] **4.5** Sélection de lignes (simple + shift-clic)
- [ ] **4.6** Actions groupées (barre conditionnelle)

### Phase 5 — JS Avancé
- [ ] **5.1** Toggle MODE tableau/cartes
- [ ] **5.2** Afficher/masquer colonnes
- [ ] **5.3** Colonnes déplaçables (drag & drop natif HTML5 ou jQuery UI minimaliste)
- [ ] **5.4** Colonnes redimensionnables (resize handle JS pur)
- [ ] **5.5** Export CSV (via AJAX → génération PHP)

### Phase 6 — Injection AJAX & Multi-instances
- [ ] **6.1** Support de l'injection AJAX du tableau (événement `jx_table_injected`)
- [ ] **6.2** Tester 2 tableaux simultanés sur la même page (démo)
- [ ] **6.3** Tester tableau injecté via AJAX dans un conteneur

### Phase 7 — Documentation & Conformité
- [ ] **7.1** Ajouter les en-têtes normés (`documentation_code.md`) dans tous les fichiers
- [ ] **7.2** Compléter `demo.php` avec tutoriel d'utilisation complet
- [ ] **7.3** Mettre à jour `CHANGELOG.md`
- [ ] **7.4** Mettre à jour `implementation_plan_global.md` si existant

---

## 14. Points de vigilance

| Risque | Mitigation |
|---|---|
| Conflit de noms de classes avec l'ancien module `table` | Toutes les classes préfixées `jx_` |
| Variables globales JS en conflit | Class ES5 + scope privé par instance |
| Drag & drop colonnes : compatibilité mobile | Utiliser Pointer Events API (touch + mouse) |
| Resize colonnes : `min-width` à respecter | Bloquer resize en dessous de 50px |
| Injection AJAX : événements jQuery non rebindés | Observer `jx_table_injected` + reinit |
| Export CSV : données volumineuses | Action AJAX dédiée avec streaming ou limite |
| Pas de dépendance externe (jQuery uniquement) | Drag & drop implémenté en pur jQuery sans jquery-ui |

---

## 15. Questions ouvertes — À valider par JaxX

> ⚠️ **À VALIDER PAR JaxX avant mise en œuvre**

1. [OK] **table_id** : Support hybride. Manuel via `$array_table['table_id']` pour le ciblage précis, ou auto-généré si vide pour garantir l'unicité sans effort.

2. [OK]**Ajax URL** : Via `data-ajax-url` sur le wrapper HTML (méthode recommandée pour l'autonomie du module).

## 📋 Structure de la Démo interactive (JaxX_tables_demo.php)
- **Section 1 : Statique** -> Validation HTML/CSS/JS de base.
- **Section 2 : AJAX** -> Validation du pipeline `ajax_url` et infinite scroll.
- **Section 3 : Multi-instance** -> Validation de la non-interférence entre tableaux.
- **Section 4 : Mode Cartes** -> Validation du layout responsive par défaut.
- **Section 5 : Variables / Options** -> Référence des options (API).
- **Section 6 : Documentation Tuto** -> Référence des options (API).

## ⚡ Phase 5 : Fonctionnalités avancées & Filtres complexes
- [OK] **Filtrage par plage de dates** :
    - [OK] Détection des colonnes `type => 'date'`.
    - [OK] Interface "Du [date] Au [date]" dans l'en-tête de colonne.
    - [OK]Transmission des paramètres `date_min` / `date_max` via AJAX.
- [OK] **Drag & Drop des colonnes** :
    - [OK]Réorganisation visuelle des `<th>`.
    - [OK]Persistance de l'ordre dans le `localStorage`.
- [OK] **Exportation** : Boutons d'export CSV/PDF (Structure uniquement).

4. **Persistance localStorage** : Activée. Le module stockera l'état des filtres, l'ordre des colonnes et le mode d'affichage pour une expérience utilisateur premium.

5. **Coexistence** : Migration progressive. Les deux modules (`table` et `JaxX_tables`) peuvent cohabiter sur le même projet.

6. **Action AJAX** : Nommée `load_jx_lines` pour éviter toute confusion avec l'ancien système.

7. **Filtres par tête de colonne** : Implémentés via une construction dynamique en jQuery après récupération des données uniques par AJAX (économie de ressources au chargement initial).

---

## Historique

| Date | Auteur | Action |
|---|---|---|
| 31/03/2026 01:00 | IA | Création du plan d'implémentation v1.0 |





___

# **En cours de rédaction WIP Version originale ne pas supprimer**


# Module JaxX_tables

Le module est une évolution du module `_modules/table`.
Le module doit respecter les conventions du Framework `__PREPA_FRAMEWORK_V2.md`.
Le module doit respecter les conventions de  `documentation_code.md`.
Le module doit respecter les conventions de  `__UI_UX_Guidelines_prompt`.


## Les Tableaux : 
Les tableaux doivent permettre un affichage sur mobile en mode "carte" ou "liste" selon le contenu et le nombre de colonnes selectionnable via un bouton.
Utiliser le module de tableaux `_modules/JaxX_tables/`.

Les tableaux de manière générale doivent être : 
- [OK] ce module ne doit charger aucune dépendance externe, la seul librairie à utiliser est jquery [OK]
- [OK] les données sont chargés en ajax en infinite scroll [OK]
- [OK] le tableau doit disposer de filtres pertinents [OK]
- [OK] le tableau doit disposer de filtres par colonne [OK]
- [OK] le tableau doit disposer de tri par colonne [OK]
- [OK] le tableau doit disposer d'un moteur de recherche dans le header du tableau [OK]
- [OK] le tableau doit disposer d'un bouton pour afficher/masquer les colonnes [OK]
- [OK] le tableau  doit faire au maximum la taille de la fenêtre du navigateur avec un système d'overflow auto horizontal pour l'ensemble du tableau [OK]
- [OK] chaque ligne doit pouvoir contenir du contenu annexe via un slidetoggle [OK]
- [OK] chaque colonne doit pouvoir être déplaçable et redimensionnable et masquable [OK]
- [OK] le tableau doit être responsive et s'adapter à la taille de l'écran [OK]
- [OK] le tableau doit disposer d'un bouton permettant de passer d'un mode tableau à un mode cartes:  [OK]
  - [OK] en mode cartes les lignes se transforment en cartes et les labels (têtes de colonnes) apparaissent dans la carte
  - [OK] les filtres restent disponibles et fonctionnels [OK]
  - [OK] le moteur de recherche reste disponible et foncitonnel [OK]


## Fonctionnement du module.

Le module doit pouvoir être appelé via une variable $array_table ou facile à charger dans le workflow du Framework `__PREPA_FRAMEWORK_V2.md`.

Il doit être possible de charger plusieurs tableaux sur une seule page sans conflit entre les tableaux. [OK]

Les tableaux doivent pouvoir être injectables en Ajax. [OK]


## Structure du module

Le module doit être composé des fichiers suivants :
- [OK] `JaxX_tables.php` : fichier principal du module
- [OK] `JaxX_tables.js` : fichier javascript du module
- [OK] `JaxX_tables.css` : fichier css du module
- [OK] `JaxX_tables_demo.php`[.css,.js] : fichier de démonstration du module + tutoriel d'utilisation.




## Fonctionnalités

- [OK] chargement des données en ajax en infinite scroll
- [OK] filtres pertinents
- [OK] filtres par colonne
- [OK] tri par colonne
- [OK] moteur de recherche dans le header du tableau
- [OK] bouton pour afficher/masquer les colonnes
- [OK] chaque ligne doit pouvoir contenir du contenu annexe via un slidetoggle 
- [OK] chaque colonne doit pouvoir être déplaçable et redimensionnable et masquable ( via un bouton toggle )
- [OK] le tableau doit être responsive et s'adapter à la taille de l'écran 
- [OK] le tableau doit disposer d'un bouton permettant de passer d'un mode tableau à un mode cartes: 
  - [OK] en mode cartes les lignes se transforment en cartes et les labels (têtes de colonnes) apparaissent dans la carte
  - [OK] les filtres restent disponibles et fonctionnels
  - [OK] le moteur de recherche reste disponible et foncitonnel
