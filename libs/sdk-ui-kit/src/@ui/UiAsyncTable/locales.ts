// (C) 2025 GoodData Corporation

import { MessageDescriptor, defineMessages } from "react-intl";

export const messages: Record<string, MessageDescriptor> = defineMessages({
    moreActions: { id: "table.moreActions" },
    titleSearchPlaceholder: { id: "table.title.searchPlaceholder" },
    filterLabel: { id: "table.filter.label" },
    filterSearchPlaceholder: { id: "table.filter.searchPlaceholder" },
    filterOptionAll: { id: "table.filter.optionAll" },
    filterOptionApply: { id: "table.filter.optionApply" },
    filterOptionCancel: { id: "table.filter.optionCancel" },
    chooseAction: { id: "table.bulkActions.chooseAction" },
    selectedCount: { id: "table.bulkActions.selectedCount" },
    selectedCountShort: { id: "table.bulkActions.selectedCountShort" },
    noMatchFound: { id: "table.emptyState.noMatch" },
    tryAdjustingFilters: { id: "table.emptyState.tryAdjustingFilters" },
    selectedFiltersCount: { id: "table.bulkActions.selectedFiltersCount" },
    filterTooLarge: { id: "table.filter.error.tooLarge" },
});
