// (C) 2020 GoodData Corporation

import {
    IBucketItem,
    IExtendedReferencePoint,
    IFiltersBucketItem,
} from "../../../../interfaces/Visualization";
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
                title: "Rows",
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
                title: "Columns",
            },
            filters: {
                accepts: ["attribute", "date"],
                allowsReordering: false,
                enabled: true,
                isShowInPercentEnabled: false,
                itemsLimit: 20,
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
