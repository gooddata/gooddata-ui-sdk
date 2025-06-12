// (C) 2020 GoodData Corporation

import {
    IBucketItem,
    IExtendedReferencePoint,
    IFiltersBucketItem,
} from "../../../../interfaces/Visualization.js";
import { ISortItem } from "@gooddata/sdk-model";
import { ColumnWidthItem } from "@gooddata/sdk-ui-pivot";

export const getMockReferencePoint = (
    measures: IBucketItem[] = [],
    rows: IBucketItem[] = [],
    columns: IBucketItem[] = [],
    filterItems: IFiltersBucketItem[] = [],
    sortItems: ISortItem[] = [],
    measuresIsShowInPercentEnabled = false,
    columnWidths: ColumnWidthItem[] = [],
    multipleDatesEnabled = false,
): IExtendedReferencePoint => ({
    buckets: [
        {
            items: measures,
            localIdentifier: "measures",
        },
        {
            items: rows,
            localIdentifier: "attribute",
        },
        {
            items: columns,
            localIdentifier: "columns",
        },
    ],
    filters: {
        items: filterItems,
        localIdentifier: "filters",
    },
    properties: {
        sortItems,
        controls: {
            columnWidths,
        },
    },
    uiConfig: {
        buckets: {
            attribute: {
                accepts: ["attribute", "date"],
                allowsReordering: true,
                allowsSwapping: true,
                canAddItems: true,
                enabled: true,
                icon: "",
                isShowInPercentEnabled: false,
                itemsLimit: 20,
                itemsLimitByType: {
                    date: multipleDatesEnabled ? 20 : 1,
                },
                title: "Rows",
                allowsDuplicateDates: multipleDatesEnabled,
            },
            columns: {
                accepts: ["attribute", "date"],
                allowsReordering: true,
                allowsSwapping: true,
                canAddItems: true,
                enabled: true,
                icon: "",
                isShowInPercentEnabled: false,
                itemsLimit: 20,
                itemsLimitByType: {
                    date: multipleDatesEnabled ? 20 : 1,
                },
                title: "Columns",
                allowsDuplicateDates: multipleDatesEnabled,
            },
            filters: {
                accepts: ["attribute", "date"],
                allowsReordering: false,
                enabled: true,
                isShowInPercentEnabled: false,
                itemsLimit: 20,
                itemsLimitByType: {
                    date: 1,
                },
            },
            measures: {
                accepts: ["metric", "fact", "attribute"],
                allowsDuplicateItems: true,
                allowsReordering: true,
                allowsSwapping: true,
                canAddItems: true,
                enabled: true,
                icon: "",
                isShowInPercentEnabled: measuresIsShowInPercentEnabled,
                isShowInPercentVisible: true,
                itemsLimit: 20,
                title: "Measures",
            },
        },
        exportConfig: {
            supported: true,
        },
        openAsReport: {
            supported: false,
        },
        recommendations: {},
        supportedOverTimeComparisonTypes: ["same_period_previous_year", "previous_period"],
    },
});
