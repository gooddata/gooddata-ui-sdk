// (C) 2007-2020 GoodData Corporation
import { ICellRendererParams, ColDef, Column } from "@ag-grid-community/all-modules";
import { getMappingHeaderUri, IMappingHeader } from "@gooddata/sdk-ui";
import {
    DOT_PLACEHOLDER,
    FIELD_SEPARATOR,
    FIELD_SEPARATOR_PLACEHOLDER,
    ID_SEPARATOR,
    ID_SEPARATOR_PLACEHOLDER,
    ROW_SUBTOTAL,
    ROW_TOTAL,
    MEASURE_COLUMN,
    VALUE_CLASS,
} from "./agGridConst";
import { IGridHeader, IGridRow } from "./agGridTypes";
import escape from "lodash/escape";
import {
    isTotalDescriptor,
    isMeasureGroupDescriptor,
    IExecutionResult,
    IAttributeDescriptor,
    IMeasureDescriptor,
    isMeasureDescriptor,
} from "@gooddata/sdk-backend-spi";
import { IDimension, IAttributeLocatorItem } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

/*
 * Assorted utility functions used in our Pivot Table -> ag-grid integration.
 */

export const sanitizeField = (field: string): string =>
    // Identifiers can not contain a dot character, because AGGrid cannot handle it.
    // Alternatively, we could handle it with a custom renderer (works in RowLoadingElement).
    field
        .replace(/\./g, DOT_PLACEHOLDER)
        .replace(new RegExp(FIELD_SEPARATOR, "g"), FIELD_SEPARATOR_PLACEHOLDER)
        .replace(new RegExp(ID_SEPARATOR, "g"), ID_SEPARATOR_PLACEHOLDER);

// returns [attributeId, attributeValueId]
// attributeValueId can be null if supplied with attribute uri instead of attribute value uri
export const getIdsFromUri = (uri: string, sanitize = true): (string | null)[] => {
    const [, attributeId, , attributeValueId = null] = uri.match(/obj\/([^/]*)(\/elements\?id=)?(.*)?$/)!;
    return [attributeId, attributeValueId].map((id: string | null) =>
        id && sanitize ? sanitizeField(id) : id,
    );
};

export const getParsedFields = (colId: string): string[][] => {
    // supported colIds are 'a_2009', 'a_2009_4-a_2071_12', 'a_2009_4-a_2071_12-m_3'
    return colId.split(FIELD_SEPARATOR).map((field: string) => field.split(ID_SEPARATOR));
};

export const colIdIsSimpleAttribute = (colId: string): boolean => {
    const parsedFields = getParsedFields(colId);
    return parsedFields[0].length === 2 && parsedFields[0][0] === "a";
};

export const getRowNodeId = (item: IGridRow["headerItemMap"]): string => {
    return Object.keys(item.headerItemMap)
        .map((key) => {
            const mappingHeader: IMappingHeader = item.headerItemMap[key];

            if (isTotalDescriptor(mappingHeader)) {
                return `${key}${ID_SEPARATOR}${mappingHeader.totalHeaderItem.name}`;
            }

            const uri = getMappingHeaderUri(mappingHeader);
            const ids = getIdsFromUri(uri!);
            return `${key}${ID_SEPARATOR}${ids[1]}`;
        })
        .join(FIELD_SEPARATOR);
};

export const getGridIndex = (position: number, gridDistance: number): number => {
    return Math.floor(position / gridDistance);
};

export const isSomeTotal = (rowType: string): boolean => {
    const isRowTotal = rowType === ROW_TOTAL;
    const isRowSubtotal = rowType === ROW_SUBTOTAL;
    return isRowTotal || isRowSubtotal;
};

export const cellRenderer = (params: ICellRendererParams): string => {
    const isRowTotalOrSubtotal = params.data && params.data.type && isSomeTotal(params.data.type);

    const isActiveRowTotal =
        isRowTotalOrSubtotal && // short circuit for non row totals
        params.data &&
        params.data.rowTotalActiveMeasures &&
        params.data.rowTotalActiveMeasures.some((measureColId: string) =>
            params.colDef.field!.endsWith(measureColId),
        );

    const formattedValue =
        isRowTotalOrSubtotal && !isActiveRowTotal && !params.value
            ? "" // inactive row total cells should be really empty (no "-") when they have no value (RAIL-1525)
            : escape(params.formatValue(params.value));
    const className = params.node.rowPinned === "top" ? "gd-sticky-header-value" : VALUE_CLASS;
    return `<span class="${className}">${formattedValue || ""}</span>`;
};

export const getTreeLeaves = (
    tree: IGridHeader[] | IGridHeader,
    getChildren = (node: any) => node && node.children,
): IGridHeader[] => {
    const leaves: IGridHeader[] = [];
    const nodes = Array.isArray(tree) ? [...tree] : [tree];
    let node;
    let children;
    while (
        ((node = nodes.shift()),
        (children = getChildren(node)),
        (children && children.length) || (leaves.push(node!) && nodes.length))
    ) {
        if (children) {
            nodes.push(...children);
        }
    }
    return leaves;
};

