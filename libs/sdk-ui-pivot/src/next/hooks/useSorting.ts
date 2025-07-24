// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { SortChangedEvent } from "ag-grid-community";
import { IAttribute, IMeasure } from "@gooddata/sdk-model";
import { IPushData } from "@gooddata/sdk-ui";
import { mapSortModelToSortItems } from "../mapProps/mapSortModelToSortItems.js";

interface IUseSortingProps {
    pushData?: (data: IPushData) => void;
    rows: IAttribute[];
    measures: IMeasure[];
}

/**
 * Hook that provides sorting handlers for the pivot table
 *
 * @alpha
 */
export function useSorting(props: IUseSortingProps) {
    const { pushData, rows, measures } = props;

    const onSortChanged = useCallback(
        (event: SortChangedEvent) => {
            if (!pushData) {
                return;
            }

            // Get the current sort model from ag-grid
            const sortModel = event.api
                .getColumnState()
                .filter((col) => col.sort !== null)
                .map((col) => ({
                    colId: col.colId!,
                    sort: col.sort!,
                }));

            const sortItems = mapSortModelToSortItems(sortModel, rows, measures);

            pushData({
                properties: {
                    sortItems,
                },
            });
        },
        [pushData, rows, measures],
    );

    return {
        onSortChanged,
    };
}
