<?php
/**
 * ================================================================
 * FICHIER : JaxX_tables.php
 * EMPLACEMENT : /_modules/JaxX_tables/JaxX_tables.php
 * SHORT_DESC : Moteur de rendu de tableaux multi-instances (JaxX V2).
 * DESCRIPTION : 
 * Module <b>SaaS-ready</b> permettant d'afficher des données tabulaires dynamiques. <br><br>
 * <ul style="margin: 5px 0 0 20px;">
 *   <li><strong>Modes d'affichage</strong> : Bascule entre mode <b>Tableau</b> et mode <b>Cartes</b> (Cards).</li>
 *   <li><strong>Interactivité</strong> : Drag & Drop des colonnes, redimensionnement manuel et Auto-fit.</li>
 *   <li><strong>Données</strong> : Supporte le mode statique (Array PHP) et le mode AJAX (Infinite Scroll).</li>
 *   <li><strong>ClipBoard</strong> : Copie de données (cellule ou ligne complète format tableur).</li>
 *   <li><strong>Filtres & Tri</strong> : Recherche globale (debounce 300ms), filtres checkbox et plages de dates.</li>
 *   <li><strong>Persistance</strong> : Sauvegarde auto dans le <code>localStorage</code> (ordre, largeur, masquage).</li>
 *   <li><strong>Export</strong> : Export CSV intégré.</li>
 * </ul>
 *
 * SOMMAIRE : [CTRL+D]
 *   - [RENDER]   : Point d'entrée principal (return_JaxX_table)
 *   - [HEADER]   : Rendu de l'en-tête (Titres & Filtres colonnes)
 *   - [BODY]     : Rendu des lignes (return_JaxX_lines)
 *   - [CONTROLS] : Barre d'outils et recherche globale
 *
 * MODIFICATIONS :
 *   - 01/04/2026 03:40 : [IA] Ajout des fonctionnalités détaillées et champ LICENCE.
 *   - 31/03/2026 16:00 : [IA] Header colonne : 1 ligne (sort-asc | label+filtre | sort-desc).
 *   - 31/03/2026 03:05 : [IA] Réécriture complète et correction structurelle.
 *
 * LICENCE :
 * @version   2.0.0-Beta
 * @author    JaxX - AnunaQi.com
 * @link      https://www.AnunaQi.com
 * @link      https://github.com/JaxProd/JaxX_tables
 * @license   CC BY-NC-SA 4.0 (Creative Commons Attribution-NonCommercial-ShareAlike 4.0)
 * 
 * Utilisation autorisée pour projets non-commerciaux. 
 * Interdiction de vente ou d'utilisation lucrative sans accord préalable.
 * ================================================================
 */

// 1. [RENDER] Point d'entrée principal
// [CTRL+D] [RENDER]

// $header_script[]='<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=JetBrains+Mono&amp;display=swap" rel="stylesheet">';
// $header_script[]='<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">';

function return_JaxX_table($array_table)
{
	$table_id     = !empty($array_table["table_id"]) ? $array_table["table_id"] : "jx_table_" . uniqid();
	$ajax_url     = $array_table["ajax_url"] ?? "";
	$display_mode = $array_table["display_mode"] ?? "table";
	$resizable    = $array_table["resizable"]    ?? true;   // true = colonnes redimensionnables
	$responsive   = $array_table["responsive"]   ?? false;  // true = passage auto en cartes sur mobile
	$copiable_row = $array_table["copiable_row"] ?? true;   // true = colonne d'actions (copie ligne)
	$copiable_cells = $array_table["copiable_cells"] ?? true; // true = boutons de copie dans les cellules
	$array_table["_resizable"] = $resizable; // transmis aux sous-fonctions
	$array_table["_copiable_row"] = $copiable_row;
	$array_table["_copiable_cells"] = $copiable_cells;

	// Auto-détection : au moins une ligne a du contenu expandable ?
	$has_expand = false;
	if (!empty($array_table["data"]))
	{
		foreach ($array_table["data"] as $row)
		{
			if (!empty($row["jx_expand_content"])) { $has_expand = true; break; }
		}
	}
	// Pour AJAX, on se fie au flag explicite
	if (!empty($ajax_url) && !empty($array_table["expandable"])) $has_expand = true;
	$array_table["_has_expand"] = $has_expand;

	$html = "";

	// Wrapper principal
	$export_csv = !empty($array_table['export_csv']) ? "1" : "0";
	$search_placeholder = htmlspecialchars($array_table['search_placeholder'] ?? 'Rechercher...', ENT_QUOTES);
	$toolbar_custom = $array_table['toolbar_custom'] ?? '';

	$html .= "
	<div id='" . $table_id . "'
		 class='jx_table_wrapper jx_mode_" . $display_mode . "'
		 data-table-id='" . $table_id . "'
		 data-ajax-url='" . $ajax_url . "'
		 data-initial-mode='" . $display_mode . "'
		 data-resizable='" . ($resizable ? "1" : "0") . "'
		 data-responsive='" . ($responsive ? "1" : "0") . "'
		 data-export-csv='" . $export_csv . "'
		 data-search-placeholder='" . $search_placeholder . "'
		 data-toolbar-custom='" . htmlspecialchars($toolbar_custom, ENT_QUOTES) . "'
		 data-page='1'>
	";

	// Barre de contrôles supérieure (contient maintenant la toolbar)
	$html .= return_JaxX_controls($array_table);

	// Conteneur de défilement
	$html .= "<div class='jx_table_scroll_container'>";
	$html .= "<table class='jx_table_element'>";

	// [HEADER]
	$html .= "<thead>";
	$html .= return_JaxX_title_cells($array_table);
	$html .= "</thead>";

	// [BODY]
	$html .= "<tbody class='jx_table_body'>";
	$html .= return_JaxX_lines($array_table);
	$html .= "</tbody>";

	$html .= "</table>";

	// Loader
	$html .= "
		<div class='jx_table_loader' style='display:none;'>
			<span class='jx_spinner'></span> Chargement...
		</div>
	";

	$html .= "</div>"; // .jx_table_scroll_container
	$html .= "</div>"; // .jx_table_wrapper

	return $html;
}

