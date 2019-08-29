// (C) 2007-2019 GoodData Corporation
import { ICellRendererParams } from "ag-grid-community";
import omit = require("lodash/omit");
import escape = require("lodash/escape");
import stringify = require("json-stable-stringify");
import { AFM, Execution } from "@gooddata/typings";
import { getMappingHeaderUri } from "../../../helpers/mappingHeader";
import { IMappingHeader, isMappingHeaderTotal } from "../../../interfaces/MappingHeader";
import {
    DOT_PLACEHOLDER,
    FIELD_SEPARATOR,
    FIELD_SEPARATOR_PLACEHOLDER,
    ID_SEPARATOR,
    ID_SEPARATOR_PLACEHOLDER,
    ROW_TOTAL,
    ROW_SUBTOTAL,
} from "./agGridConst";
import { IGridHeader } from "./agGridTypes";

/*
 * Assorted utility functions used in our Pivot Table -> ag-grid integration.
 */

export const sanitizeField = (field: string) =>
    // Identifiers can not contain a dot character, because AGGrid cannot handle it.
    // Alternatively, we could handle it with a custom renderer (works in RowLoadingElement).
    field
        .replace(/\./g, DOT_PLACEHOLDER)
        .replace(new RegExp(FIELD_SEPARATOR, "g"), FIELD_SEPARATOR_PLACEHOLDER)
        .replace(new RegExp(ID_SEPARATOR, "g"), ID_SEPARATOR_PLACEHOLDER);

// returns [attributeId, attributeValueId]
// attributeValueId can be null if supplied with attribute uri instead of attribute value uri
export const getIdsFromUri = (uri: string, sanitize = true) => {
    const [, attributeId, , attributeValueId = null] = uri.match(/obj\/([^\/]*)(\/elements\?id=)?(.*)?$/);
    return [attributeId, attributeValueId].map((id: string | null) =>
        id && sanitize ? sanitizeField(id) : id,
    );
};

export const getParsedFields = (colId: string): string[][] => {
    // supported colIds are 'a_2009', 'a_2009_4-a_2071_12', 'a_2009_4-a_2071_12-m_3'
    return colId.split(FIELD_SEPARATOR).map((field: string) => field.split(ID_SEPARATOR));
};

export const colIdIsSimpleAttribute = (colId: string) => {
    const parsedFields = getParsedFields(colId);
    return parsedFields[0].length === 2 && parsedFields[0][0] === "a";
};

export const getRowNodeId = (item: any) => {
    return Object.keys(item.headerItemMap)
        .map(key => {
            const mappingHeader: IMappingHeader = item.headerItemMap[key];

            if (isMappingHeaderTotal(mappingHeader)) {
                return `${key}${ID_SEPARATOR}${mappingHeader.totalHeaderItem.name}`;
            }

            const uri = getMappingHeaderUri(mappingHeader);
            const ids = getIdsFromUri(uri);
            return `${key}${ID_SEPARATOR}${ids[1]}`;
        })
        .join(FIELD_SEPARATOR);
};

export const getGridIndex = (position: number, gridDistance: number) => {
    return Math.floor(position / gridDistance);
};

export const cellRenderer = (params: ICellRendererParams) => {
    const isRowTotalOrSubtotal =
        params.data &&
        params.data.type &&
        (params.data.type === ROW_TOTAL || params.data.type === ROW_SUBTOTAL);

    const isActiveRowTotal =
        isRowTotalOrSubtotal && // short circuit for non row totals
        params.data &&
        params.data.rowTotalActiveMeasures &&
        params.data.rowTotalActiveMeasures.some((measureColId: string) =>
            params.colDef.field.endsWith(measureColId),
        );

    const formattedValue =
        isRowTotalOrSubtotal && !isActiveRowTotal && !params.value
            ? "" // inactive row total cells should be really empty (no "-") when they have no value (RAIL-1525)
            : escape(params.formatValue(params.value));
    const className = params.node.rowPinned === "top" ? "gd-sticky-header-value" : "s-value";
    return `<span class="${className}">${formattedValue || ""}</span>`;
};

export const getTreeLeaves = (tree: any, getChildren = (node: any) => node && node.children) => {
    const leaves = [];
    const nodes = Array.isArray(tree) ? [...tree] : [tree];
    let node;
    let children;
    while (
        // tslint:disable:no-conditional-assignment ban-comma-operator
        ((node = nodes.shift()),
        (children = getChildren(node)),
        (children && children.length) || (leaves.push(node) && nodes.length))
        // tslint:enable:no-conditional-assignment ban-comma-operator
    ) {
        if (children) {
            nodes.push(...children);
        }
    }
    return leaves;
};

export const indexOfTreeNode = (
    node: any,
    tree: any,
    matchNode = (nodeA: any, nodeB: any) => nodeA === nodeB,
    getChildren = (node: any) => (node && node.children) || [],
    indexes: number[] = [],
): number[] => {
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

export function isMeasureColumnReadyToRender(params: any, execution: Execution.IExecutionResponses): boolean {
    return Boolean(params && params.value !== undefined && execution && execution.executionResponse);
}

export function getMeasureFormat(gridHeader: IGridHeader, execution: Execution.IExecutionResponses): string {
    const headers = execution.executionResponse.dimensions[1].headers;
    const header = headers[headers.length - 1];

    if (!Execution.isMeasureGroupHeader(header)) {
        throw new Error(`Cannot get measure format from header ${Object.keys(header)}`);
    }

    const measureIndex = gridHeader.measureIndex;
    return header.measureGroupHeader.items[measureIndex].measureHeaderItem.format;
}

export function getSubtotalStyles(dimension: AFM.IDimension): string[] {
    if (!dimension || !dimension.totals) {
        return [];
    }

    let even = false;
    const subtotalStyles = dimension.itemIdentifiers.slice(1).map(attributeIdentifier => {
        const hasSubtotal = dimension.totals.some(total => total.attributeIdentifier === attributeIdentifier);

        if (hasSubtotal) {
            even = !even;
            return even ? "even" : "odd";
        }

        return null;
    });

    // Grand total (first) has no styles
    return [null, ...subtotalStyles];
}

export function generateAgGridComponentKey(afm: AFM.IAfm, rendererId: number): string {
    const afmWithoutTotals: Partial<AFM.IAfm> = omit<AFM.IAfm>(afm, ["nativeTotals"]);
    return `agGridKey-${stringify(afmWithoutTotals)}-${rendererId}`;
}
