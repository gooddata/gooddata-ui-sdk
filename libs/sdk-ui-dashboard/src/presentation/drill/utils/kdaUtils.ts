// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";

import {
    DataValue,
    IKeyDriveAnalysis,
    IResultAttributeHeaderItem,
    isAttributeDescriptor,
    isMeasureDescriptor,
    isMeasureGroupDescriptor,
} from "@gooddata/sdk-model";
import {
    DataViewFacade,
    IDrillEvent,
    IDrillEventIntersectionElement,
    ITableColumnDefinition,
    ITableData,
    ITableDataAttributeScope,
    ITableDataValue,
    ITableRowDefinition,
    ITableValueColumnDefinition,
    ITableValueRowDefinition,
    isAttributeScope,
    isDrillIntersectionAttributeItem,
    isDrillIntersectionDateAttributeItem,
    isMeasureScope,
    isTableMeasureValue,
    isValueColumnDefinition,
    isValueRowDefinition,
} from "@gooddata/sdk-ui";

import { DashboardKeyDriverCombinationItem } from "../../../model/index.js";

/**
 * @internal
 */
export function getKdaKeyDriverCombinations(
    drillDefinition: IKeyDriveAnalysis,
    drillEvent: IDrillEvent,
): DashboardKeyDriverCombinationItem[] {
    //TODO: Special implementation for headline
    const dv = DataViewFacade.for(drillEvent.dataView);
    const combinations = findHeadersCombinations(dv, drillDefinition, drillEvent);

    // No relevant headers
    if (!combinations.dateHeader || !combinations.metricHeader) {
        return [];
    }

    const dimScopedValues = getScopeValuesByDimensions(combinations.dimensions);
    const dateId = combinations.dateHeader.attributeHeader.localIdentifier;

    const table = dv.data().asTable();
    const filteredColumns = filterColumns(table.columnDefinitions, dimScopedValues[1], dateId);
    const filteredRows = filterRows(table.rowDefinitions, dimScopedValues[0], dateId);
    const exactColumn = filterExactColumn(filteredColumns, dimScopedValues[1]);
    const exactRow = filterExactRow(filteredRows, dimScopedValues[0]);

    const isFirstColumn = exactColumn === filteredColumns[0];
    const isFirstRow = exactRow === filteredRows[0];

    const isLastColumn = exactColumn === filteredColumns[filteredColumns.length - 1];
    const isLastRow = exactRow === filteredRows[filteredRows.length - 1];

    const current = getCurrentValue(table.data, dateId, exactRow, exactColumn);
    const previous = getDirectionValue(table.data, dateId, current, -1, isFirstColumn, isFirstRow);
    const next = getDirectionValue(table.data, dateId, current, 1, isLastColumn, isLastRow);

    const res: DashboardKeyDriverCombinationItem[] = [];

    // There is a previous value in graph
    const before = createBefore(combinations, current, previous);
    res.push(...(before ? [before] : []));

    // There is a next value in graph
    const after = createAfter(combinations, current, next);
    res.push(...(after ? [after] : []));

    // There is a previous year value in graph
    const year = createYearToYear(
        combinations,
        table,
        filteredRows,
        filteredColumns,
        dimScopedValues,
        current,
    );
    res.push(...(year ? [year] : []));

    return res;
}

type ScopeValues = ReturnType<typeof getScopeColumnsValues>;

function filterRows(rows: ITableRowDefinition[], sv: ScopeValues, dateId: string) {
    return rows.filter((row) => {
        if (isValueRowDefinition(row)) {
            const scopedValues = getScopeRowsValues(row, dateId);
            const match = areScopeValuesIntersects(sv, scopedValues);
            if (match) {
                return true;
            }
        }
        return false;
    });
}

function filterColumns(columns: ITableColumnDefinition[], sv: ScopeValues, dateId: string) {
    return columns.filter((column) => {
        if (isValueColumnDefinition(column)) {
            const scopedValues = getScopeColumnsValues(column, dateId);
            const match = areScopeValuesIntersects(sv, scopedValues);
            if (match) {
                return true;
            }
        }
        return false;
    });
}

