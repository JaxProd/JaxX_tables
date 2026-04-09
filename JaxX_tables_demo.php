<?php
/**
 * ================================================================
 * FICHIER : JaxX_tables_demo.php
 * EMPLACEMENT : /_modules/JaxX_tables/JaxX_tables_demo.php
 * SHORT_DESC : Page de démonstration interactive de JaxX_tables.
 * DESCRIPTION : Banc d'essai complet structuré en 5 sections pour
 * valider chaque aspect du module (Statique, AJAX, Multi, Cartes, API).
 *
 * SOMMAIRE : [CTRL+D]
 *   - [DATA_S1]  : Section 1 - Tableau Statique
 *   - [DATA_S2]  : Section 2 - Tableau AJAX
 *   - [DATA_S3]  : Section 3 - Multi-instances
 *   - [DATA_S4]  : Section 4 - Mode Cartes par défaut
 *   - [DATA_S5]  : Section 5 - Référence des options (Documentation API)
 *   - [DATA_S6]  : Section 6 - Guide d'intégration (autoloader, statique, cartes, AJAX)
 *   - [HTML]     : Structure de la page de démo
 *
 * DEPENDANCES :
 *   - JaxX_tables.php : Moteur de rendu (V2)
 *   - jQuery : Version 3.7+
 *
 * MODIFICATIONS :
 *   - 01/04/2026 : [IA] S5 : ajout resizable, responsive, data[n][*]. S6 : autoloader, responsive, refonte flux AJAX.
 *   - 31/03/2026 04:00 : [IA] Correction structure HTML (sortie du echo global).
 *   - 31/03/2026 03:00 : [IA] Restructuration complète en 5 sections.
 *
 * ================================================================
 */

require_once 'JaxX_tables.php';

/**
 * [CTRL+D] [DATA_S1] : TABLEAU STATIQUE
 */
