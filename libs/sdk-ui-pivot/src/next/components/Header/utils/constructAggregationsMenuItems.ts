// (C) 2025 GoodData Corporation

import compact from "lodash/compact.js";
import isEqual from "lodash/isEqual.js";
import { IntlShape } from "react-intl";

import { IAttribute, IAttributeDescriptor, ITotal, TotalType, newTotal } from "@gooddata/sdk-model";

import { getPreviousAttributeHeaderName } from "./common.js";
import { messages } from "../../../../locales.js";
import { DEFAULT_TOTAL_FUNCTIONS } from "../../../constants/internal.js";
import { IAggregationsMenuItem, IAggregationsSubMenuItem, IMenu } from "../../../types/menu.js";

/**
 * Creates total item for the main attribute.
 *
 * There may be multiple measures under the same attribute,
 * so we need to create multiple total definitions for the attribute.
 */
const createMainAttributeTotalItem = (
    attribute: IAttribute | undefined,
    totalType: TotalType,
    measureIdentifiers: string[],
    currentTotals: ITotal[],
    isColumn: boolean,
    intl: IntlShape,
): IAggregationsSubMenuItem | undefined => {
    if (!attribute) {
        return undefined;
    }

    // There may be multiple measures under the same attribute,
    // so we need to create multiple total definitions.
    const totalDefinitions = measureIdentifiers.map((measureIdentifier) =>
        newTotal(totalType, measureIdentifier, attribute.attribute.localIdentifier),
    );
    const isActive = isTotalActive(currentTotals, totalDefinitions);

    return {
        type: "aggregation" as const,
        id: `${totalType}-${isColumn ? "column" : "row"}-all`,
        title: isColumn
            ? intl.formatMessage(messages["allColumns"])
            : intl.formatMessage(messages["allRows"]),
        isColumn,
        isActive,
        totalDefinitions,
    };
};

/**
 * Creates total items for other attributes than main attribute.
 */
const createOtherAttributeTotalItems = (
    attributes: IAttribute[],
    descriptors: IAttributeDescriptor[],
    totalType: TotalType,
    measureIdentifiers: string[],
    currentTotals: ITotal[],
    isColumn: boolean,
    intl: IntlShape,
): IAggregationsSubMenuItem[] => {
    return compact(
        attributes.map((attribute) => {
            // There may be multiple measures under the same attribute,
            // so we need to create multiple total definitions.
            const totalDefinitions = measureIdentifiers.map((measureIdentifier) =>
                newTotal(totalType, measureIdentifier, attribute.attribute.localIdentifier),
            );
            const isActive = isTotalActive(currentTotals, totalDefinitions);

            if (totalDefinitions.length === 0) {
                return undefined;
            }

            return {
                type: "aggregation" as const,
                id: `${totalType}-${isColumn ? "column" : "row"}-${attribute.attribute.localIdentifier}`,
                title: intl.formatMessage(messages["withinAttribute"], {
                    attributeName: getPreviousAttributeHeaderName(
                        attribute.attribute.localIdentifier,
                        descriptors,
                    ),
                }),
                isColumn,
                isActive,
                totalDefinitions,
            };
        }),
    );
};

/**
 * Creates aggregation submenu items for specified measures on a cell.
 *
 * @param mainAttribute - The main attribute
 * @param otherAttributes - The other attributes
 * @param descriptors - The descriptors of the attributes
 * @param totalType - The total type
 * @param measureIdentifiers - The identifiers of the measures
 * @param currentTotals - The current totals
 * @param isColumn - Whether the total is for a column
 * @param disabledTooltip - The disabled tooltip
 * @returns The aggregation menu items
 */
