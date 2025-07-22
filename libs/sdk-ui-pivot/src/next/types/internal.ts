// (C) 2025 GoodData Corporation

/**
 * Data transformed to a structure used by ag-grid.
 *
 * In case of attribute:
 * - key is attribute local identifier
 * - value is attribute header value
 *
 * In case of measure:
 * - key is measure local identifier
 * - value is measure value
 *
 * In case of pivoting:
 * - key is pivot result field local identifier
 * - value is attribute header value / measure value
 *
 * @internal
 */
export type AgGridRowData = Record<string, string | null>;