$array_static = [
	'table_id'   => 'table_static',
	'expandable' => true,
	'responsive' => true,
	'export_csv' => true,
	'columns'    => [
		'id'          => ['label' => 'ID', 'sortable' => true],
		'nom'         => ['label' => 'Utilisateur', 'sortable' => true],
		'email'       => ['label' => 'Email'],
		'telephone'   => ['label' => 'Téléphone'],
		'ville'       => ['label' => 'Ville', 'sortable' => true, 'filterable' => true],
		'departement' => ['label' => 'Département', 'sortable' => true, 'filterable' => true],
		'role'        => ['label' => 'Rôle', 'sortable' => true, 'filterable' => true],
		'statut'      => ['label' => 'Statut', 'sortable' => true, 'filterable' => true],
		'date_insc'   => ['label' => 'Inscription', 'sortable' => true, 'type' => 'date', 'filterable' => true],
		'derniere_co' => ['label' => 'Dernière connexion', 'sortable' => true, 'type' => 'date']
	],
	'data' => [
		['id' => 1,  'nom' => 'Admin Principal',   'email' => 'admin@borne.fr',      'telephone' => '06 12 34 56 78', 'ville' => 'Paris',      'departement' => '75', 'role' => 'Admin',       'statut' => 'Actif',     'date_insc' => '2023-01-15', 'derniere_co' => '2026-03-30', 'jx_expand_content' => 'Accès complet au système.'],
		['id' => 2,  'nom' => 'Technicien 01',     'email' => 'tech01@borne.fr',     'telephone' => '06 23 45 67 89', 'ville' => 'Lyon',       'departement' => '69', 'role' => 'Technicien',  'statut' => 'Actif',     'date_insc' => '2023-06-20', 'derniere_co' => '2026-03-29', 'jx_expand_content' => 'Accès aux bornes uniquement.'],
		['id' => 3,  'nom' => 'Gestionnaire RH',   'email' => 'rh@borne.fr',         'telephone' => '06 34 56 78 90', 'ville' => 'Lille',      'departement' => '59', 'role' => 'Manager',     'statut' => 'Actif',     'date_insc' => '2024-02-10', 'derniere_co' => '2026-03-28', 'jx_expand_content' => 'Accès RH et reporting.','injected_classes' => ['rouge', 'faded'] ],
		['id' => 4,  'nom' => 'Sophie Martin',     'email' => 'sophie.m@borne.fr',   'telephone' => '06 45 67 89 01', 'ville' => 'Marseille',  'departement' => '13', 'role' => 'Commercial',  'statut' => 'Actif',     'date_insc' => '2023-03-12', 'derniere_co' => '2026-03-25','injected_classes' => ['rouge'] ],
		['id' => 5,  'nom' => 'Julien Moreau',     'email' => 'julien.m@borne.fr',   'telephone' => '06 56 78 90 12', 'ville' => 'Bordeaux',   'departement' => '33', 'role' => 'Développeur', 'statut' => 'Actif',     'date_insc' => '2023-04-25', 'derniere_co' => '2026-03-30', 'jx_expand_content' => 'Développeur backend PHP.','injected_classes' => [ 'faded'] ],
		['id' => 6,  'nom' => 'Claire Dupont',     'email' => 'claire.d@borne.fr',   'telephone' => '06 67 89 01 23', 'ville' => 'Paris',      'departement' => '75', 'role' => 'Admin',       'statut' => 'Actif',     'date_insc' => '2023-05-08', 'derniere_co' => '2026-03-30', 'jx_expand_content' => 'Directrice générale.'],
		['id' => 7,  'nom' => 'Thomas Bernard',    'email' => 'thomas.b@borne.fr',   'telephone' => '06 78 90 12 34', 'ville' => 'Nantes',     'departement' => '44', 'role' => 'Technicien',  'statut' => 'Inactif',   'date_insc' => '2023-07-14', 'derniere_co' => '2025-12-15'],
		['id' => 8,  'nom' => 'Émilie Roux',       'email' => 'emilie.r@borne.fr',   'telephone' => '06 89 01 23 45', 'ville' => 'Toulouse',   'departement' => '31', 'role' => 'Support',     'statut' => 'Actif',     'date_insc' => '2023-08-30', 'derniere_co' => '2026-03-28', 'jx_expand_content' => 'Support client niveau 2.'],
		['id' => 9,  'nom' => 'Alexandre Leroy',   'email' => 'alex.l@borne.fr',     'telephone' => '06 90 12 34 56', 'ville' => 'Lyon',       'departement' => '69', 'role' => 'Analyste',    'statut' => 'Actif',     'date_insc' => '2023-09-15', 'derniere_co' => '2026-03-27', 'jx_expand_content' => 'Analyste données et BI.'],
		['id' => 10, 'nom' => 'Marie Petit',       'email' => 'marie.p@borne.fr',    'telephone' => '06 01 23 45 67', 'ville' => 'Strasbourg', 'departement' => '67', 'role' => 'Comptable',   'statut' => 'Actif',     'date_insc' => '2023-10-22', 'derniere_co' => '2026-03-20'],
		['id' => 11, 'nom' => 'Nicolas Garnier',   'email' => 'nico.g@borne.fr',     'telephone' => '07 12 34 56 78', 'ville' => 'Paris',      'departement' => '75', 'role' => 'Développeur', 'statut' => 'Actif',     'date_insc' => '2023-11-05', 'derniere_co' => '2026-03-30', 'jx_expand_content' => 'Architecte logiciel.'],
		['id' => 12, 'nom' => 'Isabelle Faure',    'email' => 'isa.f@borne.fr',      'telephone' => '07 23 45 67 89', 'ville' => 'Nice',       'departement' => '06', 'role' => 'Designer',    'statut' => 'Inactif',   'date_insc' => '2023-12-18', 'derniere_co' => '2025-11-01'],
		['id' => 13, 'nom' => 'Lucas Chevalier',   'email' => 'lucas.c@borne.fr',    'telephone' => '07 34 56 78 90', 'ville' => 'Lille',      'departement' => '59', 'role' => 'Technicien',  'statut' => 'Actif',     'date_insc' => '2024-01-09', 'derniere_co' => '2026-03-29', 'jx_expand_content' => 'Technicien terrain.'],
		['id' => 14, 'nom' => 'Camille Blanc',     'email' => 'camille.b@borne.fr',  'telephone' => '07 45 67 89 01', 'ville' => 'Bordeaux',   'departement' => '33', 'role' => 'Commercial',  'statut' => 'Suspendu',  'date_insc' => '2024-03-01', 'derniere_co' => '2026-01-10'],
		['id' => 15, 'nom' => 'Hugo Rousseau',     'email' => 'hugo.r@borne.fr',     'telephone' => '07 56 78 90 12', 'ville' => 'Marseille',  'departement' => '13', 'role' => 'Manager',     'statut' => 'Actif',     'date_insc' => '2024-04-15', 'derniere_co' => '2026-03-30', 'jx_expand_content' => 'Responsable qualité.']
	]
];

