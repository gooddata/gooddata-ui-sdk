// (C) 2025 GoodData Corporation

import { type MessageDescriptor, defineMessages } from "react-intl";

export const messages: Record<string, MessageDescriptor> = defineMessages({
    titleSearchPlaceholder: { id: "table.title.searchPlaceholder" },
    filterLabel: { id: "table.filter.label" },
    filterSearchPlaceholder: { id: "table.filter.searchPlaceholder" },
    filterOptionAll: { id: "table.filter.optionAll" },
    filterOptionApply: { id: "table.filter.optionApply" },
    filterOptionCancel: { id: "table.filter.optionCancel" },
    chooseAction: { id: "table.bulkActions.chooseAction" },
    selectedCount: { id: "table.bulkActions.selectedCount" },
    selectedCountShort: { id: "table.bulkActions.selectedCountShort" },
    selectAll: { id: "table.bulkActions.selectAll" },
    noMatchFound: { id: "table.emptyState.noMatch" },
    tryAdjustingFilters: { id: "table.emptyState.tryAdjustingFilters" },
    selectedFiltersCount: { id: "table.bulkActions.selectedFiltersCount" },
    filterTooLarge: { id: "table.filter.error.tooLarge" },
    headerAriaLabel: { id: "table.header.ariaLabel" },
    checkboxHeaderAriaLabel: { id: "table.header.checkbox.ariaLabel" },
    menuHeaderAriaLabel: { id: "table.header.menu.ariaLabel" },
});