function filterExactColumn(columns: ITableColumnDefinition[], sv: ScopeValues) {
    return columns.find((column) => {
        if (isValueColumnDefinition(column)) {
            const scopedValues = getScopeColumnsValues(column);
            const match = areScopeValuesIntersects(sv, scopedValues);
            if (match) {
                return true;
            }
        }
        return false;
    });
}

function filterExactRow(rows: ITableRowDefinition[], sv: ScopeValues) {
    return rows.find((row) => {
        if (isValueRowDefinition(row)) {
            const scopedValues = getScopeRowsValues(row);
            const match = areScopeValuesIntersects(sv, scopedValues);
            if (match) {
                return true;
            }
        }
        return false;
    });
}

function getScopeValuesByDimensions(dimensions: IDrillEventIntersectionElement[][]) {
    return dimensions.map((d) => {
        const metrics: string[] = [];
        const map = new Map();
        d.forEach((h) => {
            if (isDrillIntersectionAttributeItem(h.header)) {
                map.set(h.header.attributeHeader.localIdentifier, h.header.attributeHeaderItem.uri);
            }
            if (isMeasureDescriptor(h.header)) {
                metrics.push(h.header.measureHeaderItem.localIdentifier);
            }
        });
        return {
            metrics,
            attributes: map,
        } as ScopeValues;
    }) as ScopeValues[];
}

function getScopeColumnsValues(column: ITableValueColumnDefinition, dateId?: string) {
    const metrics: string[] = [];
    const attributes = new Map<string, unknown>();

    column.columnScope.forEach((s) => {
        if (isAttributeScope(s)) {
            const localId = s.descriptor.attributeHeader.localIdentifier;
            if (dateId && dateId !== localId) {
                attributes.set(localId, s.header.attributeHeaderItem.uri);
            }
            if (!dateId) {
                attributes.set(localId, s.header.attributeHeaderItem.uri);
            }
        }
        if (isMeasureScope(s)) {
            const localId = s.descriptor.measureHeaderItem.localIdentifier;
            metrics.push(localId);
        }
    });

    return {
        metrics,
        attributes,
    };
}

function getScopeRowsValues(row: ITableValueRowDefinition, dateId?: string) {
    const metrics: string[] = [];
    const attributes = new Map<string, unknown>();

    row.rowScope.forEach((s) => {
        if (isAttributeScope(s)) {
            const localId = s.descriptor.attributeHeader.localIdentifier;
            if (dateId && dateId !== localId) {
                attributes.set(localId, s.header.attributeHeaderItem.uri);
            }
            if (!dateId) {
                attributes.set(localId, s.header.attributeHeaderItem.uri);
            }
        }
        if (isMeasureScope(s)) {
            const localId = s.descriptor.measureHeaderItem.localIdentifier;
            metrics.push(localId);
        }
    });

    return {
        metrics,
        attributes,
    };
}

function areScopeValuesIntersects(a: ScopeValues, b: ScopeValues) {
    const coveredMetrics = a.metrics.every((m) => b.metrics.includes(m));
    const coveredAttributes = Array.from(a.attributes.entries()).every(([key, value]) => {
        if (b.attributes.has(key)) {
            return b.attributes.get(key) === value;
        }
        return true;
    });

    return coveredMetrics && coveredAttributes;
}

type CurrentValue = {
    value: DataValue;
    scope: ITableDataAttributeScope;
    direction: "row" | "column";
    row: number;
    column: number;
};

function getCurrentValue(
    data: ITableDataValue[][],
    dateId: string,
    row?: ITableRowDefinition,
    column?: ITableColumnDefinition,
): CurrentValue | null {
    if (!row || !column) {
        return null;
    }
    const res = data[row.rowIndex]?.[column.columnIndex];
    return mapToCurrentValue(res, dateId, row.rowIndex, column.columnIndex);
}