/**
 * [CTRL+D] [DATA_S2] : TABLEAU AJAX
 */
$array_ajax = [
	'table_id'   => 'table_ajax',
	'ajax_url'   => 'JaxX_tables_demo_ajax.php',
	'expandable' => true,
	'columns'    => [
		'id'        => ['label' => 'ID', 'sortable' => true],
		'nom'       => ['label' => 'Utilisateur', 'sortable' => true],
		'ville'     => ['label' => 'Ville', 'filterable' => true],
		'date_insc' => ['label' => 'Inscription', 'sortable' => true, 'type' => 'date', 'filterable' => true]
	]
];

/**
 * [CTRL+D] [DATA_S3] : MULTI-INSTANCES
 */
$array_multi_a = [
	'table_id' => 'table_multi_a',
	'columns'  => [
		'id'   => ['label' => 'ID'],
		'type' => ['label' => 'Type de borne', 'sortable' => true]
	],
	'data' => [
		['id' => 1, 'type' => 'Wallbox AC'],
		['id' => 2, 'type' => 'Borne DC 50kW'],
		['id' => 3, 'type' => 'Borne DC 150kW']
	]
];

$array_multi_b = [
	'table_id' => 'table_multi_b',
	'columns'  => [
		'ref'  => ['label' => 'Référence'],
		'prix' => ['label' => 'Tarif (€/kWh)', 'sortable' => true]
	],
	'data' => [
		['ref' => 'TARIF-A', 'prix' => '0.35'],
		['ref' => 'TARIF-B', 'prix' => '0.42'],
		['ref' => 'TARIF-C', 'prix' => '0.29']
	]
];

/**
 * [CTRL+D] [DATA_S4] : MODE CARTES (Galerie Premium)
 */
