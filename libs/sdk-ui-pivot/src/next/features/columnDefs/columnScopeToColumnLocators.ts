// (C) 2025 GoodData Corporation
import { assertNever } from "@gooddata/sdk-model";
import { ITableDataHeaderScope } from "@gooddata/sdk-ui";
import {
    ColumnLocator,
    newAttributeColumnLocator,
    newMeasureColumnLocator,
    newTotalColumnLocator,
} from "../../types/sizing.js";
import isNil from "lodash/isNil.js";

/**
 * @internal
 */
export function columnScopeToColumnLocators(scope: ITableDataHeaderScope[]): ColumnLocator[] {
    return scope.map(columnScopeToColumnLocator).filter((x) => !isNil(x));
}

/**
 * @internal
 */
function columnScopeToColumnLocator(scope: ITableDataHeaderScope): ColumnLocator | undefined {
    switch (scope.type) {
        case "attributeScope":
            return newAttributeColumnLocator(scope.descriptor.attributeHeader.localIdentifier);
        case "attributeTotalScope":
            return newTotalColumnLocator(
                scope.descriptor.attributeHeader.localIdentifier,
                scope.header.totalHeaderItem.type,
            );
        case "measureTotalScope":
        case "measureScope":
            return newMeasureColumnLocator(scope.descriptor.measureHeaderItem.localIdentifier);
        case "measureGroupScope":
            return undefined;
        default: {
            assertNever(scope);
        }
    }

    return undefined;
}