// 2. [HEADER] Rendu des cellules de titre
// [CTRL+D] [HEADER]
function return_JaxX_title_cells($array_table)
{
	$html = "<tr>";
	
	// Case d'expansion (vide en header) — seulement si au moins une ligne a du contenu
	if (!empty($array_table["_has_expand"]))
	{
		$html .= "<th class='jx_col_expand_header'></th>";
	}
	// Colonne d'actions (copie, etc.) - vide en header
	if (!empty($array_table["_copiable_row"]))
	{
		$html .= "<th class='jx_col_actions_header'></th>";
	}

	foreach ($array_table["columns"] as $col_id => $col)
	{
		$sortable = $col["sortable"] ?? false;
		$filterable = $col["filterable"] ?? false;
		$col_type = $col["type"] ?? "text";

		$date_gran = ($col_type === "date" && !empty($col["date_granularity"])) ? " data-date-granularity='" . $col["date_granularity"] . "'" : "";
		$html .= "<th data-col-id='" . $col_id . "' data-col-type='" . $col_type . "'" . $date_gran . " class='" . ($sortable ? "jx_sortable" : "") . "' draggable='true'>";

		// UNE SEULE LIGNE : sort-asc | label [filtre] | sort-desc
		$html .= "<div class='jx_col_header_row'>";

		if ($sortable)
		{
			$html .= "<button class='jx_sort_bt jx_sort_asc' data-sort='asc' title='Trier croissant'><span class='material-symbols-outlined'>arrow_drop_up</span></button>";
		}

		$html .= "<div class='jx_col_label'>" . ($col["label"] ?? $col_id);

		if ($filterable)
		{
			$html .= "<button class='jx_filter_col_bt' title='Filtrer'><span class='material-symbols-outlined'>filter_list</span></button>";
		}

		$html .= "</div>"; // .jx_col_label

		if ($sortable)
		{
			$html .= "<button class='jx_sort_bt jx_sort_desc' data-sort='desc' title='Trier décroissant'><span class='material-symbols-outlined'>arrow_drop_down</span></button>";
		}

		$html .= "</div>"; // .jx_col_header_row

		// Poignée de redimensionnement (si resizable activé)
		if (!empty($array_table["_resizable"]))
		{
			$html .= "<div class='jx_col_resize_handle' draggable='false'></div>";
		}

		$html .= "</th>";
	}
	


	$html .= "</tr>";
	return $html;
}

