# JaxX_tables (v2.0.0-Beta)

**JaxX_tables** est un moteur de rendu de tableaux PHP/JS multi-instances, responsive et haute performance. Conçu pour remplacer les anciens systèmes de listing, il apporte une expérience utilisateur moderne avec une persistance d'état intelligente.

---

### ⚖️ Licence & Crédits
**JaxX_tables** est distribué sous la licence **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**.

> [!IMPORTANT]
> **Utilisation autorisée pour projets non-commerciaux.**
> Vous devez impérativement conserver le nom de l'auteur original **JaxX - AnunaQi.com** dans le code source (fichiers PHP, JS et CSS).
> Interdiction de vente ou d'utilisation lucrative sans accord préalable.

**Liens utiles :**
*   **Site Web** : [AnunaQi.com](https://www.AnunaQi.com)
*   **Dépôt GitHub** : [JaxX_tables](https://github.com/JaxProd/JaxX_tables)

---

### ✨ Fonctionnalités
* **Multi-instances** : Plusieurs tableaux indépendants sur une même page sans conflit JS.
* **Modes d'affichage** : Bascule entre mode **Tableau** et mode **Cartes** (Cards).
* **Interactivité** : Drag & Drop des colonnes, redimensionnement manuel et Auto-fit (double-clic).
* **Données** : Supporte le mode statique (Array PHP) et le mode AJAX (Infinite Scroll).
* **ClipBoard** : Copie de données dans le presse-papier : donnée individuelle ou ligne sous forme tableur.
* **Filtres & Tri** : Recherche globale (debounce 300ms), filtres par cases à cocher et plages de dates. En mode AJAX, tri/filtres/recherche s'exécutent **côté serveur** sur l'ensemble des données.
* **Persistance** : Sauvegarde auto dans le `localStorage` (ordre, largeur, colonnes masquées).
* **Export & Copie** : Export CSV et API de copie dans le presse-papier intégrée.

---

### ⚙️ Variables de configuration (`$array_table`)

| Variable | Type | Description |
| :--- | :--- | :--- |
| `table_id` | string | ID unique de l'instance (clé localStorage). |
| `ajax_url` | string | URL du handler AJAX. Si vide : mode statique. |
| `display_mode`| string | `"table"` ou `"cards"`. |
| `columns` | array | Définition des colonnes (label, sortable, filterable, type). |
| `data` | array | Données à afficher (obligatoire en mode statique). |
| `resizable` | bool | Colonnes redimensionnables (défaut: `true`). |
| `responsive` | bool | Bascule auto en mode cartes < 768px. |
| `expandable` | bool | Active les lignes déployables (`jx_expand_content`). |

---

### 🚀 Implémentation : Guide Technique

#### 1. Initialisation via Autoloader
Ajoutez le module dans votre `cfg.php` ou `_brain.php` pour charger automatiquement les ressources (JS/CSS/PHP) :

```php
$required_modules['JaxX_tables'] = 'JaxX_tables';
require($root . '_modules/autoloaders/autoloader_modules.php');
```

#### 2. Utilisation en mode Statique (PHP)
Idéal pour les listes dont les données sont déjà chargées en mémoire.

```php
$config = [
    'table_id' => 'table_users',
    'columns' => [
        'nom'    => ['label' => 'Utilisateur', 'sortable' => true],
        'ville'  => ['label' => 'Localisation', 'filterable' => true],
        'date'   => ['label' => 'Inscription', 'type' => 'date']
    ],
    'data' => [
        ['id' => 42, 'nom' => 'JaxX', 'ville' => 'Lyon', 'date' => '2026-03-31'],
        ['id' => 43, 'nom' => 'Anuna', 'ville' => 'Paris', 'date' => '2026-04-01'],
    ]
];

echo return_JaxX_table($config);
```

#### 3. Utilisation en mode AJAX (Infinite Scroll)
Côté Vue (`index.php`) :

```php
echo return_JaxX_table([
    'table_id' => 'flux_activite',
    'ajax_url' => 'mon_handler_ajax.php',
    'columns'  => [ /* Identiques au handler */ ]
]);
```

Côté Handler (`mon_handler_ajax.php`) :
Le serveur reçoit les paramètres de tri, filtres et recherche. Il doit appliquer ces critères sur l'ensemble des données et retourner la page demandée via `return_JaxX_lines()`.

```php
$page     = intval($_POST['page'] ?? 1);
$query    = trim($_POST['query'] ?? '');      // Recherche globale
$sort_col = trim($_POST['sort_col'] ?? '');    // Colonne de tri
$sort_dir = trim($_POST['sort_dir'] ?? '');    // "asc" ou "desc"
$filters  = json_decode($_POST['filters'] ?? '{}', true) ?: [];
$action   = trim($_POST['action'] ?? '');
$per_page = 20;

// 1. Appliquer recherche globale ($query) sur toutes les colonnes
// 2. Appliquer filtres par colonne ($filters)
//    - checked: array de valeurs cochées
//    - dateFrom / dateTo: plage de dates
// 3. Appliquer tri ($sort_col + $sort_dir)

// ── Action spéciale : valeurs distinctes pour popover filtre ──
if ($action === 'filter_values')
{
    $filter_col = trim($_POST['filter_col'] ?? '');
    // Compter les occurrences distinctes dans les données filtrées
    // Pour les dates : regrouper par jour (Y-m-d)
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($valueCounts, JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Rendu paginé ──
$offset = ($page - 1) * $per_page;
// $rows = SELECT ... WHERE (filtres) ORDER BY $sort_col $sort_dir LIMIT $per_page OFFSET $offset

if (empty($rows)) {
    echo ''; // Stop le scroll JS
    exit;
}

echo return_JaxX_lines([
    'data'       => $rows,
    'columns'    => [ /* Structure de colonnes */ ],
    'expandable' => true
]);
```

#### 4. Données Spéciales
Pour activer le déploiement d'une ligne, ajoutez la clé `jx_expand_content` dans vos données :

```php
'data' => [
    [
        'nom' => 'Jean Dupont',
        'jx_expand_content' => '<div class="p-3">Détails supplémentaires en HTML...</div>'
    ]
]
```

### 🎨 Personnalisation Graphique
Le module utilise des variables CSS isolées. Vous pouvez les surcharger dans votre fichier CSS local :

```css
#table_users {
    --jx-cell-height: 2.5em;
    --jx-table-max-height: 75vh;
    --jx-card-width: 300px;
    --jx-table-radius: 8px;
}
```
---

### 🌟 Fonctionnalités Premium (V2.0-Beta - 01/04/2026)

#### 1. Copie Intelligente & Binaire (`[COPY]`)
*   **Cellule Visuelle** : Sur les colonnes `jx_col_visuel`, le clic sur l'icône de copie ne copie plus le lien, mais le **binaire physique** (Blob PNG) via une conversion Canvas dynamique. Collage direct possible dans Discord, Photoshop, etc.
*   **Copie de Ligne "Auto-contenue"** :
    *   **Format Office (Excel/Word)** : Génère un tableau HTML riche avec images **embarquées en Base64**. L'image est stockée dans le document, pas de lien mort possible.
    *   **Format Chat (WhatsApp/FB)** : Génère un texte structuré lisible `Label : Valeur | Label : Valeur`.

#### 2. Galerie de Démonstration (Section 4)
Le dataset de démonstration a été rafraîchi avec des visuels HD thématiques (Cyberpunk, Cinéma, Art) pour tester les rendus `jx_col_visuel` et les performances de copie binaire.

---

Dernière mise à jour : 01/04/2026 — Documentation Technique JaxX_tables v2.0.0-Beta par IA.
