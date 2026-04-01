/**
 * ================================================================
 * FICHIER : JaxX_tables.js
 * EMPLACEMENT : /_modules/JaxX_tables/JaxX_tables.js
 * SHORT_DESC : Moteur JS multi-instances pour tableaux JaxX V2.
 * DESCRIPTION : Gère le tri, les filtres checkbox, le mode cartes,
 *               le drag & drop de colonnes, l'export CSV, la copie
 *               et la persistance localStorage.
 *
 * SOMMAIRE : [CTRL+D]
 *   - [CONSTRUCTOR] : Instanciation & propriétés
 *   - [INIT]        : Initialisation
 *   - [TOOLBAR]     : Rendu de la toolbar (mode cartes)
 *   - [EVENTS]      : Bindage des événements
 *   - [FILTERS]     : Événements + popover checkbox
 *   - [DRAGDROP]    : Drag & drop des colonnes
 *   - [STORAGE]     : Sauvegarde / restauration état
 *   - [SORT]        : Tri par colonne
 *   - [CLIENTFILTER]: Tri/filtre côté client (statique)
 *   - [COLUMNRESIZE]: Redimensionnement des colonnes
 *   - [TOGGLE]      : Bascule tableau/cartes
 *   - [REVEAL]      : Animation d'apparition des lignes
 *   - [CSV]         : Export CSV
 *   - [COPY]        : Clipboard (cellule, ligne)
 *   - [AJAX]        : Chargement AJAX des lignes
 *   - [AUTOINIT]    : Initialisation automatique
 *
 * MODIFICATIONS :
 *   - 31/03/2026 17:00 : [IA] Colonnes redimensionnables + persistence des largeurs.
 *   - 31/03/2026 16:00 : [IA] Filtre date range + popover amélioré + icônes check-actions.
 *   - 31/03/2026 05:07 : [IA] Restauration complète — stabilisation.
 *
 * ================================================================
 */

