// (C) 2026 GoodData Corporation

import { defineMessages } from "react-intl";

export const sharedMessages = defineMessages({
    cancel: { id: "cancel" },
    backAriaLabel: { id: "gs.list.back" },
    closeAriaLabel: { id: "cancel" },
    searchPlaceholder: { id: "gs.list.search.placeholder" },
    searchAriaLabel: { id: "gs.list.acessibility.search.label" },
    ungroupedTitle: { id: "catalog.group_title.ungrouped" },
});

export const addFilterMessages = defineMessages({
    emptyNoResults: { id: "filter_bar_add_filter.no_results" },
    emptyNoItems: { id: "filter_bar_add_filter.no_items" },
    fromVisualization: { id: "filter_bar_add_filter.section.from_visualization" },
    addButton: { id: "filter_bar_add_filter.button.add" },
    tabAttribute: { id: "filter_bar_add_filter.menu.attribute" },
    tabMetric: { id: "filter_bar_add_filter.menu.metric" },
    tabDate: { id: "filter_bar_add_filter.menu.date" },
    titleAttribute: { id: "filter_bar_add_filter.attribute.title" },
    titleMetric: { id: "filter_bar_add_filter.metric.title" },
    titleDate: { id: "filter_bar_add_filter.menu.date" },
    addTooltipAttribute: { id: "filter_bar_add_filter.attribute.no_selection" },
    addTooltipMetric: { id: "filter_bar_add_filter.metric.no_selection" },
});

export const mvfMessages = defineMessages({
    title: { id: "mvf.attributePicker.title" },
    emptyNoResults: { id: "mvf.attributePicker.noResults" },
    emptyNoItems: { id: "mvf.attributePicker.noItems" },
    fromVisualization: { id: "mvf.dimensionality.section.fromVisualization" },
    dateAsLabel: { id: "mvf.attributePicker.dateAs" },
    tabAttribute: { id: "mvf.attributePicker.filter.attributes" },
    tabDate: { id: "mvf.attributePicker.filter.dates" },
});

export const testIds = {
    root: "s-catalog-item-picker",
    list: "s-catalog-item-picker-list",
    search: "s-catalog-item-picker-search",
    add: "s-catalog-item-picker-add",
    cancel: "s-catalog-item-picker-cancel",
    typeFilter: "s-catalog-item-picker-type-filter",
    tab: "s-catalog-item-picker-tab",
    dateDatasetButton: "s-catalog-item-picker-date-dataset-button",
    dateDatasetList: "s-catalog-item-picker-date-dataset-list",
};