export const indexOfTreeNode = (
    node: IGridHeader,
    tree: IGridHeader[],
    matchNode = (nodeA: any, nodeB: any) => nodeA === nodeB,
    getChildren = (node: any) => (node && node.children) || [],
    indexes: number[] = [],
): number[] | null => {
    const nodes = Array.isArray(tree) ? [...tree] : [tree];
    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
        const currentNode = nodes[nodeIndex];
        // match current node
        if (matchNode(currentNode, node)) {
            return [...indexes, nodeIndex];
        }
        // check children
        const childrenMatchIndexes = indexOfTreeNode(node, getChildren(currentNode), matchNode, getChildren, [
            ...indexes,
            nodeIndex,
        ]);
        if (childrenMatchIndexes !== null) {
            return childrenMatchIndexes;
        }
    }
    return null;
};

export function getMeasureFormat(gridHeader: IGridHeader, result: IExecutionResult): string {
    const headers = result.dimensions[1].headers;
    const header = headers[headers.length - 1];

    if (!isMeasureGroupDescriptor(header)) {
        throw new Error(`Cannot get measure format from header ${Object.keys(header)}`);
    }

    const measureIndex = gridHeader.measureIndex!;
    return header.measureGroupHeader.items[measureIndex].measureHeaderItem.format;
}

export function getSubtotalStyles(dimension: IDimension | undefined): (string | null)[] {
    if (!dimension || !dimension.totals) {
        return [];
    }

    let even = false;
    const subtotalStyles = dimension.itemIdentifiers.slice(1).map((attributeIdentifier) => {
        const hasSubtotal =
            dimension.totals?.some((total) => total.attributeIdentifier === attributeIdentifier) ?? false;

        if (hasSubtotal) {
            even = !even;
            return even ? "even" : "odd";
        }

        return null;
    });

    // Grand total (first) has no styles
    return [null, ...subtotalStyles];
}

export function getLastFieldType(fields: string[][]): string {
    const [lastFieldType] = fields[fields.length - 1];
    return lastFieldType;
}

export function getLastFieldId(fields: string[][]): string {
    const [, lastFieldId] = fields[fields.length - 1];
    return lastFieldId;
}

export function getAttributeLocators(
    fields: string[][],
    attributeHeaders: IAttributeDescriptor[],
): IAttributeLocatorItem[] {
    return fields.slice(0, -1).map((field: string[]) => {
        // first item is type which should be always 'a'
        const [, fieldId, fieldValueId] = field;
        const attributeHeaderMatch = attributeHeaders.find((attributeHeader: IAttributeDescriptor) => {
            return getIdsFromUri(attributeHeader.attributeHeader.formOf.uri)[0] === fieldId;
        });
        invariant(
            attributeHeaderMatch,
            `Could not find matching attribute header to field ${field.join(ID_SEPARATOR)}`,
        );
        return {
            attributeLocatorItem: {
                attributeIdentifier: attributeHeaderMatch!.attributeHeader.localIdentifier,
                element: `${attributeHeaderMatch!.attributeHeader.formOf.uri}/elements?id=${fieldValueId}`,
            },
        };
    });
}

export const getColumnIdentifierFromDef = (colDef: IGridHeader | ColDef): string => {
    // field should be always present, fallback to colId could happen for empty columns
    return colDef.field || colDef.colId!;
};

export const getColumnIdentifier = (item: Column | IGridHeader | ColDef): string => {
    if (isColumn(item)) {
        return getColumnIdentifierFromDef(item.getColDef());
    }
    return getColumnIdentifierFromDef(item);
};

function isColumn(item: Column | ColDef): item is Column {
    return !!(item as Column).getColDef;
}

export const isMeasureColumn = (item: Column | ColDef): boolean => {
    if (isColumn(item)) {
        return item.getColDef().type === MEASURE_COLUMN;
    }
    return item.type === MEASURE_COLUMN;
};

export const isColumnDisplayed = (displayedColumns: Column[], column: Column): boolean => {
    return displayedColumns.some((displayedColumn) => displayedColumn.getColId() === column.getColId());
};

const getMappingHeaderMeasureItem = (item: Column | ColDef): IMeasureDescriptor | undefined => {
    if (!isMeasureColumn(item)) {
        return;
    }

    const headers: IMappingHeader[] = isColumn(item)
        ? (item.getColDef() as IGridHeader).drillItems
        : (item as IGridHeader).drillItems;

    if (headers) {
        return headers.filter(isMeasureDescriptor)[0];
    }
};

export const getMappingHeaderMeasureItemLocalIdentifier = (item: Column | ColDef): string | undefined => {
    const measure = getMappingHeaderMeasureItem(item);
    if (measure) {
        return measure.measureHeaderItem.localIdentifier;
    }
};
