// (C) 2024-2025 GoodData Corporation
import { ColDef, ICellRendererParams } from "ag-grid-enterprise";
import {
    IAttributeDescriptor,
    IDimensionDescriptor,
    IMeasureDescriptor,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
} from "@gooddata/sdk-model";
import { AgGridRowData } from "../types/internal.js";
import {
    ATTRIBUTE_EMPTY_VALUE,
    METRIC_EMPTY_VALUE,
    METRIC_GROUP_NAME_COL_DEF_ID,
    METRIC_GROUP_VALUE_COL_DEF_ID,
} from "../constants/internal.js";

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
): ColDef<AgGridRowData, string | null> {
    const attributeLocalIdentifier = attributeDescriptor.attributeHeader.localIdentifier;
    return {
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
}

function measureDescriptorToColDef(
    measureDescriptor: IMeasureDescriptor,
): ColDef<AgGridRowData, string | null> {
    const measureLocalIdentifier = measureDescriptor.measureHeaderItem.localIdentifier;
    const colDef: ColDef = {
        field: measureLocalIdentifier,
        headerName: measureDescriptor.measureHeaderItem.name,
        aggFunc: "sum",
        cellStyle: { textAlign: "right" },
        valueGetter: (params) => {
            return params.data?.[measureLocalIdentifier];
        },
        cellRenderer: metricCellRenderer,
    };

    return colDef;
}

export function mapDimensionsToColDefs(
    dimensionDescriptors: IDimensionDescriptor[],
    measureGroupDimension: "columns" | "rows",
): ColDef<AgGridRowData, string | null>[] {
    const colDefs: ColDef<AgGridRowData, string | null>[] = [];

    dimensionDescriptors.forEach((dimensionDescriptor, dimensionIndex) => {
        dimensionDescriptor.headers.forEach((dimensionItemDescriptor) => {
            if (isAttributeDescriptor(dimensionItemDescriptor)) {
                // Attributes in second dimension are "columns" and are always pivoting.
                const isPivoting = dimensionIndex === 1;
                colDefs.push(attributeDescriptorToColDef(dimensionItemDescriptor, isPivoting));
            } else if (isMeasureGroupDescriptor(dimensionItemDescriptor)) {
                if (measureGroupDimension === "columns") {
                    // If we are rendering metrics as columns, we need to create a column for each measure.
                    dimensionItemDescriptor.measureGroupHeader.items.forEach((measure) => {
                        colDefs.push(measureDescriptorToColDef(measure));
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