$array_cards = [
	'table_id'     => 'table_cards_gallery',
	'display_mode' => 'cards',
	'expandable'   => true,
	'columns'      => [
		'visuel'    => ['label' => 'Aperçu'],
		'univers'   => ['label' => 'Univers', 'filterable' => true],
		'titre'     => ['label' => 'Œuvre / Modèle', 'sortable' => true, 'filterable' => true],
		'vibe'      => ['label' => 'Atmosphère']
	],
	'data' => [
		[
			'visuel'    => '<img src=\'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=260&fit=crop\' alt=\'Cyberpunk City\'>',
			'univers'   => 'Cyberpunk',
			'titre'     => 'Neo-Tokyo 2077',
			'vibe'      => 'Néon & Pluie',
			'jx_expand_content' => 'Une vue cinématique d\'une métropole futuriste baignée dans des lumières néons roses et bleues. Parfait pour tester le rendu de couleurs saturées.'
		],
		[
			'visuel'    => '<img src=\'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=260&fit=crop\' alt=\'Cinema\'>',
			'univers'   => 'Cinématique',
			'titre'     => 'The Last Frame',
			'vibe'      => 'Film Noir',
			'jx_expand_content' => 'Inspiration grand écran avec un grain pellicule marqué et un éclairage dramatique en clair-obscur.'
		],
		[
			'visuel'    => '<img src=\'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=260&fit=crop\' alt=\'Fine Art\'>',
			'univers'   => 'Beaux-Arts',
			'titre'     => 'Floral Abstract',
			'vibe'      => 'Peinture',
			'jx_expand_content' => 'Exploration de textures organiques et de pigments profonds. Un rendu "Art Moderne" pour valider la douceur des ombres portées des cartes.'
		],
		[
			'visuel'    => '<img src=\'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=260&fit=crop\' alt=\'Architecture\'>',
			'univers'   => 'Architecture',
			'titre'     => 'Glass Horizon',
			'vibe'      => 'Minimaliste',
			'jx_expand_content' => '
				<div class=\'jx_rich_card\'>
					<div class=\'jx_flex_rich\'>
						<div class=\'jx_flex_main\'>
							<h4>🏢 Fiche Technique : Glass Horizon</h4>
							<p>Exploration des structures modernes et du jeu de reflets sur verre trempé en milieu urbain dense. Un rendu exceptionnel pour les dashboards immobiliers.</p>
							<div class=\'jx_info_grid\'>
								<div class=\'jx_info_item\'>
									<span class=\'jx_info_label\'>Localisation</span>
									<span>Manhattan District</span>
								</div>
								<div class=\'jx_info_item\'>
									<span class=\'jx_info_label\'>Statut</span>
									<span class=\'jx_status_tag\'>VÉRIFIÉ</span>
								</div>
								<div class=\'jx_info_item\'>
									<span class=\'jx_info_label\'>Résolution</span>
									<span>4K Native</span>
								</div>
								<div class=\'jx_info_item\'>
									<span class=\'jx_info_label\'>Poids Fichier</span>
									<span>12.4 MB</span>
								</div>
							</div>
						</div>
						<div class=\'jx_flex_side\'>
							<img src=\'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop\' class=\'jx_rich_img\' alt=\'Architecture Detail\'>
						</div>
					</div>
				</div>'
		],
		[
			'visuel'    => '<img src=\'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=260&fit=crop\' alt=\'Sci-Fi\'>',
			'univers'   => 'Cyberpunk',
			'titre'     => 'Data Core',
			'vibe'      => 'Technologique',
			'jx_expand_content' => 'Représentation abstraite de serveurs et de flux de données. Indispensable pour un dashboard tech.'
		],
		[
			'visuel'    => '<img src=\'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=260&fit=crop\' alt=\'Nature\'>',
			'univers'   => 'Cinématique',
			'titre'     => 'Alpine Echo',
			'vibe'      => 'Nature Sauvage',
			'jx_expand_content' => 'Grands espaces et profondeur de champ. Un paysage majestueux pour tester la fluidité du passage Tableau -> Cartes.'
		],
		[
			'visuel'    => '<img src=\'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=260&fit=crop\' alt=\'Graphic Design\'>',
			'univers'   => 'Beaux-Arts',
			'titre'     => 'Bauhaus Study',
			'vibe'      => 'Géométrique',
			'jx_expand_content' => 'Formes primaires et équilibre visuel. Idéal pour vérifier l\'alignement des textes sous les images.'
		],
		[
			'visuel'    => '<img src=\'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&h=260&fit=crop\' alt=\'Night Life\'>',
			'univers'   => 'Cyberpunk',
			'titre'     => 'Neon District',
			'vibe'      => 'Nocturne',
			'jx_expand_content' => 'L\'énergie de la ville la nuit. Les contrastes élevés permettent de juger la lisibilité des badges sur fond sombre.'
		],
		[
			'visuel'    => '<img src=\'https://images.unsplash.com/photo-1493335129889-328bc3a13bed?w=400&h=260&fit=crop\' alt=\'Art Photography\'>',
			'univers'   => 'Cinématique',
			'titre'     => 'Vintage Vibe',
			'vibe'      => 'Rétro',
			'jx_expand_content' => 'Un portrait au look 70s pour apporter une touche humaine et chaleureuse à la galerie.'
		]
	]
];