function getDirectionValue(
    data: ITableDataValue[][],
    dateId: string,
    current: CurrentValue | null,
    direction: -1 | 1,
    isColumnOnBorder: boolean,
    isRowOnBorder: boolean,
) {
    if (!current) {
        return null;
    }

    if (current.direction === "row") {
        if (isRowOnBorder) {
            return null;
        }
        const res = data[current.row + direction]?.[current.column];
        return mapToCurrentValue(res, dateId, current.row + direction, current.column);
    }

    if (current.direction === "column") {
        if (isColumnOnBorder) {
            return null;
        }
        const res = data[current.row]?.[current.column + direction];
        return mapToCurrentValue(res, dateId, current.row, current.column + direction);
    }

    return null;
}

function mapToCurrentValue(
    res: ITableDataValue,
    dateId: string,
    row: number,
    column: number,
): CurrentValue | null {
    if (isTableMeasureValue(res)) {
        const [value, scope, direction] = getCurrentValueInfo(res, dateId);
        if (value && scope && direction) {
            return {
                value,
                scope,
                direction,
                row,
                column,
            };
        }
    }
    return null;
}

function getCurrentValueInfo(
    data: ITableDataValue | null,
    dateId: string,
): [DataValue | null, ITableDataAttributeScope | null, "row" | "column" | null] {
    if (data && isTableMeasureValue(data) && isValueColumnDefinition(data.columnDefinition)) {
        const dateFromColumns = data.columnDefinition.columnScope.find((c) => {
            return isAttributeScope(c) && c.descriptor.attributeHeader.localIdentifier === dateId;
        }) as ITableDataAttributeScope | undefined;

        const dateFromRows = data.rowDefinition.rowScope.find((c) => {
            return isAttributeScope(c) && c.descriptor.attributeHeader.localIdentifier === dateId;
        }) as ITableDataAttributeScope | undefined;

        if (dateFromColumns) {
            return [data.value, dateFromColumns, "column"];
        }
        if (dateFromRows) {
            return [data.value, dateFromRows, "row"];
        }
    }
    return [null, null, null];
}

function createBefore(
    combinations: Combinations,
    current: CurrentValue | null,
    prev: CurrentValue | null,
): DashboardKeyDriverCombinationItem | undefined {
    const measure = combinations.metricHeader;
    if (measure && current && prev) {
        const currentValue = current.value as number;
        const previousValue = prev.value as number;

        return {
            measure,
            where: "before",
            difference: currentValue - previousValue,
            type: "comparative",
            values: [previousValue, currentValue],
            range: [prev.scope, current.scope],
        };
    }
    return undefined;
}

function createAfter(
    combinations: Combinations,
    current: CurrentValue | null,
    next: CurrentValue | null,
): DashboardKeyDriverCombinationItem | undefined {
    const measure = combinations.metricHeader;
    if (measure && current && next) {
        const currentValue = current.value as number;
        const nextValue = next.value as number;

        return {
            measure,
            where: "after",
            difference: nextValue - currentValue,
            type: "comparative",
            values: [currentValue, nextValue],
            range: [current.scope, next.scope],
        };
    }
    return undefined;
}

function createYearToYear(
    combinations: Combinations,
    table: ITableData,
    rows: ITableRowDefinition[],
    columns: ITableColumnDefinition[],
    dims: ScopeValues[],
    current: CurrentValue | null,
): DashboardKeyDriverCombinationItem | undefined {
    const measure = combinations.metricHeader;
    const dateId = combinations.dateHeader?.attributeHeader.localIdentifier;

    if (!current || !measure || !dateId) {
        return undefined;
    }

    const attribute = current.scope.descriptor.attributeHeader;
    const attributeItem = current.scope.header.attributeHeaderItem;
    const isYear = attribute.granularity === "GDC.time.year";

    // Year to year is not available for year granularity, it not makes sense
    if (isYear) {
        return undefined;
    }

    const previousYear = getPreviousYear(attributeItem);

    const updated = dims.map((d) => {
        const metrics = d.metrics.slice();
        const attributes = new Map(d.attributes);
        if (attributes.has(attribute.localIdentifier)) {
            attributes.set(attribute.localIdentifier, previousYear);
        }
        return {
            metrics,
            attributes,
        };
    });

    const exactColumn = filterExactColumn(columns, updated[1]);
    const exactRow = filterExactRow(rows, updated[0]);

    const prev = getCurrentValue(table.data, dateId, exactRow, exactColumn);
    if (measure && current && prev) {
        const previousValue = prev.value as number;
        const currentValue = current.value as number;

        return {
            measure,
            where: "none",
            difference: previousValue - currentValue,
            type: "year-to-year",
            values: [previousValue, currentValue],
            range: [prev.scope, current.scope],
        };
    }
    return undefined;
}

