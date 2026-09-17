// (C) 2026 GoodData Corporation

import {
    type IAttributeDescriptor,
    type IMeasureDescriptor,
    type IResultAttributeHeader,
    type IResultMeasureHeader,
    type TotalType,
    idRef,
} from "@gooddata/sdk-model";
import {
    type ITableAttributeColumnDefinition,
    type ITableColumnDefinition,
    type ITableDataAttributeTotalScope,
    type ITableGrandTotalColumnDefinition,
    type ITableGrandTotalHeaderValue,
    type ITableMeasureGroupHeaderColumnDefinition,
    type ITableSubtotalColumnDefinition,
    type ITableTotalHeaderValue,
    type ITableValueColumnDefinition,
} from "@gooddata/sdk-ui";

export function createAttributeDescriptor(attributeIdentifier: string): IAttributeDescriptor {
    return {
        attributeHeader: {
            uri: `/gdc/md/demo/obj/${attributeIdentifier}`,
            identifier: `${attributeIdentifier}.id`,
            localIdentifier: attributeIdentifier,
            ref: idRef(`${attributeIdentifier}.id`),
            name: "Region",
            formOf: {
                ref: idRef("attr.region"),
                uri: "/gdc/md/demo/obj/attr.region",
                identifier: "attr.region",
                name: "Region",
            },
            primaryLabel: idRef(`${attributeIdentifier}.id`),
        },
    };
}

export function createAttributeHeader(attributeElementUri: string): IResultAttributeHeader {
    return {
        attributeHeaderItem: {
            name: "Region",
            uri: attributeElementUri,
        },
    };
}

export function createMeasureDescriptor(measureIdentifier: string): IMeasureDescriptor {
    return {
        measureHeaderItem: {
            localIdentifier: measureIdentifier,
            name: "Amount",
            format: "#,##0.00",
            ref: idRef(measureIdentifier),
        },
    };
}

export function createMeasureHeader(): IResultMeasureHeader {
    return {
        measureHeaderItem: {
            name: "Amount",
            order: 0,
        },
    };
}

export function createValueColumnDefinition(options: {
    measureIdentifier: string;
    attributeIdentifier: string;
    attributeElementUri: string;
}): ITableColumnDefinition {
    const { measureIdentifier, attributeIdentifier, attributeElementUri } = options;

    const columnScope: ITableValueColumnDefinition["columnScope"] = [
        {
            type: "attributeScope",
            descriptor: createAttributeDescriptor(attributeIdentifier),
            header: createAttributeHeader(attributeElementUri),
        },
        {
            type: "measureScope",
            descriptor: createMeasureDescriptor(measureIdentifier),
            header: createMeasureHeader(),
        },
    ];

    const valueColumnDefinition: ITableValueColumnDefinition = {
        type: "value",
        columnIndex: 0,
        columnHeaderIndex: 0,
        isEmpty: false,
        isTransposed: false,
        columnScope,
        measureHeader: createMeasureHeader(),
        measureDescriptor: createMeasureDescriptor(measureIdentifier),
    };

    return valueColumnDefinition;
}

export function createAttributeColumnDefinition(
    attributeIdentifier: string,
    columnIndex = 0,
): ITableAttributeColumnDefinition {
    return {
        type: "attribute",
        columnIndex,
        rowHeaderIndex: 0,
        attributeDescriptor: createAttributeDescriptor(attributeIdentifier),
    };
}

export function createMeasureGroupHeaderColumnDefinition(): ITableMeasureGroupHeaderColumnDefinition {
    return {
        type: "measureGroupHeader",
        columnIndex: 0,
        measureGroupDescriptor: { measureGroupHeader: { items: [createMeasureDescriptor("measure")] } },
        attributeDescriptors: [],
    };
}

function createTotalHeader(totalWireType: string) {
    return { totalHeaderItem: { name: totalWireType.toLowerCase(), type: totalWireType } };
}

/**
 * A grand total (or overall-total) column: its columnScope carries one attributeTotalScope per
 * pivoted attribute level, outermost first — matching how a grand total spanning multiple column
 * attributes is anchored to its outermost total scope.
 */
export function createGrandTotalColumnDefinition(
    attributeIdentifiers: string[],
    totalWireType: string,
): ITableGrandTotalColumnDefinition {
    return {
        type: "grandTotal",
        columnIndex: 0,
        columnHeaderIndex: 0,
        isEmpty: false,
        isTransposed: false,
        totalHeader: createTotalHeader(totalWireType),
        measureDescriptor: createMeasureDescriptor("measure"),
        columnScope: attributeIdentifiers.map((attributeIdentifier) => ({
            type: "attributeTotalScope",
            descriptor: createAttributeDescriptor(attributeIdentifier),
            header: createTotalHeader(totalWireType),
        })),
    };
}

/**
 * A subtotal column nested under regular (non-total) attribute levels, e.g. a Quarter subtotal
 * under a Year attribute: `regularAttributeIdentifiers` are the plain attributeScope levels above
 * it, `totalAttributeIdentifier` is the attribute the subtotal itself is on.
 */