?>
<!DOCTYPE html>
<html lang='fr' class='JaxX_tables_demo'>
<head>
	<meta charset='UTF-8'>
	<meta name='viewport' content='width=device-width, initial-scale=1.0'>
	<title>JaxX_tables — Playground</title>

	<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap' rel='stylesheet'>
	<link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' />

	<link rel='stylesheet' href='JaxX_tables.css?v=<?=time()?>'>
	<link rel='stylesheet' href='JaxX_tables_demo.css?v=<?=time()?>'>
</head>
<body>
	<div class='demo_container'>
		<header>
			<div class='header_flex'>
				<h1>JaxX_Tables Playground</h1>
				<span class='version_badge'>V2.0.0-Beta</span>
			</div>
			<p>Laboratoire de validation du module JaxX_tables.</p>
		</header>

		<!-- [CTRL+D] [DATA_S1] -->
		<section class='demo_section' id='section_static'>
			<h2>[ Section 1 ] Tableau statique (PHP)</h2>
			<p class='section_desc'>Validation HTML/CSS/JS de base via injection PHP directe. Tris, filtres, lignes déployables.</p>
			<div class='code_sample'>
<pre><code>$array_static = [
    'table_id'   => 'table_static',
    'expandable' => true,
    'columns'    => [
        'nom'       => ['label' => 'Utilisateur', 'sortable' => true],
        'date_insc' => ['label' => 'Inscription', 'sortable' => true, 'type' => 'date', 'filterable' => true]
    ],
    'data' => $mon_array_php
];</code></pre>
			</div>
			<div class='jx_demo_wrapper'><?php echo return_JaxX_table($array_static); ?></div>
		</section>

		<!-- [CTRL+D] [DATA_S2] -->
		<section class='demo_section' id='section_ajax'>
			<h2>[ Section 2 ] Tableau AJAX (Remote)</h2>
			<p class='section_desc'>Validation du pipeline AJAX, tri serveur et infinite scroll.</p>
			<div class='code_sample'>
<pre><code>$array_ajax = [
    'table_id' => 'table_ajax',
    'ajax_url' => 'mon_handler_ajax.php',
    'columns'  => [...]
];</code></pre>
			</div>
			<div class='jx_demo_wrapper'><?php echo return_JaxX_table($array_ajax); ?></div>
		</section>

		<!-- [CTRL+D] [DATA_S3] -->
		<section class='demo_section' id='section_multi'>
			<h2>[ Section 3 ] Instances multiples (Isolation JS)</h2>
			<p class='section_desc'>Deux tableaux sur la même page, sans interférence entre instances.</p>
			<div class='demo_flex'>
				<div class='demo_col'>
					<h3>Tableau A — Types de bornes</h3>
					<?php echo return_JaxX_table($array_multi_a); ?>
				</div>
				<div class='demo_col'>
					<h3>Tableau B — Tarifs</h3>
					<?php echo return_JaxX_table($array_multi_b); ?>
				</div>
			</div>
		</section>

		<!-- [CTRL+D] [DATA_S4] -->
		<section class='demo_section' id='section_cards'>
			<h2>[ Section 4 ] Mode Cartes activé par défaut</h2>
			<p class='section_desc'>Le module s'ouvre directement en vue responsive. Testez le Copy-to-Clipboard sur chaque carte.</p>
			<div class='code_sample'>
