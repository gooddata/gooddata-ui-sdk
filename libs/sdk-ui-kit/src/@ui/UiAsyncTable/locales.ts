// (C) 2025 GoodData Corporation
import { defineMessages, MessageDescriptor } from "react-intl";

export const messages: Record<string, MessageDescriptor> = defineMessages({
    moreActions: { id: "table.moreActions" },
    titleSearchPlaceholder: { id: "table.title.searchPlaceholder" },
    filterLabel: { id: "table.filter.label" },
    filterSearchPlaceholder: { id: "table.filter.searchPlaceholder" },
    chooseAction: { id: "table.bulkActions.chooseAction" },
    selectedCount: { id: "table.bulkActions.selectedCount" },
    noMatchFound: { id: "table.emptyState.noMatch" },
    tryAdjustingFilters: { id: "table.emptyState.tryAdjustingFilters" },
});