/**
 * @internal
 */
export function getKeyDriverCombinationItemTitle(intl: IntlShape, item: DashboardKeyDriverCombinationItem) {
    switch (item.type) {
        case "comparative": {
            const where =
                item.where === "before"
                    ? intl.formatMessage({ id: "drill.kda.from" })
                    : intl.formatMessage({ id: "drill.kda.in" });
            const date = item.where === "before" ? item.range[0] : item.range[1];

            if (item.difference < 0) {
                return intl.formatMessage(
                    { id: "drill.kda.drop" },
                    {
                        where,
                        title: date.header.attributeHeaderItem.formattedName,
                    },
                );
            }
            if (item.difference > 0) {
                return intl.formatMessage(
                    { id: "drill.kda.increase" },
                    {
                        where,
                        title: date.header.attributeHeaderItem.formattedName,
                    },
                );
            }
            return intl.formatMessage(
                { id: "drill.kda.no_change" },
                {
                    where,
                    title: date.header.attributeHeaderItem.formattedName,
                },
            );
        }
        case "year-to-year":
            return intl.formatMessage({ id: "drill.kda.year_to_year" });
    }
}

type Combinations = ReturnType<typeof findHeadersCombinations>;

function findHeadersCombinations(
    dv: DataViewFacade,
    drillDefinition: IKeyDriveAnalysis,
    drillEvent: IDrillEvent,
) {
    if (drillDefinition.transition !== "in-place") {
        return {
            dateHeader: undefined,
            metricHeader: undefined,
            attributeHeaders: [],
        };
    }

    const intersections = drillEvent.drillContext.intersection || [];

    //NOTE: For now we only support 1 date and 1 metric
    const dateHeader = intersections
        .map((intersectionElement) => intersectionElement.header)
        .filter(isDrillIntersectionDateAttributeItem)[0];
    const metricHeader = intersections
        .map((intersectionElement) => intersectionElement.header)
        .filter(isMeasureDescriptor)[0];

    const attributeHeaders = intersections
        .map((intersectionElement) => intersectionElement.header)
        .filter(isDrillIntersectionAttributeItem)
        .filter((header) => header !== dateHeader);

    const dimensions = dv
        .meta()
        .dimensions()
        .map(
            (d) =>
                d.headers
                    .map((h) => {
                        if (isAttributeDescriptor(h)) {
                            return intersections.find((i) => {
                                if (isDrillIntersectionAttributeItem(i.header)) {
                                    return (
                                        i.header.attributeHeader.localIdentifier ===
                                        h.attributeHeader.localIdentifier
                                    );
                                }
                                return false;
                            });
                        }
                        if (isMeasureGroupDescriptor(h)) {
                            return intersections.find((i) => isMeasureDescriptor(i.header));
                        }
                        return undefined;
                    })
                    .filter(Boolean) as IDrillEventIntersectionElement[],
        );

    return {
        dimensions,
        dateHeader,
        metricHeader,
        attributeHeaders,
    };
}

function getPreviousYear(currentYear: IResultAttributeHeaderItem) {
    const split = currentYear.uri.split("-");
    split[0] = (parseInt(split[0]) - 1).toString();
    return split.join("-");
}