<pre><code>$array_cards = [
    'table_id'     => 'table_cards',
    'display_mode' => 'cards',
    'columns'      => [...]
];</code></pre>
			</div>
			<div class='jx_demo_wrapper'><?php echo return_JaxX_table($array_cards); ?></div>
		</section>

		<!-- [CTRL+D] [DATA_S5] -->
		<section class='demo_section' id='section_api'>
			<h2>[ Section 5 ] Référence des options (Documentation API)</h2>
			<p class='section_desc'>Tableau de documentation généré via le module JaxX_tables lui-même.</p>
			<?php
			$array_api = [
				'table_id'   => 'table_api_doc',
				'export_csv' => true,
				'columns'    => [
					'option'      => ['label' => 'Option', 'sortable' => true, 'filterable' => true],
					'type'        => ['label' => 'Type', 'sortable' => true, 'filterable' => true],
					'defaut'      => ['label' => 'Défaut', 'sortable' => true],
					'description' => ['label' => 'Description']
				],
				'data' => [
					// — Tableau principal —
					['option' => 'table_id',                'type' => 'string', 'defaut' => 'auto-gen',  'description' => 'ID unique de l\'instance. Clé pour la persistance localStorage.'],
					['option' => 'ajax_url',                'type' => 'string', 'defaut' => '""',        'description' => 'URL du handler PHP. Si vide, données statiques uniquement.'],
					['option' => 'display_mode',            'type' => 'string', 'defaut' => '"table"',   'description' => 'Mode initial : "table" ou "cards".'],
					['option' => 'resizable',               'type' => 'bool',   'defaut' => 'true',      'description' => 'Active le redimensionnement des colonnes par glisser. Double-clic sur la bordure pour ajustement automatique.'],
					['option' => 'responsive',              'type' => 'bool',   'defaut' => 'false',     'description' => 'Bascule automatiquement en mode cartes sous 768px.'],
					['option' => 'expandable',              'type' => 'bool',   'defaut' => 'false',     'description' => 'Active le déploiement des lignes. Nécessite jx_expand_content dans les données.'],
					['option' => 'export_csv',              'type' => 'bool',   'defaut' => 'false',     'description' => 'Affiche le bouton d\'export CSV dans la toolbar.'],
					['option' => 'animated',                'type' => 'bool',   'defaut' => 'true',      'description' => 'Active les animations d\'apparition séquencée des lignes.'],
					// — Colonnes —
					['option' => 'columns[x][label]',       'type' => 'string', 'defaut' => '—',         'description' => 'Libellé affiché dans l\'en-tête de colonne.'],
					['option' => 'columns[x][sortable]',    'type' => 'bool',   'defaut' => 'false',     'description' => 'Affiche les boutons de tri ASC/DESC.'],
					['option' => 'columns[x][filterable]',  'type' => 'bool',   'defaut' => 'false',     'description' => 'Affiche le bouton de filtrage par liste à cocher (ou plage de dates si type=date).'],
					['option' => 'columns[x][type]',        'type' => 'string', 'defaut' => '"text"',    'description' => 'Type de données : "text" ou "date".'],
					// — Données ligne —
					['option' => 'data[n][jx_expand_content]', 'type' => 'string/HTML', 'defaut' => '""', 'description' => 'Contenu HTML affiché dans le panneau déployable de la ligne. Nécessite expandable => true.'],
					['option' => 'data[n][id]',             'type' => 'mixed',  'defaut' => '""',        'description' => 'Identifiant de la ligne, exposé via data-row-id sur le <tr>.'],
					// — Variables CSS —
					['option' => '--jx-table-max-height',   'type' => 'CSS var','defaut' => '70vh',      'description' => 'Hauteur maximale du conteneur de défilement (scroll vertical).'],
					['option' => '--jx-table-radius',       'type' => 'CSS var','defaut' => '8px',       'description' => 'Border-radius du conteneur de table.'],
					['option' => '--jx-card-width',         'type' => 'CSS var','defaut' => '280px',     'description' => 'Largeur de chaque carte en mode cartes.'],
					['option' => '--jx-card-gap',           'type' => 'CSS var','defaut' => '1em',       'description' => 'Espacement entre les cartes.'],
					['option' => '--jx-card-img-height',    'type' => 'CSS var','defaut' => '160px',     'description' => 'Hauteur des images intégrées dans les cartes.'],
					['option' => '--jx-popover-width',      'type' => 'CSS var','defaut' => '240px',     'description' => 'Largeur du popover de filtre checkbox.'],
					['option' => '--jx-cell-height',        'type' => 'CSS var','defaut' => '2.4em',     'description' => 'Hauteur minimale des cellules de données.']
				]
			];
			echo return_JaxX_table($array_api);
			?>
		</section>

		<!-- [CTRL+D] [DATA_S6] -->
		<section class='demo_section' id='section_tutorial'>
			<h2>[ Section 6 ] Tutoriel — Guide d'intégration</h2>
			<p class='section_desc'>Comment intégrer JaxX_tables dans vos pages, étape par étape.</p>

			<!-- 6.1 — Autoloader -->
			<h3>6.1 — Intégration via autoloader (recommandé)</h3>
			<p>Le module est compatible avec le système d'autoloader du projet. Il suffit de le déclarer dans <code>$required_modules</code> avant l'appel à l'autoloader :</p>
			<div class='code_sample'>