(function($)
{
	"use strict";

	// Version du format de state localStorage.
	// Incrémenter ici après tout changement structurel pour invalider les anciens états.
	var JX_STATE_VERSION = "5";

	// ================================================================
	// [CTRL+D] [CONSTRUCTOR]
	// ================================================================
	function JaxX_table(table_id)
	{
		this.tableId  = table_id;
		this.wrapper  = $("#" + table_id);
		this.body     = this.wrapper.find(".jx_table_body");
		this.ajaxUrl  = this.wrapper.data("ajax-url") || "";

		this.init();
	}

	// ================================================================
	// PROTOTYPE
	// ================================================================
	JaxX_table.prototype = {

		// ============================================================
		// [CTRL+D] [INIT]
		// ============================================================
		init: function()
		{
			console.log("[JaxX_table] Init: " + this.tableId);

			this.page       = 1;
			this.loading    = false;
			this.endOfData  = false;
			this.sortCol    = "";
			this.sortDir    = "";
			this.searchQuery = "";
			this.filters    = {};

			// Sauvegarder l'ordre initial des colonnes (avant loadState)
			var origOrder = [];
			this.wrapper.find("thead th[data-col-id]").each(function()
			{
				origOrder.push($(this).data("col-id"));
			});
			this.wrapper.data("original-order", origOrder);

			this.loadState();
			this.renderToolbar();
			this.bindEvents();
			this.bindFilterEvents();
			this.bindDragAndDrop();
			if (this.wrapper.data("resizable") == "1") this.bindColumnResize();
			if (this.wrapper.data("responsive") == "1") this.bindResponsive();
			this.revealLines();

			// Injecter les boutons "+ Info" si déjà en mode cartes
			if (this.wrapper.hasClass("jx_mode_cards")) this.injectCardInfoButtons();

			// Charger les données AJAX au démarrage si nécessaire
			if (this.ajaxUrl) this.loadLines(false);
		},

		// ============================================================
		// [CTRL+D] [TOOLBAR]
		// Rendu du moteur de recherche et des tris (mode cartes)
		// ============================================================
		renderToolbar: function()
		{
			var self = this;
			var toolbar = this.wrapper.find(".jx_table_toolbar");
			var isCards = this.wrapper.hasClass("jx_mode_cards");
			var html = "";

			// Barre de recherche globale
			html += "<div class='jx_search_wrapper'>";
			html += "<input type='text' class='jx_global_search' placeholder='Rechercher...' value='" + (this.searchQuery || "") + "'>";
			html += "<span class='material-symbols-outlined'>search</span>";
			html += "</div>";

			if (isCards)
			{
				html += "<div class='jx_toolbar_label'>Filtrer & trier :</div>";
				this.wrapper.find("thead th[data-col-id]").each(function()
				{
					var th = $(this);
					var colId = th.data("col-id");
					var label = th.find(".jx_col_label").contents().filter(function() { return this.nodeType === 3; }).text().trim();
					var isSortable = th.hasClass("jx_sortable");
					var isFilterable = th.find(".jx_filter_col_bt").length > 0;

					if (isSortable || isFilterable)
					{
						html += "<div class='jx_toolbar_group' data-col-id='" + colId + "'>";

						if (isSortable)
						{
							html += "<button class='jx_sort_bt jx_sort_asc' data-sort='asc'><span class='material-symbols-outlined'>arrow_drop_up</span></button>";
						}

						html += "<span class='jx_toolbar_col_name'>" + label + "</span>";

						if (isSortable)
						{
							html += "<button class='jx_sort_bt jx_sort_desc' data-sort='desc'><span class='material-symbols-outlined'>arrow_drop_down</span></button>";
						}

						if (isFilterable)
						{
							html += "<button class='jx_filter_col_bt' title='Filtrer'><span class='material-symbols-outlined'>filter_list</span></button>";
						}

						html += "</div>";
					}
				});
			}

			toolbar.html(html);
		},

		// ============================================================
		// [CTRL+D] [EVENTS]
		// ============================================================
		bindEvents: function()
		{
			var self = this;

			// Switch de mode (Table / Cartes)
			this.wrapper.on("click", ".jx_bt_mode_toggle", function()
			{
				self.toggleMode();
			});

			// Infinite Scroll : Surveillance du défilement
			var scrollContainer = this.wrapper.find(".jx_table_scroll_container");

			// 1. Défilement interne (mode table avec max-height)
			scrollContainer.on("scroll", function()
			{
				if (self.ajaxUrl && !self.loading && !self.endOfData)
				{
					var scrollTop = $(this).scrollTop();
					var innerHeight = $(this).innerHeight();
					var scrollHeight = $(this)[0].scrollHeight;

					if (scrollTop + innerHeight >= scrollHeight - 100)
					{
						self.loadLines(true);
					}
				}
			});

			// 2. Défilement de la page (mode cartes ou table sans max-height)
			$(window).on("scroll", function()
			{
				if (self.ajaxUrl && !self.loading && !self.endOfData && self.wrapper.is(":visible"))
				{
					var scrollPos = $(window).scrollTop() + $(window).height();
					var tableBottom = self.wrapper.offset().top + self.wrapper.height();

					if (scrollPos > tableBottom - 200)
					{
						self.loadLines(true);
					}
				}
			});

			// Reset des préférences — tout remettre par défaut
			this.wrapper.on("click", ".jx_bt_reset_prefs", function()
			{
				localStorage.removeItem("jx_table_state_" + self.tableId);

				// Filtres, tri, recherche
				self.filters = {};
				self.sortCol = "";
				self.sortDir = "";
				self.searchQuery = "";
				self.wrapper.find(".jx_global_search").val("");
				self.wrapper.find(".jx_sort_bt").removeClass("jx_active");

				// Mode : retour au mode initial (data-attribute PHP)
				var initialMode = self.wrapper.data("initial-mode") || "table";
				self.wrapper.removeClass("jx_mode_cards jx_mode_table").addClass("jx_mode_" + initialMode);
				self.wrapper.find(".jx_bt_mode_toggle span").text(initialMode === "cards" ? "view_list" : "grid_view");
				self.wrapper.find(".jx_card_info_btn, .jx_card_details_inline").remove();
				if (initialMode === "cards") self.injectCardInfoButtons();

				// Colonnes masquées : tout ré-afficher
				self.wrapper.find(".jx_col_hidden").removeClass("jx_col_hidden");

				// Largeurs de colonnes : supprimer les styles inline
				var table = self.wrapper.find(".jx_table_element");
				self.wrapper.find("thead th[data-col-id]").css("width", "");
				table.css({ "table-layout": "", "width": "" });

				// Ordre des colonnes : remettre l'ordre PHP d'origine
				var headerRow = self.wrapper.find("thead tr");
				var origOrder = self.wrapper.data("original-order");
				if (origOrder && origOrder.length)
				{
					$.each(origOrder, function(_, colId)
					{
						var th = headerRow.find("th[data-col-id='" + colId + "']");
						if (th.length) headerRow.append(th);
					});
					// Colonnes structurelles
					var expandHeader = headerRow.find(".jx_col_expand_header");
					if (expandHeader.length) headerRow.prepend(expandHeader);
					var actionsHeader = headerRow.find(".jx_col_actions_header");
					if (actionsHeader.length)
					{
						expandHeader.length ? expandHeader.after(actionsHeader) : headerRow.prepend(actionsHeader);
					}

					// Même ordre dans le body
					self.body.find("tr.jx_row").each(function()
					{
						var row = $(this);
						$.each(origOrder, function(_, colId)
						{
							var td = row.find("td.jx_col_" + colId);
							if (td.length) row.append(td);
						});
						var expandTd = row.find(".jx_col_expand_trigger");
						if (expandTd.length) row.prepend(expandTd);
						var actionsTd = row.find(".jx_cell_actions");
						if (actionsTd.length)
						{
							expandTd.length ? expandTd.after(actionsTd) : row.prepend(actionsTd);
						}
					});
				}

				// Fermer les popovers ouverts
				self.wrapper.find(".jx_columns_popover, .jx_filter_popover").remove();
				self.wrapper.find(".jx_help_popover").hide();

				self.renderToolbar();
				self.refresh();
			});

			// Bouton masquage colonnes
			this.wrapper.on("click", ".jx_bt_columns", function(e)
			{
				e.stopPropagation();
				var alreadyOpen = self.wrapper.find(".jx_columns_popover").length > 0;
				self.closeAllPopovers();
				if (!alreadyOpen) self.openColumnsPicker();
			});

			// Bouton aide
			this.wrapper.on("click", ".jx_bt_help", function(e)
			{
				e.stopPropagation();
				var $pop = self.wrapper.find(".jx_help_popover");
				var wasVisible = $pop.is(":visible");
				self.closeAllPopovers();
				if (wasVisible) return;

				// Générer le contenu dynamiquement selon les options du tableau
				var hasResizable  = self.wrapper.data("resizable")  !== 0;
				var hasExportCsv  = self.wrapper.data("export-csv") === 1 || self.wrapper.data("exportCsv") === 1;
				var hasFilter     = self.wrapper.find(".jx_filter_col_bt").length > 0;
				var hasSortable   = self.wrapper.find(".jx_sortable").length > 0;
				var hasExpand     = self.wrapper.find(".jx_col_expand_header").length > 0;

				var items = [
					{ icon: "swap_horiz",   label: "Déplacer une colonne",   desc: "Glisser l'en-tête de colonne",         show: true },
					{ icon: "drag_handle",  label: "Redimensionner",          desc: "Glisser la bordure droite d'un en-tête", show: hasResizable },
					{ icon: "width",        label: "Ajustement auto",         desc: "Double-cliquer sur la bordure",          show: hasResizable },
					{ icon: "filter_list",  label: "Filtrer",                 desc: "Icône filtre dans l'en-tête",            show: hasFilter },
					{ icon: "arrow_drop_up",label: "Trier",                   desc: "Flèches dans l'en-tête de colonne",      show: hasSortable },
					{ icon: "chevron_right",label: "Détails d'une ligne",     desc: "Cliquer le chevron à gauche",            show: hasExpand },
					{ icon: "view_column",  label: "Masquer des colonnes",    desc: "Bouton colonnes en haut à droite",       show: true },
					{ icon: "grid_view",    label: "Mode cartes / tableau",   desc: "Bouton vue en haut à droite",            show: true },
					{ icon: "download",     label: "Exporter en CSV",         desc: "Bouton téléchargement",                  show: hasExportCsv },
					{ icon: "restart_alt",  label: "Réinitialiser",           desc: "Remet l'ordre et largeurs par défaut",   show: true }
				];

				var html = "<div class='jx_help_header'><span class='material-symbols-outlined'>help_outline</span>Utilisation du tableau</div><ul class='jx_help_list'>";
				$.each(items, function(_, item)
				{
					if (!item.show) return;
					html += "<li><span class='jx_help_icon material-symbols-outlined'>" + item.icon + "</span>"
					      + "<span class='jx_help_label'>" + item.label + "</span>"
					      + "<span class='jx_help_desc'>" + item.desc + "</span></li>";
				});
				html += "</ul>";

				$pop.html(html).show();
				$(document).one("click.jx_help_outer", function() { $pop.hide(); });
			});

			// Tri (ASC / DESC)
			this.wrapper.on("click", ".jx_sort_bt", function()
			{
				var btn = $(this);
				var colId = btn.closest("th, .jx_toolbar_group").data("col-id");
				var dir = btn.data("sort");
				self.applySort(colId, dir, btn);
			});

			// Expansion de ligne (slideToggle)
			// ---- Mode TABLE : clic sur le chevron ----
			this.wrapper.on("click", ".jx_expand_bt", function(e)
			{
				e.stopPropagation();
				var row = $(this).closest(".jx_row");
				var isExpanded = row.hasClass("jx_expanded");

				row.toggleClass("jx_expanded");

				var detailsRow = row.next(".jx_row_details");
				if (isExpanded)
				{
					detailsRow.find(".jx_details_content").slideUp(300, function()
					{
						detailsRow.hide();
					});
				}
				else
				{
					detailsRow.show();
					detailsRow.find(".jx_details_content").hide().slideDown(300);
				}
			});

			// ---- Mode CARTES : clic sur le bouton "+ Info" ----
			this.wrapper.on("click", ".jx_card_info_btn", function(e)
			{
				e.stopPropagation();
				var btn = $(this);
				var row = btn.closest(".jx_row");
				var inlineDetails = row.find(".jx_card_details_inline");

				if (inlineDetails.length)
				{
					inlineDetails.slideToggle(300, function()
					{
						var isVisible = $(this).is(":visible");
						btn.text(isVisible ? "— Info" : "+ Info");
						btn.toggleClass("jx_active", isVisible);
					});
				}
				else
				{
					var detailsRow = row.next(".jx_row_details");
					var content = detailsRow.find(".jx_details_content").html();
					if (content)
					{
						var detailsDiv = $("<div class='jx_card_details_inline jx_details_content'>" + content + "</div>");
						detailsDiv.hide();
						btn.before(detailsDiv);
						detailsDiv.slideDown(300);
						btn.text("— Info");
						btn.addClass("jx_active");
					}
				}
			});

			// Recherche globale
			var searchTimer;
			this.wrapper.on("keyup", ".jx_global_search", function()
			{
				clearTimeout(searchTimer);
				var input = $(this);
				searchTimer = setTimeout(function()
				{
					self.searchQuery = input.val();
					self.refresh();
				}, 400);
			});

			// Boutons de copie
			this.wrapper.on("click", ".jx_copy_btn", function(e)
			{
				e.stopPropagation();
				var btn = $(this);
				if (btn.hasClass("jx_copy_cell")) self.copyCell(btn);
				else if (btn.hasClass("jx_copy_row")) self.copyRow(btn);
			});

			// Export CSV
			this.wrapper.on("click", ".jx_bt_export_csv", function()
			{
				self.exportCSV();
			});
		},

		// ============================================================
		// [CTRL+D] [FILTERS]
		// ============================================================
		bindFilterEvents: function()
		{
			var self = this;
			this.wrapper.on("click", ".jx_filter_col_bt", function(e)
			{
				e.stopPropagation();
				var btn = $(this);
				var container = btn.closest("th, .jx_toolbar_group");
				var colId = container.data("col-id");
				// Tester AVANT de fermer : le filtre de cette colonne est-il déjà ouvert ?
				var wasOpen = $("body > .jx_filter_popover[data-col-id='" + colId + "']").length > 0;
				self.closeAllPopovers();
				if (wasOpen) return; // toggle : il était ouvert → on le ferme seulement
				var colType = self.wrapper.find("th[data-col-id='" + colId + "']").data("col-type") || "text";
				self.handleFilterClick(colId, colType, btn);
			});

			$(document).on("click", function(e)
			{
				if (!$(e.target).closest(".jx_filter_popover, .jx_filter_col_bt, .jx_bt_columns, .jx_columns_popover, .jx_bt_help, .jx_help_popover").length)
				{
					$(".jx_filter_popover").remove();
				}
			});
		},

		handleFilterClick: function(colId, colType, btn)
		{
			var self = this;
			self.closeAllPopovers();

			var currentFilter = this.filters[colId] || {};
			var checkedValues = currentFilter.checked || [];
			var isDate = (colType === "date");

			// Collecter les valeurs uniques + comptage
			var valueCounts = {};
			this.body.find(".jx_col_" + colId + " .jx_cell_val").each(function()
			{
				var val = $(this).text().trim();
				if (val) valueCounts[val] = (valueCounts[val] || 0) + 1;
			});
			var values = Object.keys(valueCounts).sort();

			var popover = $("<div class='jx_filter_popover'></div>").attr("data-col-id", colId);

			// ── Titre du popover ──
			var colLabel = self.wrapper.find("th[data-col-id='" + colId + "'] .jx_col_label").text() || colId;
			popover.append("<div class='jx_filter_header'><span class='material-symbols-outlined'>filter_list</span><span class='jx_filter_title'>" + colLabel + "</span></div>");

			// ── Section plage de dates (si colonne date) ──
			if (isDate)
			{
				var dateFrom = currentFilter.dateFrom || "";
				var dateTo   = currentFilter.dateTo || "";
				var dateSection = $(
					"<div class='jx_filter_date_range'>" +
						"<div class='jx_field'><label>Du</label><input type='date' class='jx_date_from' value='" + dateFrom + "'></div>" +
						"<div class='jx_field'><label>Au</label><input type='date' class='jx_date_to' value='" + dateTo + "'></div>" +
					"</div>"
				);
				popover.append(dateSection);
			}

			// ── Barre de recherche interne ──
			var searchBox = $("<div class='jx_filter_search'><input type='text' placeholder='Rechercher...'></div>");
			popover.append(searchBox);

			// ── Actions cocher/décocher ──
			var checkActions = $(
				"<div class='jx_filter_check_actions'>" +
					"<button class='jx_check_all' title='Tout cocher'><span class='material-symbols-outlined'>select_check_box</span></button>" +
					"<button class='jx_uncheck_all' title='Tout décocher'><span class='material-symbols-outlined'>check_box_outline_blank</span></button>" +
				"</div>"
			);
			popover.append(checkActions);

			// ── Liste des valeurs ──
			var list = $("<div class='jx_filter_list'></div>");

			if (isDate)
			{
				var monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

				// Parser toutes les dates
				var parsedDates = [];
				$.each(values, function(i, val)
				{
					var d = self.parseDate(val);
					if (d) parsedDates.push({ raw: val, date: d, count: valueCounts[val] || 0 });
				});

				// Granularité par défaut (configurable via data-date-granularity sur le <th>)
				var thGran = self.wrapper.find("th[data-col-id='" + colId + "']").data("date-granularity");
				var defaultGranularity = currentFilter.granularity || thGran || "day";

				// Boutons de granularité
				var granBar = $(
					"<div class='jx_filter_date_granularity'>" +
						"<button class='jx_gran_bt' data-gran='year'>Année</button>" +
						"<button class='jx_gran_bt' data-gran='month'>Mois</button>" +
						"<button class='jx_gran_bt' data-gran='day'>Jour</button>" +
					"</div>"
				);
				popover.append(granBar);

				// Construire l'arbre { year: { month: [ {raw, date, count} ] } }
				var tree = {};
				$.each(parsedDates, function(i, item)
				{
					var y = item.date.getFullYear();
					var m = item.date.getMonth();
					if (!tree[y]) tree[y] = {};
					if (!tree[y][m]) tree[y][m] = [];
					tree[y][m].push(item);
				});

				function allRawsOf(items) { return items.map(function(d) { return d.raw; }); }
				function isAllChecked(raws) { return raws.every(function(v) { return checkedValues.indexOf(v) !== -1; }); }
				function isSomeChecked(raws) { return raws.some(function(v) { return checkedValues.indexOf(v) !== -1; }); }

				function makeCheckbox(cls, label, count, raws)
				{
					var all = isAllChecked(raws);
					var some = !all && isSomeChecked(raws);
					var $el = $(
						"<label class='jx_filter_item " + cls + "'>" +
							"<input type='checkbox' data-raw='" + raws.join("|") + "'" + (all ? " checked" : "") + ">" +
							"<span class='jx_filter_val'>" + label + "</span>" +
							"<span class='jx_filter_count'>" + count + "</span>" +
						"</label>"
					);
					if (some) $el.find("input").prop("indeterminate", true);
					return $el;
				}

				function buildDateTree(granularity)
				{
					list.empty();
					var years = Object.keys(tree).sort();

					if (granularity === "day")
					{
						// Liste plate de jours
						$.each(parsedDates, function(i, item)
						{
							var dayLabel = item.date.getDate() + " " + monthNames[item.date.getMonth()] + " " + item.date.getFullYear();
							list.append(makeCheckbox("jx_date_leaf", dayLabel, item.count, [item.raw]));
						});
						return;
					}

					$.each(years, function(yi, year)
					{
						var yearItems = [];
						$.each(tree[year], function(m, days) { yearItems = yearItems.concat(days); });
						var yearRaws = allRawsOf(yearItems);

						if (granularity === "year")
						{
							// Année → Mois (collapsible) → Jours
							var $yearBlock = $("<div class='jx_date_tree_node'></div>");
							var $yearHeader = $("<div class='jx_date_tree_header'></div>");
							$yearHeader.append("<span class='jx_tree_toggle material-symbols-outlined'>chevron_right</span>");
							$yearHeader.append(makeCheckbox("jx_date_parent", year, yearItems.length, yearRaws));
							$yearBlock.append($yearHeader);

							var $yearChildren = $("<div class='jx_date_tree_children' style='display:none;'></div>");
							var months = Object.keys(tree[year]).sort(function(a, b) { return a - b; });

							$.each(months, function(mi, month)
							{
								var days = tree[year][month];
								var monthRaws = allRawsOf(days);

								var $monthBlock = $("<div class='jx_date_tree_node jx_date_tree_sub'></div>");
								var $monthHeader = $("<div class='jx_date_tree_header'></div>");
								$monthHeader.append("<span class='jx_tree_toggle material-symbols-outlined'>chevron_right</span>");
								$monthHeader.append(makeCheckbox("jx_date_parent", monthNames[parseInt(month)], days.length, monthRaws));
								$monthBlock.append($monthHeader);

								var $monthChildren = $("<div class='jx_date_tree_children' style='display:none;'></div>");
								$.each(days, function(di, item)
								{
									var dayLabel = item.date.getDate() + " " + monthNames[item.date.getMonth()];
									$monthChildren.append(makeCheckbox("jx_date_leaf", dayLabel, item.count, [item.raw]));
								});
								$monthBlock.append($monthChildren);
								$yearChildren.append($monthBlock);
							});

							$yearBlock.append($yearChildren);
							list.append($yearBlock);
						}
						else if (granularity === "month")
						{
							// Mois → Jours (collapsible)
							var months = Object.keys(tree[year]).sort(function(a, b) { return a - b; });
							$.each(months, function(mi, month)
							{
								var days = tree[year][month];
								var monthRaws = allRawsOf(days);

								var $monthBlock = $("<div class='jx_date_tree_node'></div>");
								var $monthHeader = $("<div class='jx_date_tree_header'></div>");
								$monthHeader.append("<span class='jx_tree_toggle material-symbols-outlined'>chevron_right</span>");
								$monthHeader.append(makeCheckbox("jx_date_parent", monthNames[parseInt(month)] + " " + year, days.length, monthRaws));
								$monthBlock.append($monthHeader);

								var $monthChildren = $("<div class='jx_date_tree_children' style='display:none;'></div>");
								$.each(days, function(di, item)
								{
									var dayLabel = item.date.getDate() + " " + monthNames[item.date.getMonth()] + " " + item.date.getFullYear();
									$monthChildren.append(makeCheckbox("jx_date_leaf", dayLabel, item.count, [item.raw]));
								});
								$monthBlock.append($monthChildren);
								list.append($monthBlock);
							});
						}
					});
				}

				// Activer la granularité par défaut
				buildDateTree(defaultGranularity);
				granBar.find("[data-gran='" + defaultGranularity + "']").addClass("jx_gran_active");
				popover.data("granularity", defaultGranularity);

				// Changement de granularité
				granBar.on("click", ".jx_gran_bt", function()
				{
					var gran = $(this).data("gran");
					granBar.find(".jx_gran_bt").removeClass("jx_gran_active");
					$(this).addClass("jx_gran_active");
					popover.data("granularity", gran);
					buildDateTree(gran);
				});

				// Toggle déplier/replier
				list.on("click", ".jx_tree_toggle", function(e)
				{
					e.preventDefault();
					var $toggle = $(this);
					var $children = $toggle.closest(".jx_date_tree_header").siblings(".jx_date_tree_children");
					var isOpen = $children.is(":visible");
					$children.slideToggle(150);
					$toggle.text(isOpen ? "chevron_right" : "expand_more");
				});

				// Parent coché → cascade vers enfants
				list.on("change", ".jx_date_parent input", function()
				{
					var checked = $(this).prop("checked");
					$(this).closest(".jx_date_tree_node").find(".jx_date_tree_children input").prop({ checked: checked, indeterminate: false });
				});

				// Enfant coché → MAJ parents
				list.on("change", ".jx_date_leaf input", function()
				{
					$(this).closest(".jx_date_tree_children").each(function()
					{
						var $container = $(this);
						var $parentCb = $container.siblings(".jx_date_tree_header").find("input");
						if (!$parentCb.length) return;
						var all = $container.find("input");
						var checked = all.filter(":checked");
						$parentCb.prop({
							checked: checked.length === all.length,
							indeterminate: checked.length > 0 && checked.length < all.length
						});
					});
					// Remonter au grand-parent si nécessaire (mois → année)
					var $grandParentChildren = $(this).closest(".jx_date_tree_sub").parent(".jx_date_tree_children");
					if ($grandParentChildren.length)
					{
						var $gpCb = $grandParentChildren.siblings(".jx_date_tree_header").find("input");
						if ($gpCb.length)
						{
							var allSub = $grandParentChildren.find(".jx_date_leaf input");
							var checkedSub = allSub.filter(":checked");
							$gpCb.prop({
								checked: checkedSub.length === allSub.length,
								indeterminate: checkedSub.length > 0 && checkedSub.length < allSub.length
							});
						}
					}
				});
			}
			else
			{
				$.each(values, function(i, val)
				{
					var checked = (checkedValues.indexOf(val) !== -1) ? "checked" : "";
					var count = valueCounts[val] || 0;
					list.append(
						"<label class='jx_filter_item'>" +
							"<input type='checkbox' value='" + val + "' " + checked + ">" +
							"<span class='jx_filter_val'>" + (val || "(vide)") + "</span>" +
							"<span class='jx_filter_count'>" + count + "</span>" +
						"</label>"
					);
				});
			}

			popover.append(list);

			// ── Pied : Filtrer / Reset ──
			var footer = $("<div class='jx_filter_actions'></div>");
			var reset  = $("<button class='jx_filter_cancel'>Reset</button>");
			var apply  = $("<button class='jx_filter_apply'>Filtrer</button>");
			footer.append(reset).append(apply);
			popover.append(footer);

			// ── Insertion dans le DOM + positionnement ──
			$("body").append(popover);
			var offset = btn.offset();
			var popLeft = offset.left;
			if (popLeft + 280 > $(window).width()) popLeft = $(window).width() - 290;

			popover.css({
				top: offset.top + btn.outerHeight() + 8,
				left: Math.max(10, popLeft)
			});

			// ── Recherche interne dans les checkboxes ──
			searchBox.find("input").on("keyup", function()
			{
				var q = $(this).val().toLowerCase();
				list.find(".jx_filter_item").each(function()
				{
					var text = $(this).find(".jx_filter_val").text().toLowerCase();
					$(this).toggle(text.indexOf(q) !== -1);
				});
			});

			// ── Tout cocher / décocher ──
			checkActions.find(".jx_check_all").on("click", function()
			{
				list.find(".jx_filter_item:visible input").prop("checked", true);
			});
			checkActions.find(".jx_uncheck_all").on("click", function()
			{
				list.find(".jx_filter_item:visible input").prop("checked", false);
			});

			// ── Fermer si clic à l'extérieur ──
			setTimeout(function()
			{
				$(document).on("click.jx_pop_outer", function(e)
				{
					if (!$(e.target).closest(".jx_filter_popover, .jx_filter_col_bt").length)
					{
						popover.remove();
						$(document).off("click.jx_pop_outer");
					}
				});
			}, 10);

			// ── Appliquer ──
			apply.on("click", function()
			{
				var selected = [];
				popover.find(".jx_filter_list input:checked").each(function()
				{
					var raw = $(this).data("raw");
					if (raw)
					{
						// Mode mois/année : data-raw contient les dates brutes séparées par |
						$.each(raw.split("|"), function(i, v) { if (v) selected.push(v); });
					}
					else
					{
						selected.push($(this).val());
					}
				});

				var filterData = { checked: selected };

				if (isDate)
				{
					filterData.dateFrom = popover.find(".jx_date_from").val() || "";
					filterData.dateTo   = popover.find(".jx_date_to").val() || "";
					filterData.granularity = popover.data("granularity") || "day";
				}

				self.filters[colId] = filterData;
				popover.remove();
				$(document).off("click.jx_pop_outer");
				self.refresh();
			});

			// ── Reset ──
			reset.on("click", function()
			{
				delete self.filters[colId];
				popover.remove();
				$(document).off("click.jx_pop_outer");
				self.refresh();
			});
		},

		// ============================================================
		// [CTRL+D] [COLUMNRESIZE]
		// ============================================================
		bindColumnResize: function()
		{
			var self = this;

			// ── Utilitaire commun ──────────────────────────────────────
			function snapshotLayout()
			{
				var table = self.wrapper.find(".jx_table_element");
				if (table.css("table-layout") !== "fixed")
				{
					table.css("width", table.outerWidth() + "px");
					self.wrapper.find("thead th[data-col-id]").each(function()
					{
						$(this).css("width", $(this).outerWidth() + "px");
					});
					table.css("table-layout", "fixed");
				}
			}

			// ── AUTO-FIT colonne (style Excel) ────────────────────────
			function autoFitColumn($th)
			{
				var colId = $th.data("col-id");
				var table = self.wrapper.find(".jx_table_element");

				// 1. Mémoriser toutes les largeurs actuelles
				var prevWidths = {};
				self.wrapper.find("thead th[data-col-id]").each(function()
				{
					prevWidths[$(this).data("col-id")] = $(this)[0].getBoundingClientRect().width;
				});

				// 2. Forcer nowrap sur les cellules pour mesurer sans retour à la ligne
				var $cells = self.body.find("tr.jx_row td.jx_col_" + colId + " .jx_cell_val");
				$cells.css("white-space", "nowrap");

				// 3. Libérer le layout pour que le navigateur calcule la largeur naturelle
				table.css({ "table-layout": "auto", "width": "" });
				$th.css("width", "");

				// 4. Lire la largeur naturelle rendue (header + cellules)
				var naturalWidth = $th[0].getBoundingClientRect().width;
				self.body.find("tr.jx_row td.jx_col_" + colId).each(function()
				{
					var w = this.getBoundingClientRect().width;
					if (w > naturalWidth) naturalWidth = w;
				});
				naturalWidth = Math.ceil(naturalWidth) + 2;
				if (naturalWidth < 60) naturalWidth = 60;

				// Remettre le comportement normal (ellipsis géré par CSS)
				$cells.css("white-space", "");

				// 4. Remettre toutes les colonnes en fixed avec largeurs mémorisées
				var totalWidth = 0;
				self.wrapper.find("thead th[data-col-id]").each(function()
				{
					var cid = $(this).data("col-id");
					var w = (cid === colId) ? naturalWidth : Math.ceil(prevWidths[cid] || 80);
					$(this).css("width", w + "px");
					totalWidth += w;
				});
				table.css({ "table-layout": "fixed", "width": totalWidth + "px" });

				// 5. Animer la colonne cible
				$th.css({ "transition": "width 0.15s ease", "width": naturalWidth + "px" });
				setTimeout(function() { $th.css("transition", ""); self.saveState(); }, 170);
			}

			// ── SOURIS ────────────────────────────────────────────────
			// Détection double-clic via timer sur mousedown
			var resizeLastDown    = 0;   // timestamp du dernier mousedown sur une poignée
			var resizeLastTarget  = null; // $th du dernier mousedown

			this.wrapper.on("mousedown", ".jx_col_resize_handle", function(e)
			{
				e.preventDefault();
				e.stopImmediatePropagation();

				var $th        = $(this).closest("th");
				var now        = Date.now();
				var startX     = e.pageX;
				var startWidth = $th.outerWidth();

				// Double-clic détecté : deux mousedown sur la même poignée < 400ms
				if (resizeLastTarget && resizeLastTarget.is($th) && (now - resizeLastDown) < 400)
				{
					resizeLastDown   = 0;
					resizeLastTarget = null;
					autoFitColumn($th);
					return;
				}

				resizeLastDown   = now;
				resizeLastTarget = $th;

				// L'overlay n'est créé qu'au premier mousemove réel (pas sur simple clic)
				var dragging  = false;

				var $watchDoc = $("<div>").css({
					position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
					zIndex: 99999, cursor: "col-resize", userSelect: "none"
				}).appendTo("body");

				$watchDoc.on("mousemove", function(ev)
				{
					if (!dragging)
					{
						dragging = true;
						snapshotLayout();
						startWidth = $th.outerWidth(); // relire après snapshotLayout
					}
					$th.css("width", Math.max(60, startWidth + (ev.pageX - startX)) + "px");
				});

				$watchDoc.on("mouseup mouseleave", function()
				{
					$watchDoc.remove();
					if (dragging) self.saveState();
				});
			});

			// ── TOUCH ─────────────────────────────────────────────────
			this.wrapper.on("touchstart", ".jx_col_resize_handle", function(e)
			{
				e.preventDefault();
				e.stopImmediatePropagation();

				var $th        = $(this).closest("th");
				var startX     = e.originalEvent.touches[0].pageX;
				var startWidth = $th.outerWidth();

				snapshotLayout();

				$(document).on("touchmove.jx_resize", function(ev)
				{
					ev.preventDefault();
					var x = ev.originalEvent.touches[0].pageX;
					$th.css("width", Math.max(60, startWidth + (x - startX)) + "px");
				});

				$(document).on("touchend.jx_resize touchcancel.jx_resize", function()
				{
					$(document).off("touchmove.jx_resize touchend.jx_resize touchcancel.jx_resize");
					self.saveState();
				});
			});
		},

		// ============================================================
		// [CTRL+D] [RESPONSIVE]
		// ============================================================
		bindResponsive: function()
		{
			var self = this;
			var BREAKPOINT = 768;

			function applyResponsive()
			{
				var isNarrow = $(window).width() < BREAKPOINT;
				var isCards  = self.wrapper.hasClass("jx_mode_cards");

				if (isNarrow && !isCards)
				{
					self.wrapper.removeClass("jx_mode_table").addClass("jx_mode_cards");
					self.wrapper.find(".jx_bt_mode_toggle span").text("view_list");
					self.injectCardInfoButtons();
					self.renderToolbar();
				}
				else if (!isNarrow && isCards)
				{
					self.wrapper.removeClass("jx_mode_cards").addClass("jx_mode_table");
					self.wrapper.find(".jx_bt_mode_toggle span").text("grid_view");
					self.wrapper.find(".jx_card_info_btn, .jx_card_details_inline").remove();
					self.renderToolbar();
				}
			}

			// Appliquer au chargement
			applyResponsive();

			// Réévaluer au resize de la fenêtre (debounce 150ms)
			var resizeTimer;
			$(window).on("resize.jx_responsive_" + self.tableId, function()
			{
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(applyResponsive, 150);
			});
		},

		// ============================================================
		// [CTRL+D] [DRAGDROP]
		// ============================================================
		bindDragAndDrop: function()
		{
			var self = this;
			this.wrapper.find("thead th").attr("draggable", "true");

			// Créer la ligne indicatrice (une seule par wrapper)
			var $indicator = $("<div class='jx_drag_indicator'></div>");
			this.wrapper.find(".jx_table_scroll_container").append($indicator);

			var dropSide = "before"; // "before" ou "after"

			this.wrapper.on("dragstart", "th", function(e)
			{
				e.originalEvent.dataTransfer.setData("text/plain", $(this).data("col-id"));
				$(this).addClass("jx_dragging");
			});

			this.wrapper.on("dragover", "th[data-col-id]", function(e)
			{
				e.preventDefault();

				var $destTh   = $(this);
				var scrollCon = self.wrapper.find(".jx_table_scroll_container");
				var thOffset  = $destTh.offset();
				var conOffset = scrollCon.offset();
				var thLeft    = thOffset.left - conOffset.left + scrollCon.scrollLeft();
				var thWidth   = $destTh.outerWidth();
				var mouseX    = e.originalEvent.clientX - conOffset.left + scrollCon.scrollLeft();

				// Décider si on dépose avant ou après selon la moitié de la colonne
				if (mouseX < thLeft + thWidth / 2)
				{
					dropSide = "before";
					$indicator.css({ left: thLeft + "px", display: "block" });
				}
				else
				{
					dropSide = "after";
					$indicator.css({ left: (thLeft + thWidth - 1) + "px", display: "block" });
				}
			});

			this.wrapper.on("dragleave", "th[data-col-id]", function(e)
			{
				// Masquer seulement si on quitte vers l'extérieur du thead
				if (!$(e.relatedTarget).closest("thead").length)
				{
					$indicator.hide();
				}
			});

			this.wrapper.on("dragend", "th", function()
			{
				$indicator.hide();
				$(this).removeClass("jx_dragging");
			});

			this.wrapper.on("drop", "th[data-col-id]", function(e)
			{
				e.preventDefault();
				$indicator.hide();

				var srcColId  = e.originalEvent.dataTransfer.getData("text/plain");
				var destColId = $(this).data("col-id");

				if (srcColId && destColId && srcColId !== destColId)
				{
					var srcTh  = self.wrapper.find("th[data-col-id='" + srcColId + "']");
					var destTh = $(this);

					if (dropSide === "after") destTh.after(srcTh);
					else destTh.before(srcTh);

					self.body.find("tr.jx_row").each(function()
					{
						var row   = $(this);
						var srcTd = row.find(".jx_col_" + srcColId);
						var destTd = row.find(".jx_col_" + destColId);
						if (dropSide === "after") destTd.after(srcTd);
						else destTd.before(srcTd);
					});

					self.saveState();
				}

				self.wrapper.find("th").removeClass("jx_dragging");
			});
		},

		// ============================================================
		// [CTRL+D] [STORAGE]
		// ============================================================
		saveState: function()
		{
			var order = [];
			this.wrapper.find("thead th[data-col-id]").each(function() { order.push($(this).data("col-id")); });

			// Sauvegarder les largeurs si table-layout:fixed est actif
			var widths = null;
			var table = this.wrapper.find(".jx_table_element");
			if (table.css("table-layout") === "fixed")
			{
				widths = {};
				this.wrapper.find("thead th[data-col-id]").each(function()
				{
					var colId = $(this).data("col-id");
					widths[colId] = $(this).outerWidth();
				});
			}

			// Sauvegarder les colonnes masquées
			var hidden = [];
			this.wrapper.find("thead th[data-col-id]").each(function()
			{
				if ($(this).hasClass("jx_col_hidden")) hidden.push($(this).data("col-id"));
			});

			var state = {
				v:       JX_STATE_VERSION,
				mode:    this.wrapper.hasClass("jx_mode_cards") ? "cards" : "table",
				order:   order,
				filters: this.filters,
				widths:  widths,
				hidden:  hidden
			};

			localStorage.setItem("jx_table_state_" + this.tableId, JSON.stringify(state));
		},

		loadState: function()
		{
			var stateRaw = localStorage.getItem("jx_table_state_" + this.tableId);
			if (!stateRaw) return;

			var state = JSON.parse(stateRaw);

			// État d'une version antérieure → on purge et on repart proprement
			if (state.v !== JX_STATE_VERSION)
			{
				localStorage.removeItem("jx_table_state_" + this.tableId);
				return;
			}
			this.filters = state.filters || {};

			var btn = this.wrapper.find(".jx_bt_mode_toggle span");
			if (state.mode === "cards")
			{
				this.wrapper.removeClass("jx_mode_table").addClass("jx_mode_cards");
				btn.text("view_list");
			}
			else
			{
				this.wrapper.removeClass("jx_mode_cards").addClass("jx_mode_table");
				btn.text("grid_view");
			}

			if (state.order && state.order.length > 0)
			{
				var headerRow = this.wrapper.find("thead tr");
				var self = this;
				$.each(state.order, function(i, colId)
				{
					var th = headerRow.find("th[data-col-id='" + colId + "']");
					if (th.length)
					{
						headerRow.append(th);
						self.body.find("tr.jx_row").each(function()
						{
							var td = $(this).find("td.jx_col_" + colId);
							if (td.length) $(this).append(td);
						});
					}
				});

				// Remettre les colonnes structurelles à leur place (expand en premier, actions en dernier)
				var expandHeader = headerRow.find(".jx_col_expand_header");
				if (expandHeader.length) headerRow.prepend(expandHeader);
				var actionsHeader = headerRow.find(".jx_col_actions_header");
				if (actionsHeader.length) headerRow.append(actionsHeader);

				// Idem pour les cellules body
				this.body.find("tr.jx_row").each(function()
				{
					var expandTd = $(this).find(".jx_col_expand_trigger");
					if (expandTd.length) $(this).prepend(expandTd);
					var actionsTd = $(this).find(".jx_cell_actions");
					if (actionsTd.length) $(this).append(actionsTd);
				});
			}

			// Restaurer les colonnes masquées
			if (state.hidden && state.hidden.length > 0)
			{
				var self2 = this;
				$.each(state.hidden, function(_, colId)
				{
					self2.hideColumn(colId);
				});
			}

			// Restaurer les largeurs de colonnes
			if (state.widths)
			{
				var table = this.wrapper.find(".jx_table_element");
				var headerRow2 = this.wrapper.find("thead tr");
				var totalWidth = 0;
				$.each(state.widths, function(colId, width)
				{
					headerRow2.find("th[data-col-id='" + colId + "']").css("width", width + "px");
					totalWidth += width;
				});
				if (totalWidth > 0) table.css("width", totalWidth + "px");
				table.css("table-layout", "fixed");
			}
		},

		// ============================================================
		// [CTRL+D] [POPOVERS] Fermeture globale
		// ============================================================
		closeAllPopovers: function()
		{
			// Filtres sont dans body (positionnement absolu), pas dans le wrapper
			$("body > .jx_filter_popover").remove();
			this.wrapper.find(".jx_columns_popover").remove();
			this.wrapper.find(".jx_help_popover").hide();
			$(document).off("click.jx_help_outer click.jx_pop_outer click.jx_columns_outer");
		},

		// ============================================================
		// [CTRL+D] [COLUMNS] Masquage de colonnes
		// ============================================================
		hideColumn: function(colId)
		{
			this.wrapper.find("thead th[data-col-id='" + colId + "']").addClass("jx_col_hidden");
			this.body.find("td.jx_col_" + colId).addClass("jx_col_hidden");
		},

		showColumn: function(colId)
		{
			this.wrapper.find("thead th[data-col-id='" + colId + "']").removeClass("jx_col_hidden");
			this.body.find("td.jx_col_" + colId).removeClass("jx_col_hidden");
		},

		openColumnsPicker: function()
		{
			var self = this;
			var $wrapper = this.wrapper.find(".jx_columns_wrapper");
			var existing = $wrapper.find(".jx_columns_popover");
			if (existing.length) { existing.remove(); return; }

			var $pop = $("<div class='jx_columns_popover'>");
			var $title = $("<div class='jx_columns_title'>Colonnes visibles</div>");
			var $list  = $("<div class='jx_columns_list'>");

			this.wrapper.find("thead th[data-col-id]").each(function()
			{
				var colId   = $(this).data("col-id");
				// Lire uniquement le nœud texte direct (pas les icônes enfants)
				var label   = $(this).find(".jx_col_label").contents().filter(function() { return this.nodeType === 3; }).text().trim() || colId;
				var hidden  = $(this).hasClass("jx_col_hidden");
				var $item   = $("<label class='jx_columns_item'>");
				var $check  = $("<input type='checkbox'>").prop("checked", !hidden).val(colId);
				var $span   = $("<span>").text(label);
				$item.append($check).append($span);
				$list.append($item);

				$check.on("change", function()
				{
					if ($(this).is(":checked")) self.showColumn(colId);
					else self.hideColumn(colId);
					self.saveState();
				});
			});

			$pop.append($title).append($list);
			$wrapper.append($pop);

			$(document).one("click.jx_columns_outer", function(e)
			{
				if (!$(e.target).closest(".jx_columns_popover, .jx_bt_columns").length)
					$pop.remove();
			});
		},

		// ============================================================
		// [CTRL+D] [SORT]
		// ============================================================
		applySort: function(colId, dir, btn)
		{
			this.wrapper.find(".jx_sort_bt").removeClass("jx_active");
			btn.addClass("jx_active");
			this.sortCol = colId;
			this.sortDir = dir;
			this.refresh();
		},

		// ============================================================
		// [CTRL+D] [CLIENTFILTER]
		// ============================================================
		refresh: function()
		{
			var self = this;
			var rows = this.body.find(".jx_row");

			rows.each(function()
			{
				var row = $(this);
				var visible = true;

				if (self.searchQuery)
				{
					var text = row.text().toLowerCase();
					if (text.indexOf(self.searchQuery.toLowerCase()) === -1) visible = false;
				}

				if (visible)
				{
					$.each(self.filters, function(colId, filterData)
					{
						var cellVal = row.find(".jx_col_" + colId + " .jx_cell_val").text().trim();

						// Filtre par checkbox
						if (filterData.checked && filterData.checked.length > 0)
						{
							if (filterData.checked.indexOf(cellVal) === -1) visible = false;
						}

						// Filtre par plage de dates
						if (filterData.dateFrom || filterData.dateTo)
						{
							var cellDate = self.parseDate(cellVal);
							if (cellDate)
							{
								if (filterData.dateFrom && cellDate < new Date(filterData.dateFrom + "T00:00:00")) visible = false;
								if (filterData.dateTo && cellDate > new Date(filterData.dateTo + "T23:59:59")) visible = false;
							}
							else if (filterData.dateFrom || filterData.dateTo)
							{
								visible = false; // Valeur non parsable → masquer
							}
						}
					});
				}

				row.toggle(visible);
				var detailsRow = row.next(".jx_row_details");
				if (detailsRow.length) detailsRow.toggle(visible && row.hasClass("jx_expanded"));
			});

			if (this.sortCol && this.sortDir)
			{
				var sortedRows = rows.toArray().sort(function(a, b)
				{
					var aVal = $(a).find(".jx_col_" + self.sortCol + " .jx_cell_val").text().trim();
					var bVal = $(b).find(".jx_col_" + self.sortCol + " .jx_cell_val").text().trim();
					if (!isNaN(aVal) && !isNaN(bVal)) { aVal = parseFloat(aVal); bVal = parseFloat(bVal); }
					if (aVal < bVal) return self.sortDir === "asc" ? -1 : 1;
					if (aVal > bVal) return self.sortDir === "asc" ? 1 : -1;
					return 0;
				});

				$.each(sortedRows, function(i, row)
				{
					var $row = $(row);
					var $details = $row.next(".jx_row_details");
					self.body.append($row);
					if ($details.length) self.body.append($details);
				});
			}
		},

		// ============================================================
		// [CTRL+D] [PARSEDATE]
		// ============================================================
		parseDate: function(str)
		{
			if (!str) return null;
			// Format ISO : 2026-03-31
			if (/^\d{4}-\d{2}-\d{2}/.test(str)) return new Date(str);
			// Format FR : 31/03/2026 ou 31-03-2026
			var m = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
			if (m) return new Date(m[3] + "-" + m[2] + "-" + m[1]);
			// Format FR avec heure : 31/03/2026 14:30
			m = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})\s+(\d{2}):(\d{2})/);
			if (m) return new Date(m[3] + "-" + m[2] + "-" + m[1] + "T" + m[4] + ":" + m[5]);
			return null;
		},

		// ============================================================
		// [CTRL+D] [TOGGLE]
		// ============================================================
		toggleMode: function()
		{
			var self = this;
			var btn = this.wrapper.find(".jx_bt_mode_toggle span");

			this.wrapper.addClass("jx_mode_changing");

			setTimeout(function()
			{
				if (self.wrapper.hasClass("jx_mode_table"))
				{
					self.wrapper.removeClass("jx_mode_table").addClass("jx_mode_cards");
					btn.text("view_list");
					self.injectCardInfoButtons();
				}
				else
				{
					self.wrapper.removeClass("jx_mode_cards").addClass("jx_mode_table");
					btn.text("grid_view");
					self.wrapper.find(".jx_card_info_btn, .jx_card_details_inline").remove();
				}

				self.renderToolbar();
				self.saveState();
				self.body.find(".jx_row").addClass("jx_pre_animate");

				// Fin de l'animation de sortie
				setTimeout(function()
				{
					self.wrapper.removeClass("jx_mode_changing");
					self.revealLines();
				}, 50);
			}, 300);
		},

		injectCardInfoButtons: function()
		{
			this.body.find("tr.jx_row").each(function()
			{
				var row = $(this);
				if (row.next(".jx_row_details").length && !row.find(".jx_card_info_btn").length)
				{
					row.append("<button class='jx_card_info_btn'>+ Info</button>");
				}
			});
		},

		// ============================================================
		// [CTRL+D] [REVEAL]
		// ============================================================
		revealLines: function()
		{
			var lines = this.body.find(".jx_row.jx_pre_animate");
			lines.each(function(i)
			{
				var row = $(this);
				setTimeout(function() { row.removeClass("jx_pre_animate"); }, i * 40);
			});
		},

		// ============================================================
		// [CTRL+D] [CSV]
		// ============================================================
		exportCSV: function()
		{
			var csv = [];
			var rows = this.wrapper.find("table tr:visible");
			rows.each(function()
			{
				var row = [];
				$(this).find("th, td").each(function() { row.push('"' + $(this).text().trim().replace(/"/g, '""') + '"'); });
				csv.push(row.join(","));
			});
			var csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
			var downloadLink = document.createElement("a");
			downloadLink.download = "export_" + this.tableId + ".csv";
			downloadLink.href = window.URL.createObjectURL(csvFile);
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
			downloadLink.click();
		},

		// ============================================================
		// [CTRL+D] [COPY]
		// ============================================================
		copyCell: function(btn)
		{
			var text = btn.closest(".jx_cell").find(".jx_cell_val").text().trim();
			navigator.clipboard.writeText(text);
			btn.addClass("jx_copied");
			setTimeout(function() { btn.removeClass("jx_copied"); }, 2000);
		},

		copyRow: function(btn)
		{
			var row = btn.closest(".jx_row");
			var vals = [];

			// Ne copier que les colonnes visibles (pas les masquées, pas expand/actions)
			row.find(".jx_cell[data-label]").each(function()
			{
				if (!$(this).hasClass("jx_col_hidden"))
				{
					vals.push($(this).find(".jx_cell_val").text().trim());
				}
			});

			// Format TSV pour tableurs (tab entre colonnes)
			var tsv = vals.join("\t");

			// Format HTML table pour un collage riche (Excel/Sheets)
			var htmlRow = "<table><tr>" + vals.map(function(v) { return "<td>" + v + "</td>"; }).join("") + "</tr></table>";

			// Écrire les deux formats dans le clipboard
			if (navigator.clipboard && navigator.clipboard.write)
			{
				var blobText = new Blob([tsv],    { type: "text/plain" });
				var blobHtml = new Blob([htmlRow], { type: "text/html" });
				navigator.clipboard.write([new ClipboardItem({ "text/plain": blobText, "text/html": blobHtml })]);
			}
			else
			{
				navigator.clipboard.writeText(tsv);
			}

			btn.addClass("jx_copied");
			setTimeout(function() { btn.removeClass("jx_copied"); }, 2000);
		},

		// ============================================================
		// [CTRL+D] [AJAX]
		// ============================================================
		loadLines: function(append)
		{
			if (this.loading || this.endOfData) return;
			var self = this;
			
			// Cooldown : si on a déjà atteint la fin récemment, on attend un peu avant de retenter
			if (this.noMoreDataCooldown) return;

			this.loading = true;

			// Afficher le loader proprement
			this.wrapper.find(".jx_table_loader").stop(true, true).fadeIn(200);

			$.ajax({
				url: this.ajaxUrl,
				method: "POST",
				data: { table_id: this.tableId, page: this.page, query: this.searchQuery },
				success: function(html)
				{
					self.wrapper.find(".jx_table_loader").stop(true, true).hide();

					if (!html.trim()) 
					{ 
						self.loading = false; 

						// On affiche le message de fin seulement s'il n'existe pas déjà
						if (self.body.find(".jx_row_end_message").length === 0)
						{
							var colCount = self.wrapper.find("thead th").length || 10;
							self.body.append("<tr class='jx_row_end_message'><td colspan='" + colCount + "' style='text-align:center; padding:20px; opacity:0.6; font-style:italic;'>— Fin du tableau —</td></tr>");
						}

						// "Au cas où" : on active un cooldown de 5s avant de pouvoir retenter
						self.noMoreDataCooldown = true;
						setTimeout(function() { self.noMoreDataCooldown = false; }, 5000);
						return; 
					}

					// Si on reçoit enfin des données (ex: après un cooldown ou nouvel ajout base)
					// On supprime le message de fin s'il était présent
					self.body.find(".jx_row_end_message").remove();

					if (append) self.body.append(html);
					else self.body.html(html);

					self.page++;
					self.loading = false;

					// Re-appliquer les colonnes masquées sur les nouvelles lignes
					self.wrapper.find("thead th[data-col-id].jx_col_hidden").each(function()
					{
						var colId = $(this).data("col-id");
						self.body.find("td.jx_col_" + colId).addClass("jx_col_hidden");
					});

					// Si des lignes AJAX ont du contenu expand, afficher la colonne expand du thead
					if (self.body.find(".jx_row_details").length > 0)
					{
						self.wrapper.find(".jx_col_expand_header").show();
					}

					if (self.wrapper.hasClass("jx_mode_cards")) self.injectCardInfoButtons();
					self.revealLines();
				},
				error: function()
				{
					self.wrapper.find(".jx_table_loader").stop(true, true).hide();
					self.loading = false;
				}
			});
		}
	};

	// ================================================================
	// [CTRL+D] [AUTOINIT]
	// ================================================================
	$(function()
	{
		$(".jx_table_wrapper[id]").each(function()
		{
			new JaxX_table($(this).attr("id"));
		});
	});

})(jQuery);
