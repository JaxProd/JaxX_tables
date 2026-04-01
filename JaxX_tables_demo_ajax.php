<?php
/**
 * ================================================================
 * FICHIER : JaxX_tables_demo_ajax.php
 * EMPLACEMENT : /_modules/JaxX_tables/JaxX_tables_demo_ajax.php
 * SHORT_DESC : Handler AJAX pour la démo JaxX_tables.
 * DESCRIPTION : Retourne des lignes HTML paginées pour le tableau AJAX
 *               de la Section 2. Gère tri, filtres et recherche côté serveur.
 *
 * SOMMAIRE : [CTRL+D]
 *   - [DATA]          : Jeu de données simulé
 *   - [FILTERVALUES]  : Valeurs distinctes pour les popovers filtre
 *   - [SEARCH]        : Recherche globale
 *   - [COLFILTER]     : Filtres par colonne (checkbox + plage de dates)
 *   - [SORT]          : Tri côté serveur
 *   - [RENDER]        : Rendu paginé des lignes
 *
 * MODIFICATIONS :
 *   - 01/04/2026 : [IA] Ajout tri, filtres et recherche côté serveur.
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

$columns = [
	'id'        => ['label' => 'ID', 'sortable' => true],
	'nom'       => ['label' => 'Utilisateur', 'sortable' => true],
	'ville'     => ['label' => 'Ville', 'filterable' => true],
	'date_insc' => ['label' => 'Inscription', 'sortable' => true, 'type' => 'date', 'filterable' => true]
];

// ── Paramètres reçus ──
$query    = trim($_POST['query'] ?? '');
$sort_col = trim($_POST['sort_col'] ?? '');
$sort_dir = trim($_POST['sort_dir'] ?? '');
$filters  = json_decode($_POST['filters'] ?? '{}', true) ?: [];
$action   = trim($_POST['action'] ?? '');

// [CTRL+D] [SEARCH]
// Recherche globale : filtrer sur toutes les colonnes (hors jx_expand_content)
if ($query !== '')
{
	$q = mb_strtolower($query);
	$data_ajax = array_filter($data_ajax, function($row) use ($q)
	{
		foreach ($row as $key => $val)
		{
			if ($key === 'jx_expand_content') continue;
			if (mb_strpos(mb_strtolower((string)$val), $q) !== false) return true;
		}
		return false;
	});
	$data_ajax = array_values($data_ajax);
}

// [CTRL+D] [COLFILTER]
// Filtres par colonne
foreach ($filters as $colId => $filterData)
{
	// Filtre checkbox (valeurs cochées)
	if (!empty($filterData['checked']))
	{
		$checked = $filterData['checked'];
		$data_ajax = array_filter($data_ajax, function($row) use ($colId, $checked)
		{
			$val = (string)($row[$colId] ?? '');
			return in_array($val, $checked);
		});
		$data_ajax = array_values($data_ajax);
	}

	// Filtre plage de dates
	if (!empty($filterData['dateFrom']) || !empty($filterData['dateTo']))
	{
		$from = $filterData['dateFrom'] ?? '';
		$to   = $filterData['dateTo'] ?? '';
		$data_ajax = array_filter($data_ajax, function($row) use ($colId, $from, $to)
		{
			$val = $row[$colId] ?? '';
			if ($val === '') return false;
			$ts = strtotime($val);
			if ($ts === false) return false;
			if ($from && $ts < strtotime($from . ' 00:00:00')) return false;
			if ($to   && $ts > strtotime($to . ' 23:59:59'))   return false;
			return true;
		});
		$data_ajax = array_values($data_ajax);
	}
}

// [CTRL+D] [FILTERVALUES]
// Action spéciale : renvoyer les valeurs distinctes d'une colonne (pour le popover filtre)
if ($action === 'filter_values')
{
	$filter_col  = trim($_POST['filter_col'] ?? '');
	$filter_type = trim($_POST['filter_type'] ?? '');
	$valueCounts = [];

	foreach ($data_ajax as $row)
	{
		$val = (string)($row[$filter_col] ?? '');
		if ($val === '') continue;

		// Pour les dates, regrouper par jour (YYYY-MM-DD)
		if ($filter_type === 'date')
		{
			$ts = strtotime($val);
			if ($ts !== false) $val = date('Y-m-d', $ts);
		}

		$valueCounts[$val] = ($valueCounts[$val] ?? 0) + 1;
	}

	header('Content-Type: application/json; charset=utf-8');
	echo json_encode($valueCounts, JSON_UNESCAPED_UNICODE);
	exit;
}

// [CTRL+D] [SORT]
// Tri côté serveur
if ($sort_col !== '' && $sort_dir !== '')
{
	usort($data_ajax, function($a, $b) use ($sort_col, $sort_dir)
	{
		$aVal = $a[$sort_col] ?? '';
		$bVal = $b[$sort_col] ?? '';

		// Détection numérique
		if (is_numeric($aVal) && is_numeric($bVal))
		{
			$aVal = (float)$aVal;
			$bVal = (float)$bVal;
		}

		if ($aVal < $bVal) return $sort_dir === 'asc' ? -1 : 1;
		if ($aVal > $bVal) return $sort_dir === 'asc' ? 1 : -1;
		return 0;
	});
}

// [CTRL+D] [RENDER]
$page     = intval($_POST['page'] ?? 1);
$per_page = 10;
$offset   = ($page - 1) * $per_page;
$slice    = array_slice($data_ajax, $offset, $per_page);

if (empty($slice))
{
	echo '';
	exit;
}

echo return_JaxX_lines([
	'columns'    => $columns,
	'data'       => $slice,
	'expandable' => true,
	'animated'   => true
]);
?>
