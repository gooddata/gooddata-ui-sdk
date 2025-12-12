// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { UiAsyncTableCheckboxColumnWidth } from "@gooddata/sdk-ui-kit";

import {
    AUTOMATIONS_SMALL_LAYOUT_BULK_ACTIONS_THRESHOLD,
    AUTOMATIONS_SMALL_LAYOUT_SEARCH_THRESHOLD,
} from "./constants.js";
import { type IUseAutomationsSmallLayoutProps } from "./types.js";

export const useAutomationsSmallLayout = ({
    searchHandler,
    search,
    availableBulkActions,
    columnDefinitions,
    tableVariant,
    automationsLength = 0,
}: IUseAutomationsSmallLayoutProps) => {
    const isSmall = tableVariant === "small";

    return useMemo(() => {
        if (!isSmall) {
            return {
                setSearch: searchHandler,
                bulkActions: availableBulkActions,
                columns: columnDefinitions,
            };
        }

        const setSearch =
            automationsLength > AUTOMATIONS_SMALL_LAYOUT_SEARCH_THRESHOLD || search
                ? searchHandler
                : undefined;
        const bulkActions =
            automationsLength > AUTOMATIONS_SMALL_LAYOUT_BULK_ACTIONS_THRESHOLD
                ? availableBulkActions
                : undefined;

        let columns = columnDefinitions;

        // If bulk actions are disabled, make the first column wider by the checkbox width
        if (!bulkActions && columnDefinitions.length > 0) {
            columns = columnDefinitions.map((col, index) => {
                if (index === 0) {
                    return {
                        ...col,
                        width: (col.width ?? 0) + UiAsyncTableCheckboxColumnWidth,
                    };
                }
                return col;
            });
        }

        return {
            setSearch,
            bulkActions,
            columns,
        };
    }, [isSmall, automationsLength, search, searchHandler, availableBulkActions, columnDefinitions]);
};