// 3. [BODY] Rendu des lignes
// [CTRL+D] [BODY]
function return_JaxX_lines($array_table)
{
	$html = "";
	$has_expand = $array_table["_has_expand"] ?? !empty($array_table["expandable"]);
	$copiable_row = isset($array_table["_copiable_row"]) ? !empty($array_table["_copiable_row"]) : ($array_table["copiable_row"] ?? true);
	$copiable_cells = isset($array_table["_copiable_cells"]) ? !empty($array_table["_copiable_cells"]) : ($array_table["copiable_cells"] ?? true);
	$col_count = count($array_table["columns"] ?? []) + ($has_expand ? 1 : 0) + ($copiable_row ? 1 : 0);

	if (!empty($array_table["data"]))
	{
		$row_index = 0;
		foreach ($array_table["data"] as $row)
		{
			$row_id = $row["id"] ?? "";
			$expand_content = $row["jx_expand_content"] ?? "";
			$pre_animate = ($array_table["animated"] ?? true) ? "jx_pre_animate" : "";
			$zebra = ($row_index % 2 === 0) ? "jx_row_even" : "jx_row_odd";

			if(isset($row["injected_classes"]) && is_array($row["injected_classes"]))
			{
				$injected_classes = implode(" ", $row["injected_classes"]);
			} else{$injected_classes ='';}

			$html .= "<tr class='jx_row " . $zebra . " " . $pre_animate . " " . $injected_classes . "' data-row-id='" . $row_id . "'>";

			// Trigger Expansion — seulement si la colonne expand existe ET la ligne a du contenu
			if ($has_expand)
			{
				$html .= "<td class='jx_cell jx_col_expand_trigger'>";
				if (!empty($expand_content))
				{
					$html .= "<span class='jx_expand_bt material-symbols-outlined'>chevron_right</span>";
				}
				$html .= "</td>";
			}
			// Cellule d'actions (copy bouton)
			if ($copiable_row)
			{
				$html .= "
				<td class='jx_cell jx_cell_actions'>
					<button class='jx_copy_btn jx_copy_row' title='Copier toute la carte'>
						<span class='material-symbols-outlined'>content_copy</span>
					</button>
				</td>";
			}


			foreach ($array_table["columns"] as $col_id => $col)
			{
				$val = $row[$col_id] ?? "";
				$col_label = $col["label"] ?? $col_id;

				$html .= "<td class='jx_cell jx_col_" . $col_id . "' data-label='" . $col_label . "'>";
				if ($copiable_cells)
				{
					$html .= "
						<div class='jx_cell_wrapper'>
							<div class='jx_cell_val'>" . $val . "</div>
							<button class='jx_copy_btn jx_copy_cell' title='Copier cette donnée' data-copy='" . strip_tags($val) . "'>
								<span class='material-symbols-outlined'>content_copy</span>
							</button>
						</div>";
				}
				else
				{
					$html .= "<div class='jx_cell_val'>" . $val . "</div>";
				}
				$html .= "</td>";
			}

			$html .= "</tr>";

			// Détails dépliables — seulement si la ligne a du contenu
			if ($has_expand && !empty($expand_content))
			{
				$html .= "
				<tr class='jx_row_details' style='display:none;'>
					<td colspan='" . $col_count . "'>
						<div class='jx_details_content'>" . $expand_content . "</div>
					</td>
				</tr>";
			}

			$row_index++;
		}
	}
	else
	{
		// Cas tableau vide (Empty State Premium)
		$html .= "
		<tr class='jx_no_data'>
			<td colspan='" . $col_count . "'>
				<div class='jx_empty_state'>
					<span class='material-symbols-outlined'>database_off</span>
					<div class='jx_empty_text'>Aucune donnée n'a été trouvée</div>
				</div>
			</td>
		</tr>";
	}

	return $html;
}

// 4. [CONTROLS] Barre d'outils globale
// [CTRL+D] [CONTROLS]
function return_JaxX_controls($array_table)
{
	$html = "<div class='jx_table_controls'>";
	
	$html .= "
	<div class='jx_control_left'>
		<div class='jx_table_toolbar'></div>
	</div>";
	
	$html .= "<div class='jx_control_right'>";
	
	// Bouton Export CSV (optionnel)
	if (!empty($array_table['export_csv']))
	{
		$html .= "
		<button class='jx_bt jx_bt_export_csv' title='Exporter en CSV'>
			<span class='material-symbols-outlined'>download</span>
		</button>";
	}
	
	$html .= "
		<div class='jx_columns_wrapper'>
			<button class='jx_bt jx_bt_columns' title='Afficher/masquer des colonnes'>
				<span class='material-symbols-outlined'>view_column</span>
			</button>
		</div>
		<button class='jx_bt jx_bt_reset_prefs' title='Réinitialiser les préférences'>
			<span class='material-symbols-outlined'>restart_alt</span>
		</button>
		<button class='jx_bt jx_bt_mode_toggle' title='Changer de mode (Table/Cartes)'>
			<span class='material-symbols-outlined'>grid_view</span>
		</button>
		<div class='jx_help_wrapper'>
			<button class='jx_bt jx_bt_help' title='Aide'>
				<span class='material-symbols-outlined'>help_outline</span>
			</button>
			<div class='jx_help_popover jx_popover' style='display:none;'></div>
		</div>
	</div>";
	
	$html .= "</div>";
	return $html;
}
?>
