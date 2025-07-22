// (C) 2025 GoodData Corporation
import {
    IDimensionDescriptor,
    IAttributeDescriptor,
    IMeasureDescriptor,
    isMeasureGroupDescriptor,
    isAttributeDescriptor,
    ISortItem,
    isAttributeSort,
    sortDirection,
    isMeasureLocator,
} from "@gooddata/sdk-model";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import {
    ATTRIBUTE_EMPTY_VALUE,
    METRIC_EMPTY_VALUE,
    METRIC_GROUP_NAME_COL_DEF_ID,
    METRIC_GROUP_VALUE_COL_DEF_ID,
} from "../constants/internal.js";
import { AgGridRowData } from "../types/internal.js";

function metricCellRenderer(params: ICellRendererParams<AgGridRowData, string | null>) {
    const value = params.value;
    if (!value) {
        return METRIC_EMPTY_VALUE;
    }
    return value;
}

const METRIC_GROUP_NAME_COL_DEF: ColDef<AgGridRowData, string | null> = {
    field: METRIC_GROUP_NAME_COL_DEF_ID,
    headerName: "",
    suppressHeaderMenuButton: true,
    sortable: false,
    cellStyle: { textAlign: "right" },
    valueGetter: (params) => {
        return params.data?.[METRIC_GROUP_NAME_COL_DEF_ID];
    },
    cellRenderer: metricCellRenderer,
};

const METRIC_GROUP_VALUE_COL_DEF: ColDef<AgGridRowData, string | null> = {
    field: METRIC_GROUP_VALUE_COL_DEF_ID,
    headerName: "",
    suppressHeaderMenuButton: true,
    sortable: false,
    cellStyle: { textAlign: "right" },
    valueGetter: (params) => {
        return params.data?.[METRIC_GROUP_VALUE_COL_DEF_ID];
    },
    cellRenderer: metricCellRenderer,
};

function attributeDescriptorToColDef(
    attributeDescriptor: IAttributeDescriptor,
    isPivoting: boolean,
    initialSort?: ISortItem,
): ColDef<AgGridRowData, string | null> {
    const attributeLocalIdentifier = attributeDescriptor.attributeHeader.localIdentifier;
    const colDef: ColDef<AgGridRowData, string | null> = {
        field: attributeLocalIdentifier,
        headerName: attributeDescriptor.attributeHeader.formOf.name,
        pivot: isPivoting,
        valueGetter: (params) => {
            return params.data?.[attributeLocalIdentifier];
        },
        // rowGroup: TODO: get from configuration
        cellRenderer: (params: ICellRendererParams<AgGridRowData, string | null>) => {
            const value = params.value;
            if (!value) {
                return ATTRIBUTE_EMPTY_VALUE;
            }

            // Do not render repeating attribute values.
            const rowIndex = params.node.rowIndex;
            const previousRow = rowIndex ? params.api.getDisplayedRowAtIndex(rowIndex - 1) : null;
            const previousValue = previousRow?.data?.[attributeLocalIdentifier];
            const isSameValue = previousValue && previousValue === value;

            if (isSameValue) {
                return null;
            }

            return value;
        },
    };

    // Apply initial sort if provided for this attribute
    if (initialSort && isAttributeSort(initialSort)) {
        const sortAttributeId = initialSort.attributeSortItem.attributeIdentifier;
        if (sortAttributeId === attributeLocalIdentifier) {
            const direction = sortDirection(initialSort);
            colDef.sort = direction;
        }
    }

    return colDef;
}

function measureDescriptorToColDef(
    measureDescriptor: IMeasureDescriptor,
    initialSort?: ISortItem,
): ColDef<AgGridRowData, string | null> {
    const measureLocalIdentifier = measureDescriptor.measureHeaderItem.localIdentifier;
    const colDef: ColDef<AgGridRowData, string | null> = {
        field: measureLocalIdentifier,
        headerName: measureDescriptor.measureHeaderItem.name,
        // aggFunc: "sum",
        cellStyle: { textAlign: "right" },
        valueGetter: (params) => {
            return params.data?.[measureLocalIdentifier];
        },
        cellRenderer: metricCellRenderer,
    };

    // Apply initial sort if provided for this measure
    if (initialSort && !isAttributeSort(initialSort)) {
        const locators = initialSort.measureSortItem.locators;
        const measureLocator = locators.find(isMeasureLocator);
        if (measureLocator) {
            const sortMeasureId = measureLocator.measureLocatorItem.measureIdentifier;
            if (sortMeasureId === measureLocalIdentifier) {
                const direction = sortDirection(initialSort);
                colDef.sort = direction;
            }
        }
    }

    return colDef;
}

export function mapDimensionsToColDefs(
    dimensionDescriptors: IDimensionDescriptor[],
    measureGroupDimension: "columns" | "rows",
    initialSortBy?: ISortItem[],
): ColDef<AgGridRowData, string | null>[] {
    const colDefs: ColDef<AgGridRowData, string | null>[] = [];

    dimensionDescriptors.forEach((dimensionDescriptor, dimensionIndex) => {
        dimensionDescriptor.headers.forEach((dimensionItemDescriptor) => {
            if (isAttributeDescriptor(dimensionItemDescriptor)) {
                // Attributes in second dimension are "columns" and are always pivoting.
                const isPivoting = dimensionIndex === 1;

                // Find matching sort for this attribute
                const matchingSort = initialSortBy?.find((sortItem) => {
                    if (isAttributeSort(sortItem)) {
                        return (
                            sortItem.attributeSortItem.attributeIdentifier ===
                            dimensionItemDescriptor.attributeHeader.localIdentifier
                        );
                    }
                    return false;
                });

                colDefs.push(attributeDescriptorToColDef(dimensionItemDescriptor, isPivoting, matchingSort));
            } else if (isMeasureGroupDescriptor(dimensionItemDescriptor)) {
                if (measureGroupDimension === "columns") {
                    // If we are rendering metrics as columns, we need to create a column for each measure.
                    dimensionItemDescriptor.measureGroupHeader.items.forEach((measure) => {
                        // Find matching sort for this measure
                        const matchingSort = initialSortBy?.find((sortItem) => {
                            if (!isAttributeSort(sortItem)) {
                                const locators = sortItem.measureSortItem.locators;
                                const measureLocator = locators.find(isMeasureLocator);
                                return (
                                    measureLocator?.measureLocatorItem.measureIdentifier ===
                                    measure.measureHeaderItem.localIdentifier
                                );
                            }
                            return false;
                        });

                        colDefs.push(measureDescriptorToColDef(measure, matchingSort));
                    });
                } else if (measureGroupDimension === "rows") {
                    // If we are rendering metrics as rows, we need to create two columns for the metric group - one for the metric name and one for the metric value.
                    colDefs.push(METRIC_GROUP_NAME_COL_DEF, METRIC_GROUP_VALUE_COL_DEF);
                }
            }
        });
    });

    return colDefs;
}