<pre><code>&lt;?php
// Dans cfg.php ou votre fichier de configuration
$required_modules['JaxX_tables'] = 'JaxX_tables';
require($root . '_modules/autoloaders/autoloader_modules.php');

// L'autoloader charge automatiquement :
//   _modules/JaxX_tables/JaxX_tables.php  (moteur PHP)
//   _modules/JaxX_tables/JaxX_tables.js   (enregistré dans $header_script)
//   _modules/JaxX_tables/JaxX_tables.css  (enregistré dans $css)
?&gt;</code></pre>
			</div>

			<!-- 6.2 — Usage basique PHP -->
			<h3>6.2 — Tableau statique (toutes les options)</h3>
			<p>Appelez <code>return_JaxX_table()</code> avec un tableau associatif :</p>
			<div class='code_sample'>
<pre><code>$config = [
    // ── Identification ──────────────────────────────────────
    'table_id'     => 'mes_utilisateurs', // Clé localStorage. Auto-généré si absent.

    // ── Comportement ────────────────────────────────────────
    'display_mode' => 'table',    // 'table' (défaut) ou 'cards'
    'resizable'    => true,       // Redimensionnement colonnes (défaut: true)
    'responsive'   => false,      // Bascule auto en cartes &lt; 768px (défaut: false)
    'expandable'   => true,       // Lignes déployables via jx_expand_content
    'export_csv'   => true,       // Bouton export CSV
    'animated'     => true,       // Animations d'apparition des lignes

    // ── Colonnes ────────────────────────────────────────────
    'columns' => [
        'nom'    => ['label' => 'Nom',    'sortable' => true],
        'email'  => ['label' => 'Email'],
        'ville'  => ['label' => 'Ville',  'sortable' => true, 'filterable' => true],
        'statut' => ['label' => 'Statut', 'filterable' => true],
        'date'   => ['label' => 'Date',   'sortable' => true, 'type' => 'date', 'filterable' => true]
    ],

    // ── Données ─────────────────────────────────────────────
    'data' => [
        [
            'nom'    => 'Alice Dupont',
            'email'  => 'alice@example.com',
            'ville'  => 'Paris',
            'statut' => 'Actif',
            'date'   => '2024-06-15',
            'jx_expand_content' => '&lt;p&gt;Contenu HTML déployable.&lt;/p&gt;'
        ]
    ]
];

echo return_JaxX_table($config);</code></pre>
			</div>

			<!-- 6.3 — Mode Cartes -->
			<h3>6.3 — Mode Cartes (avec images)</h3>
			<p>Ajoutez <code>'display_mode' => 'cards'</code>. Les images HTML dans les données sont automatiquement mises en couverture. <code>'responsive' => true</code> bascule automatiquement depuis le mode table :</p>
			<div class='code_sample'>
