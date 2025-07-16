// (C) 2024-2025 GoodData Corporation
import {
    DataViewFacade,
    IAttributeData2D,
    IMeasureData2D,
    IData2D,
    IDataPointIntersection2D,
} from "@gooddata/sdk-ui";
import { IResultAttributeHeader } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";
import { AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR } from "../constants/agGrid.js";
import {
    PIVOT_ATTRIBUTE_COLUMN_GROUP_SEPARATOR,
    METRIC_GROUP_NAME_COL_DEF_ID,
    METRIC_GROUP_VALUE_COL_DEF_ID,
} from "../constants/internal.js";
import { ColumnHeadersPosition } from "../types/public.js";
import { AgGridRowData } from "../types/internal.js";

// Types for different table configurations
interface ProcessedCell {
    rowAttributes: IAttributeData2D[];
    columnAttributes: IAttributeData2D[];
    measures: IMeasureData2D[];
    measureDimensionIndex?: number;
}

interface TableConfiguration {
    isPivoted: boolean; // Has column attributes
    isTransposed: boolean; // Measures are in rows
}

/**
 * Map data view to ag-grid row data and pivot result fields.
 *
 * For standard data without pivoting, keys are metric or attribute local identifiers, and values are formatted values.
 * For pivoted data, keys are joined attribute label names, attribute values and metric local identifiers, and values are formatted metric values.
 *
 * @param dataView - Data view facade
 * @param columnHeadersPosition - Position of column headers ("top" or "left")
 */
export function mapDataViewToAgGridRowData(
    dataView: DataViewFacade,
    columnHeadersPosition: ColumnHeadersPosition = "top",
): {
    rowData: AgGridRowData[];
    pivotResultFields: string[];
} {
    const data2D = dataView.data().as2D();
    const config = analyzeTableConfiguration(data2D);

    const rowData = data2D.rows
        .map((row) => processRow(row, config, columnHeadersPosition))
        .filter((rowData) => !isEmpty(rowData));

    // Pivot result fields are only relevant when there are column attributes
    const pivotResultFields = config.isPivoted ? Object.keys(rowData[0] ?? {}) : [];

    return {
        rowData,
        pivotResultFields,
    };
}

/**
 * Analyze the table configuration based on data structure
 */
function analyzeTableConfiguration(data2D: IData2D): TableConfiguration {
    const isPivoted = data2D.descriptors
        .filter((descriptor) => descriptor.dimensionIndex === 1)
        .some((descriptor) => descriptor.type === "attributeDescriptor");

    const isTransposed = data2D.descriptors
        .filter((descriptor) => descriptor.dimensionIndex === 0)
        .some((descriptor) => descriptor.type === "measureGroupDescriptor");

    return { isPivoted, isTransposed };
}

/**
 * Process a single row based on the table configuration
 */
function processRow(
    row: IDataPointIntersection2D[],
    config: TableConfiguration,
    columnHeadersPosition: ColumnHeadersPosition,
): AgGridRowData {
    return row.reduce((acc, column): AgGridRowData => {
        const cell = extractCellData(column);
        const cellRowData = processCellByConfiguration(cell, config, columnHeadersPosition);
        return { ...acc, ...cellRowData };
    }, {});
}

/**
 * Extract and categorize cell data
 */
function extractCellData(column: IDataPointIntersection2D): ProcessedCell {
    const result: ProcessedCell = {
        rowAttributes: [],
        columnAttributes: [],
        measures: [],
    };

    column.forEach((cell) => {
        if (cell.type === "attributeData") {
            if (cell.dimensionIndex === 0) {
                result.rowAttributes.push(cell);
            } else if (cell.dimensionIndex === 1) {
                result.columnAttributes.push(cell);
            }
        } else if (cell.type === "measureData") {
            result.measures.push(cell);
            result.measureDimensionIndex = cell.dimensionIndex;
        }
    });

    return result;
}

/**
 * Process cell based on configuration - handles all four combinations
 */
function processCellByConfiguration(
    cell: ProcessedCell,
    config: TableConfiguration,
    columnHeadersPosition: ColumnHeadersPosition,
): AgGridRowData {
    const result: AgGridRowData = {};

    // Add row attributes (common to all configurations)
    addRowAttributes(result, cell.rowAttributes);

    // Handle measures based on configuration
    if (!config.isPivoted && !config.isTransposed) {
        // Simple: measures in columns, no pivoting
        addMeasuresAsColumns(result, cell.measures);
    } else if (config.isPivoted && !config.isTransposed) {
        // Pivoted: column attributes, measures in columns
        addPivotedMeasures(result, cell, columnHeadersPosition);
    } else if (!config.isPivoted && config.isTransposed) {
        // Transposed: no column attributes, measures in rows
        addTransposedMeasures(result, cell.measures);
    } else {
        // Pivoted AND transposed: column attributes, measures in rows
        addPivotedAndTransposedMeasures(result, cell, columnHeadersPosition);
    }

    return result;
}

