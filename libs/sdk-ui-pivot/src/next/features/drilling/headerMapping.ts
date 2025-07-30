// (C) 2025 GoodData Corporation
import { isMeasureDescriptor } from "@gooddata/sdk-model";
import {
    ITableDataHeaderScope,
    IMappingHeader,
    ITableRowDefinition,
    ITableColumnDefinition,
} from "@gooddata/sdk-ui";

function extractMappingHeadersUpToPosition(
    scopes: ITableDataHeaderScope[],
    position: number,
): IMappingHeader[] {
    return scopes.flatMap((scope: ITableDataHeaderScope, scopeIndex: number) => {
        if (scopeIndex > position) {
            return [];
        }

        if (scope.type === "measureGroupScope") {
            throw new Error("measureGroupScope header is not supported");
        }

        if (scope.type !== "measureScope") {
            return [scope.header, scope.descriptor];
        }

        return [scope.descriptor];
    });
}

function extractMappingHeadersAtPosition(
    scopes: ITableDataHeaderScope[],
    position: number,
): IMappingHeader[] {
    return scopes.flatMap((scope: ITableDataHeaderScope, scopeIndex: number) => {
        if (scopeIndex !== position) {
            return [];
        }

        if (scope.type === "measureGroupScope") {
            throw new Error("measureGroupScope header is not supported");
        }

        if (scope.type !== "measureScope") {
            return [scope.header, scope.descriptor];
        }

        return [scope.descriptor];
    });
}

function extractAllMappingHeaders(scopes: ITableDataHeaderScope[]): IMappingHeader[] {
    return scopes.flatMap((scope: ITableDataHeaderScope) => {
        if (scope.type === "measureGroupScope") {
            throw new Error("measureGroupScope header is not supported");
        }

        if (scope.type !== "measureScope") {
            return [scope.header, scope.descriptor];
        }

        return [scope.descriptor];
    });
}

export function extractAllColumnMappingHeaders(columnDefinition: ITableColumnDefinition): IMappingHeader[] {
    if (
        columnDefinition.type === "value" ||
        columnDefinition.type === "subtotal" ||
        columnDefinition.type === "grandTotal"
    ) {
        return extractAllMappingHeaders(columnDefinition.columnScope);
    }

    return [];
}

export function extractRowMappingHeadersAtPosition(
    rowDefinition: ITableRowDefinition,
    position: number,
): IMappingHeader[] {
    if (rowDefinition.type === "value" || rowDefinition.type === "subtotal") {
        return extractMappingHeadersAtPosition(rowDefinition.rowScope, position);
    }

    return [];
}

export function extractRowMappingHeadersUpToPosition(
    rowDefinition: ITableRowDefinition,
    position: number,
): IMappingHeader[] {
    if (rowDefinition.type === "value" || rowDefinition.type === "subtotal") {
        return extractMappingHeadersUpToPosition(rowDefinition.rowScope, position);
    }

    return [];
}

export function extractAllRowMappingHeaders(rowDefinition: ITableRowDefinition): IMappingHeader[] {
    if (rowDefinition.type === "value" || rowDefinition.type === "subtotal") {
        return extractAllMappingHeaders(rowDefinition.rowScope);
    }

    return [];
}

export function extractAllRowMeasureMappingHeaders(rowDefinition: ITableRowDefinition): IMappingHeader[] {
    if (rowDefinition.type === "value" || rowDefinition.type === "subtotal") {
        return extractAllMappingHeaders(rowDefinition.rowScope).filter((header) =>
            isMeasureDescriptor(header),
        );
    }

    return [];
}