const constructAggregationsSubMenuItems = (
    mainAttribute: IAttribute | undefined,
    otherAttributes: IAttribute[],
    descriptors: IAttributeDescriptor[],
    totalType: TotalType,
    measureIdentifiers: string[],
    currentTotals: ITotal[],
    isColumn: boolean,
    intl: IntlShape,
): IAggregationsSubMenuItem[] => {
    return compact([
        createMainAttributeTotalItem(
            mainAttribute,
            totalType,
            measureIdentifiers,
            currentTotals,
            isColumn,
            intl,
        ),
        ...createOtherAttributeTotalItems(
            otherAttributes,
            descriptors,
            totalType,
            measureIdentifiers,
            currentTotals,
            isColumn,
            intl,
        ),
    ]);
};

/**
 * Creates aggregation menu items for specified measures on a cell.
 *
 * @param measureIdentifiers - The identifiers of the measures
 * @param availableTotalTypes - The available total types
 * @param currentRowTotals - The current row totals
 * @param currentColumnTotals - The current column totals
 * @param rows - The rows
 * @param columns - The columns
 * @param rowAttributeDescriptors - The row attribute descriptors
 * @param pivotAttributeDescriptors - The pivot attribute descriptors
 * @param disabledTooltip - The disabled tooltip
 * @returns The aggregation menu items
 */
export const constructAggregationsMenuItems = (
    measureIdentifiers: string[],
    currentRowTotals: ITotal[],
    currentColumnTotals: ITotal[],
    rows: IAttribute[],
    columns: IAttribute[],
    rowAttributeDescriptors: IAttributeDescriptor[],
    pivotAttributeDescriptors: IAttributeDescriptor[],
    menu: IMenu,
    intl: IntlShape,
    disabledTooltip?: string,
): IAggregationsMenuItem[] => {
    // first row is the main row attribute
    const mainRowAttribute = rows.length > 0 ? rows[0] : undefined;
    const otherRowAttributes = rows.length > 0 ? rows.slice(1) : [];

    // first column is the main column attribute
    const mainColumnAttribute = columns.length > 0 ? columns[0] : undefined;
    const otherColumnAttributes = columns.length > 0 ? columns.slice(1) : [];

    const availableTotalTypes: TotalType[] = menu.aggregationTypes ?? DEFAULT_TOTAL_FUNCTIONS;
    const includeSubtotals = Boolean(menu.aggregationsSubMenu);
    const includeColumns = Boolean(menu.aggregationsSubMenuForRows);

    return availableTotalTypes.flatMap((totalType) => {
        const rowItems = constructAggregationsSubMenuItems(
            mainRowAttribute,
            includeSubtotals ? otherRowAttributes : [],
            rowAttributeDescriptors,
            totalType,
            measureIdentifiers,
            currentRowTotals,
            false,
            intl,
        );

        const columnItems = includeColumns
            ? constructAggregationsSubMenuItems(
                  mainColumnAttribute,
                  includeSubtotals ? otherColumnAttributes : [],
                  pivotAttributeDescriptors,
                  totalType,
                  measureIdentifiers,
                  currentColumnTotals,
                  true,
                  intl,
              )
            : [];

        const effectiveDisabledTooltip = totalType === "nat" && disabledTooltip ? disabledTooltip : undefined;

        return [
            {
                type: totalType,
                rows: rowItems,
                columns: columnItems,
                isDisabled: !!effectiveDisabledTooltip,
                disabledTooltip: effectiveDisabledTooltip,
            },
        ];
    });
};

/**
 * Checks if a specific total exists in the totals array.
 *
 * @remarks The total may be specified by multiple total definitions as there may be multiple measures
 * underneath the same header cell. Therefore, we check whether all total definitions are
 * present in current totals. If so, the total is active.
 *
 * @param currentTotals - Array of existing totals
 * @param totalDefinitions - Array of total definitions to check
 * @returns true if all total definitions exist in current totals, false otherwise
 */
function isTotalActive(currentTotals: ITotal[], totalDefinitions: ITotal[]): boolean {
    // If no total definitions to check, return false
    if (totalDefinitions.length === 0) {
        return false;
    }

    return totalDefinitions.every((totalDef) =>
        currentTotals.some((currentTotal) => isEqual(currentTotal, totalDef)),
    );
}