/**
 * Add row attributes to result (common pattern)
 */
function addRowAttributes(result: AgGridRowData, rowAttributes: IAttributeData2D[]): void {
    rowAttributes.forEach((attr) => {
        const key = attr.descriptor.attributeHeader.localIdentifier;
        const value = getAttributeHeaderValue(attr.header);
        result[key] = value;
    });
}

/**
 * Add measures as simple columns (no pivoting)
 */
function addMeasuresAsColumns(result: AgGridRowData, measures: IMeasureData2D[]): void {
    measures.forEach((measure) => {
        const key = measure.descriptor.measureHeaderItem.localIdentifier;
        result[key] = measure.formattedValue;
    });
}

/**
 * Add pivoted measures (column attributes present, measures in columns)
 */
function addPivotedMeasures(
    result: AgGridRowData,
    cell: ProcessedCell,
    columnHeadersPosition: ColumnHeadersPosition,
): void {
    if (cell.columnAttributes.length === 0) {
        return;
    }

    const measure = cell.measures[0];
    const pivotKey = buildPivotKey(cell.columnAttributes, measure, columnHeadersPosition);
    result[pivotKey] = measure ? measure.formattedValue : null;
}

/**
 * Add transposed measures (no column attributes, measures in rows)
 */
function addTransposedMeasures(result: AgGridRowData, measures: IMeasureData2D[]): void {
    if (measures.length === 0) {
        return;
    }

    const measure = measures[0];
    result[METRIC_GROUP_NAME_COL_DEF_ID] = measure.descriptor.measureHeaderItem.name;
    result[METRIC_GROUP_VALUE_COL_DEF_ID] = measure.formattedValue;
}

/**
 * Add pivoted and transposed measures (column attributes present, measures in rows)
 */
function addPivotedAndTransposedMeasures(
    result: AgGridRowData,
    cell: ProcessedCell,
    columnHeadersPosition: ColumnHeadersPosition,
): void {
    if (cell.columnAttributes.length === 0) return;

    const measure = cell.measures[0];
    if (!measure) {
        const pivotKey = buildPivotKey(cell.columnAttributes, undefined, columnHeadersPosition);
        result[pivotKey] = null;
        return;
    }

    // Add measure name key first (for proper ordering)
    if (cell.measureDimensionIndex === 0) {
        const measureName = measure.descriptor.measureHeaderItem.name;
        if (columnHeadersPosition === "top") {
            result[METRIC_GROUP_NAME_COL_DEF_ID] = measureName;
        } else {
            const groupPath = cell.columnAttributes
                .map((attr) => attr.descriptor.attributeHeader.formOf.name)
                .join(AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR);
            result[groupPath] = measureName;
        }
    }

    // Add measure value
    const pivotKey = buildPivotKey(cell.columnAttributes, measure, columnHeadersPosition);
    result[pivotKey] = measure.formattedValue;
}

/**
 * Build pivot key for column attributes and measures
 */
function buildPivotKey(
    columnAttributes: IAttributeData2D[],
    measure: IMeasureData2D | undefined,
    columnHeadersPosition: ColumnHeadersPosition,
): string {
    const parts: string[] = [];

    // Add column header group path if headers are on top
    if (columnHeadersPosition === "top") {
        const groupPath = columnAttributes
            .map((attr) => attr.descriptor.attributeHeader.formOf.name)
            .join(PIVOT_ATTRIBUTE_COLUMN_GROUP_SEPARATOR);
        parts.push(groupPath);
    }

    // Add attribute values
    columnAttributes.forEach((attr) => {
        const value = getAttributeHeaderValue(attr.header);
        parts.push(value);
    });

    // Add measure identifier if measure is in columns
    if (measure && measure.dimensionIndex === 1) {
        parts.push(measure.descriptor.measureHeaderItem.localIdentifier);
    }

    return parts.join(AG_GRID_PIVOT_RESULT_FIELD_SEPARATOR);
}

function getAttributeHeaderValue(header: IResultAttributeHeader): string {
    return header.attributeHeaderItem.formattedName ?? header.attributeHeaderItem.name ?? "(empty value)";
}
