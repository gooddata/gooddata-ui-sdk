// (C) 2025 GoodData Corporation
import { type ILocatorItem, newAttributeLocatorWithNullElement } from "@gooddata/sdk-model";
import { type ITableDataHeaderScope } from "@gooddata/sdk-ui";

/**
 * Creates locator items for the given column scope.
 *
 * @internal
 */
export function columnScopeToLocators(columnScope: ITableDataHeaderScope[]): ILocatorItem[] {
    return columnScope.flatMap((scope): ILocatorItem[] => {
        if (scope.type === "attributeScope") {
            return [
                newAttributeLocatorWithNullElement(
                    scope.descriptor.attributeHeader.localIdentifier,
                    scope.header.attributeHeaderItem.uri,
                ),
            ];
        }

        if (scope.type === "attributeTotalScope") {
            return [
                {
                    totalLocatorItem: {
                        attributeIdentifier: scope.descriptor.attributeHeader.localIdentifier,
                        totalFunction: scope.header.totalHeaderItem.type,
                    },
                },
            ];
        }

        if (scope.type === "measureTotalScope" || scope.type === "measureScope") {
            return [
                {
                    measureLocatorItem: {
                        measureIdentifier: scope.descriptor.measureHeaderItem.localIdentifier,
                    },
                },
            ];
        }

        return [];
    });
}
