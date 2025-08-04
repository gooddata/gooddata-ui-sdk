// (C) 2025 GoodData Corporation
import { ILocatorItem, newAttributeLocator } from "@gooddata/sdk-model";
import { ITableDataHeaderScope } from "@gooddata/sdk-ui";

/**
 * Creates locator items for the given column scope.
 *
 * @internal
 */
export function columnScopeToLocators(columnScope: ITableDataHeaderScope[]): ILocatorItem[] {
    return columnScope.flatMap((scope): ILocatorItem[] => {
        if (scope.type === "attributeScope" && scope.header.attributeHeaderItem.name) {
            return [
                newAttributeLocator(
                    scope.descriptor.attributeHeader.localIdentifier,
                    scope.header.attributeHeaderItem.name,
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