<pre><code>$config_cards = [
    'table_id'     => 'mes_produits',
    'display_mode' => 'cards',   // Démarre en mode cartes
    'responsive'   => true,      // Ou : bascule auto depuis mode table sur mobile
    'expandable'   => true,
    'columns' => [
        'photo'  => ['label' => 'Photo'],
        'nom'    => ['label' => 'Nom',        'sortable'   => true],
        'prix'   => ['label' => 'Prix',        'sortable'   => true],
        'cat'    => ['label' => 'Catégorie',   'filterable' => true]
    ],
    'data' => [
        [
            'photo' => '&lt;img src="mon-image.jpg" alt="Produit A"&gt;',
            'nom'   => 'Produit A',
            'prix'  => '49.90',
            'cat'   => 'Électronique',
            'jx_expand_content' => 'Description détaillée.'
        ]
    ]
];</code></pre>
			</div>
			<p><strong>Variables CSS personnalisables :</strong></p>
			<div class='code_sample'>
<pre><code>#mon_tableau  /* ou .jx_table_wrapper pour tous */
{
    --jx-card-width:      320px;   /* Largeur des cartes        */
    --jx-card-gap:        1.5em;   /* Espacement entre cartes   */
    --jx-card-img-height: 200px;   /* Hauteur des images        */
    --jx-table-radius:    12px;    /* Rayon des coins           */
    --jx-table-max-height: 60vh;   /* Hauteur max du scroll     */
    --jx-cell-height:     2.8em;   /* Hauteur min des cellules  */
}</code></pre>
			</div>

			<!-- 6.4 — Mode AJAX -->
			<h3>6.4 — Tableau AJAX (infinite scroll)</h3>
			<p>Pour les gros volumes, le serveur fournit les lignes par page via infinite scroll automatique.</p>

			<h4>Côté page (appelant) :</h4>
			<div class='code_sample'>
<pre><code>$config_ajax = [
    'table_id'   => 'logs_serveur',
    'ajax_url'   => '_modules/JaxX_tables/mon_handler.php',
    'expandable' => true,
    'resizable'  => true,
    'columns' => [
        'date'    => ['label' => 'Date',          'sortable' => true, 'type' => 'date'],
        'action'  => ['label' => 'Action',        'filterable' => true],
        'user'    => ['label' => 'Utilisateur',   'sortable'   => true],
        'details' => ['label' => 'Détails']
    ]
    // PAS de clé 'data' : le JS charge via AJAX
];

echo return_JaxX_table($config_ajax);</code></pre>
			</div>

			<h4>Côté handler AJAX (<code>mon_handler.php</code>) :</h4>
			<div class='code_sample'>
<pre><code>&lt;?php
require_once 'JaxX_tables.php';

$page     = intval($_POST['page'] ?? 1);
$per_page = 20;
$offset   = ($page - 1) * $per_page;

$stmt = $pdo->prepare("
    SELECT id, date, action, user, details
    FROM logs ORDER BY date DESC
    LIMIT :limit OFFSET :offset
");
$stmt->bindValue(':limit',  $per_page, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset,   PDO::PARAM_INT);
$stmt->execute();
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Réponse vide → le JS arrête l'infinite scroll
if (empty($rows)) { echo ''; exit; }

// Renvoyer UNIQUEMENT les lignes (pas le wrapper)
echo return_JaxX_lines([
    'columns'    => [
        'date'    => ['label' => 'Date',        'sortable' => true, 'type' => 'date'],
        'action'  => ['label' => 'Action',      'filterable' => true],
        'user'    => ['label' => 'Utilisateur', 'sortable'   => true],
        'details' => ['label' => 'Détails']
    ],
    'data'       => $rows,
    'expandable' => true,
    'animated'   => true
]);
?&gt;</code></pre>
			</div>

			<h4>Flux AJAX résumé :</h4>
			<div class='code_sample'>
<pre><code>JS  →  POST { table_id, page, query }  →  ajax_url
PHP →  return_JaxX_lines([...])        →  HTML des &lt;tr&gt;
JS  →  tbody.append(html)
       page++  /  si réponse vide → fin du scroll</code></pre>
			</div>

		</section>
	</div>

	<script src='https://code.jquery.com/jquery-3.7.1.min.js'></script>
	<script src='JaxX_tables.js?v=<?=time()?>'></script>
	<script src='JaxX_tables_demo.js?v=<?=time()?>'></script>
</body>
</html>
