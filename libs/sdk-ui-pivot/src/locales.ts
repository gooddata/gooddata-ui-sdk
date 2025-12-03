// (C) 2019-2025 GoodData Corporation

import { MessageDescriptor, defineMessages } from "react-intl";

import { TotalType } from "@gooddata/sdk-model";

//NOTE: Follow up ticket for move all messages: https://gooddata.atlassian.net/browse/FET-1050
export const messages: Record<string, MessageDescriptor> = defineMessages({
    sum: { id: "visualizations.totals.dropdown.title.sum" },
    avg: { id: "visualizations.totals.dropdown.title.avg" },
    min: { id: "visualizations.totals.dropdown.title.min" },
    max: { id: "visualizations.totals.dropdown.title.max" },
    nat: { id: "visualizations.totals.dropdown.title.nat" },
    med: { id: "visualizations.totals.dropdown.title.med" },
    "disabled.mvf": { id: "visualizations.totals.dropdown.tooltip.nat.disabled.mvf" },
    "disabled.ranking": { id: "visualizations.totals.dropdown.tooltip.nat.disabled.ranking" },
    // Aggregations menu
    aggregationsSection: { id: "visualizations.menu.aggregations" },
    rowsSection: { id: "visualizations.menu.aggregations.rows" },
    columnsSection: { id: "visualizations.menu.aggregations.columns" },
    allRows: { id: "visualizations.menu.aggregations.all-rows" },
    allColumns: { id: "visualizations.menu.aggregations.all-columns" },
    withinAttribute: { id: "visualizations.menu.aggregations.within-attribute" },
    // Text wrapping menu
    textWrappingSection: { id: "visualizations.menu.textWrapping" },
    textWrappingHeader: { id: "visualizations.menu.textWrapping.header" },
    textWrappingCell: { id: "visualizations.menu.textWrapping.cell" },
    // Sorting menu
    sortSection: { id: "visualizations.menu.sort" },
    sortAscending: { id: "visualizations.menu.sort.ascending" },
    sortDescending: { id: "visualizations.menu.sort.descending" },
    // Accessibility
    openHeaderMenuAria: { id: "visualizations.menu.header.openAriaLabel" },
    // Pagination
    paginationOf: { id: "visualizations.table.pagination.of" },
});

/**
 * Mapping of total types to their message descriptors.
 */
export const totalTypeMessages: Record<TotalType, MessageDescriptor> = {
    sum: messages["sum"],
    max: messages["max"],
    min: messages["min"],
    avg: messages["avg"],
    med: messages["med"],
    nat: messages["nat"],
};