export function createSubtotalColumnDefinition(
    regularAttributeIdentifiers: string[],
    totalAttributeIdentifier: string,
    totalWireType: string,
): ITableSubtotalColumnDefinition {
    const totalScope: ITableDataAttributeTotalScope = {
        type: "attributeTotalScope",
        descriptor: createAttributeDescriptor(totalAttributeIdentifier),
        header: createTotalHeader(totalWireType),
    };

    return {
        type: "subtotal",
        columnIndex: 0,
        columnHeaderIndex: 0,
        isEmpty: false,
        isTransposed: false,
        totalHeader: createTotalHeader(totalWireType),
        measureDescriptor: createMeasureDescriptor("measure"),
        columnScope: [
            ...regularAttributeIdentifiers.map((attributeIdentifier) => ({
                type: "attributeScope" as const,
                descriptor: createAttributeDescriptor(attributeIdentifier),
                header: createAttributeHeader(`/gdc/md/demo/obj/${attributeIdentifier}`),
            })),
            totalScope,
        ],
    };
}

/**
 * A "RowSum Σ"-style grand-total row label cell (`resolveTotalLabelTargetFromTotalLabelCellData`'s
 * grandTotal input) — `columnDefinition` defaults to a plain attribute column; pass
 * `createMeasureGroupHeaderColumnDefinition()` for the transposed measure-name-cell case.
 */
export function createGrandTotalHeaderValue(options: {
    attributeIdentifier: string;
    totalType: TotalType;
    formattedValue?: string | null;
    columnDefinition?: ITableAttributeColumnDefinition | ITableMeasureGroupHeaderColumnDefinition;
    /** One entry (default) = a transposed, measure-specific row; several = coalesced/shared. */
    measureIdentifiers?: string[];
}): ITableGrandTotalHeaderValue {
    const {
        attributeIdentifier,
        totalType,
        formattedValue = null,
        columnDefinition = createAttributeColumnDefinition(attributeIdentifier),
        measureIdentifiers = ["measure"],
    } = options;

    return {
        type: "grandTotalHeader",
        formattedValue,
        rowIndex: 0,
        columnIndex: 0,
        rowDefinition: {
            type: "grandTotal",
            rowIndex: 0,
            attributeDescriptor: createAttributeDescriptor(attributeIdentifier),
            measureDescriptors: measureIdentifiers.map((measureIdentifier) =>
                createMeasureDescriptor(measureIdentifier),
            ),
            totalType,
            rowGrandTotalIndex: 0,
        },
        columnDefinition,
    };
}

/**
 * A "Sum A"-style subtotal row label cell (`resolveTotalLabelTargetFromTotalLabelCellData`'s
 * subtotal input). Pass `measureIndex` for the transposed measure-*name*-cell case (an early return,
 * not a real label). Pass `subtotalMeasureIdentifier` for a transposed, measure-specific *label*
 * cell instead - it adds a measureTotalScope sibling to the row scope without setting `measureIndex`
 * on the cell's own value (mirroring how a real transposed subtotal row carries both the attribute's
 * total scope and the measure-name total scope, but only the name COLUMN's cell has `measureIndex`).
 */
export function createSubtotalHeaderValue(options: {
    attributeIdentifier: string;
    totalWireType: string;
    totalName?: string;
    measureIndex?: number;
    subtotalMeasureIdentifier?: string;
    columnDefinition?: ITableAttributeColumnDefinition | ITableMeasureGroupHeaderColumnDefinition;
}): ITableTotalHeaderValue {
    const {
        attributeIdentifier,
        totalWireType,
        totalName = totalWireType.toLowerCase(),
        measureIndex,
        subtotalMeasureIdentifier,
        columnDefinition = createAttributeColumnDefinition(attributeIdentifier),
    } = options;

    const totalHeaderItem = {
        name: totalName,
        type: totalWireType,
        ...(measureIndex === undefined ? {} : { measureIndex }),
    };
    const attributeTotalScope: ITableDataAttributeTotalScope = {
        type: "attributeTotalScope",
        descriptor: createAttributeDescriptor(attributeIdentifier),
        header: { totalHeaderItem },
    };
    const measureTotalScopeIdentifier =
        subtotalMeasureIdentifier ?? (measureIndex === undefined ? undefined : "measure");

    return {
        type: "totalHeader",
        formattedValue: null,
        value: { totalHeaderItem },
        rowIndex: 0,
        columnIndex: 0,
        rowDefinition: {
            type: "subtotal",
            rowIndex: 0,
            rowScope:
                measureTotalScopeIdentifier === undefined
                    ? [attributeTotalScope]
                    : [
                          attributeTotalScope,
                          {
                              type: "measureTotalScope",
                              descriptor: createMeasureDescriptor(measureTotalScopeIdentifier),
                              header: { totalHeaderItem },
                          },
                      ],
        },
        columnDefinition,
    };
}
