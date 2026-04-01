<?php
/**
 * ================================================================
 * FICHIER : JaxX_tables_demo_ajax.php
 * EMPLACEMENT : /_modules/JaxX_tables/JaxX_tables_demo_ajax.php
 * SHORT_DESC : Handler AJAX pour la démo JaxX_tables.
 * DESCRIPTION : Retourne des lignes HTML paginées pour le tableau AJAX
 *               de la Section 2. Simule un jeu de données serveur.
 *
 * SOMMAIRE : [CTRL+D]
 *   - [DATA]   : Jeu de données simulé
 *   - [RENDER] : Rendu paginé des lignes
 *
 * MODIFICATIONS :
 *   - 31/03/2026 15:33 : [IA] Restauration après vidage accidentel.
 *   - 31/03/2026 03:00 : [IA] Création initiale.
 *
 * ================================================================
 */

require_once 'JaxX_tables.php';

// [CTRL+D] [DATA]
// Génération de 100 lignes de test pour le scroll infini
$data_ajax = [];
$villes = ['Paris', 'Lyon', 'Marseille', 'Lille', 'Bordeaux', 'Nantes', 'Strasbourg', 'Toulouse', 'Nice', 'Montpellier'];
for ($i = 1; $i <= 100; $i++)
{
	$data_ajax[] = [
		'id'                => $i,
		'nom'               => "Utilisateur #" . sprintf("%03d", $i),
		'ville'             => $villes[array_rand($villes)],
		'date_insc'         => date('Y-m-d', strtotime("-" . rand(0, 730) . " days")),
		'jx_expand_content' => "Informations détaillées pour l'utilisateur #".$i.". Données chargées dynamiquement en scroll infini."
	];
}

// [CTRL+D] [RENDER]
$page = intval($_POST['page'] ?? 1);
$per_page = 10;
$offset = ($page - 1) * $per_page;
$slice = array_slice($data_ajax, $offset, $per_page);

if (empty($slice))
{
	echo '';
	exit;
}

$columns = [
	'id'        => ['label' => 'ID', 'sortable' => true],
	'nom'       => ['label' => 'Utilisateur', 'sortable' => true],
	'ville'     => ['label' => 'Ville', 'filterable' => true],
	'date_insc' => ['label' => 'Inscription', 'sortable' => true, 'type' => 'date', 'filterable' => true]
];

echo return_JaxX_lines([
	'columns'    => $columns,
	'data'       => $slice,
	'expandable' => true,
	'animated'   => true
]);
?>
