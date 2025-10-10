// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import {
    IPushData,
    ITableColumnDefinition,
    ITableDataHeaderScope,
    isAttributeColumnDefinition,
    isAttributeScope,
    isAttributeTotalScope,
} from "@gooddata/sdk-ui";

import {
    ITextWrappingMenuOptions,
    constructTextWrappingMenuItems,
} from "../../components/Header/utils/constructTextWrappingMenuItems.js";
import { useAgGridApi } from "../../context/AgGridApiContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { createColumnTextWrappingItemForColumnDefinition } from "../../features/textWrapping/createColumnTextWrappingItemForColumnDefinition.js";
import { getColumnTextWrappingItemForColumnDefinition } from "../../features/textWrapping/getColumnTextWrappingItemForColumnDefinition.js";
import { getPivotGroupTextWrappingItemForColumnDefinition } from "../../features/textWrapping/getPivotGroupTextWrappingItemForColumnDefinition.js";
import { isColumnTextWrappingItemMatch } from "../../features/textWrapping/isColumnTextWrappingItemMatch.js";
import {
    AgGridApi,
    AgGridColumnDef,
    AgGridHeaderGroupParams,
    AgGridHeaderParams,
    isAgGridHeaderGroupParams,
} from "../../types/agGrid.js";
import { isAttributeColumnLocator } from "../../types/locators.js";
import { ITextWrappingMenuItem } from "../../types/menu.js";
import { IColumnTextWrappingItem, ITextWrapping } from "../../types/textWrapping.js";
import { useGetAgGridColumns } from "../columns/useGetAgGridColumns.js";
import { useUpdateAgGridColumnDefs } from "../columns/useUpdateAgGridColumnDefs.js";

/**
 * Hook for header cell components that handles menu items and callbacks for per-column text wrapping.
 *
 * @param agGridHeaderParams - ag-grid header or header group params to identify the current column(s)
 * @param options - options to control which text wrapping items to show
 * @returns Menu items and callbacks
 */
export const useHeaderMenuTextWrapping = (
    agGridHeaderParams: AgGridHeaderParams | AgGridHeaderGroupParams | null,
    options?: ITextWrappingMenuOptions,
) => {
    const intl = useIntl();
    const { config, pushData } = usePivotTableProps();
    const { agGridApi } = useAgGridApi();
    const getAgGridColumns = useGetAgGridColumns();
    const updateAgGridColumnDefs = useUpdateAgGridColumnDefs();

    // Determine if this is a group header or regular header
    const isGroupHeader = agGridHeaderParams ? isAgGridHeaderGroupParams(agGridHeaderParams) : false;

    // Extract pivot group depth for this header (used for exact depth matching)
    const pivotGroupDepth = useMemo(() => {
        if (!isGroupHeader || !agGridHeaderParams) {
            return undefined;
        }
        return (agGridHeaderParams as AgGridHeaderGroupParams).columnGroup.getColGroupDef()
            ?.headerGroupComponentParams?.pivotGroupDepth;
    }, [isGroupHeader, agGridHeaderParams]);

    // Get all column definitions affected by this header (single column or all leaf columns in group)
    const leafColumnDefinitions = useMemo<ITableColumnDefinition[]>(() => {
        if (!agGridHeaderParams) {
            return [];
        }

        if (isGroupHeader) {
            // Get all leaf columns under this group
            const groupParams = agGridHeaderParams as AgGridHeaderGroupParams;
            const leafColumns = groupParams.columnGroup.getLeafColumns();
            return leafColumns
                .map((column) => {
                    const colDef = column.getColDef() as AgGridColumnDef;
                    return colDef.context?.columnDefinition;
                })
                .filter((def): def is ITableColumnDefinition => def !== undefined);
        } else {
            // Regular header - just this column
            const headerParams = agGridHeaderParams as AgGridHeaderParams;
            const columnDefinition = headerParams.column.getColDef()?.context?.columnDefinition;
            return columnDefinition ? [columnDefinition] : [];
        }
    }, [agGridHeaderParams, isGroupHeader]);

    // Calculate effective wrapping state for this specific header
    const { effectiveWrapText, effectiveWrapHeaderText } = useMemo(() => {
        return calculateEffectiveWrapping(
            leafColumnDefinitions,
            isGroupHeader,
            pivotGroupDepth,
            config.textWrapping,
        );
    }, [leafColumnDefinitions, isGroupHeader, pivotGroupDepth, config.textWrapping]);

    const textWrappingItems = constructTextWrappingMenuItems(
        { textWrapping: { wrapText: effectiveWrapText, wrapHeaderText: effectiveWrapHeaderText } },
        intl,
        options,
    );

    const handleTextWrappingItemClick = useCallback(
        (item: ITextWrappingMenuItem) => {
            if (leafColumnDefinitions.length === 0 || !agGridApi) {
                return;
            }

            const effectiveItem = textWrappingItems.find((i) => i.id === item.id);
            if (!effectiveItem) {
                return;
            }

            // Calculate new wrapping values
            const { newWrapText, newWrapHeaderText } = calculateNewWrappingValues(
                effectiveItem,
                effectiveWrapText,
                effectiveWrapHeaderText,
            );

            // Create overrides for affected columns
            const newOverrides = createOverridesForColumns(
                leafColumnDefinitions,
                isGroupHeader,
                pivotGroupDepth,
                newWrapText,
                newWrapHeaderText,
            );

            // Merge and clean up overrides
            const updatedOverrides = mergeAndCleanupOverrides(
                config.textWrapping?.columnOverrides ?? [],
                newOverrides,
                newWrapText,
                newWrapHeaderText,
                config.textWrapping?.wrapText,
                config.textWrapping?.wrapHeaderText,
            );

            // Apply to AG-Grid
            applyTextWrappingToAgGrid(
                agGridApi,
                getAgGridColumns,
                updateAgGridColumnDefs,
                updatedOverrides,
                config.textWrapping?.wrapText,
                config.textWrapping?.wrapHeaderText,
            );

            // Persist to insight
            persistTextWrappingToInsight(pushData, config.textWrapping, updatedOverrides);
        },
        [
            leafColumnDefinitions,
            agGridApi,
            textWrappingItems,
            effectiveWrapText,
            effectiveWrapHeaderText,
            config.textWrapping,
            getAgGridColumns,
            updateAgGridColumnDefs,
            pushData,
            isGroupHeader,
            pivotGroupDepth,
        ],
    );

    return {
        textWrappingItems,
        handleTextWrappingItemClick,
    };
};

// ============================================================================
// Helper Functions (Pure, Immutable)
// ============================================================================

/**
 * Helper: Filter attribute and total scopes from column scopes
 * @returns New array of filtered scopes
 */
function getAttributeScopes(columnDef: ITableColumnDefinition): ITableDataHeaderScope[] {
    if (isAttributeColumnDefinition(columnDef) || !("columnScope" in columnDef)) {
        return [];
    }
    return columnDef.columnScope.filter(
        (s: ITableDataHeaderScope) => isAttributeScope(s) || isAttributeTotalScope(s),
    );
}

/**
 * Helper: Extract element value from a scope at a specific depth
 * @returns Element value or null
 */
function getElementFromScope(scope: ITableDataHeaderScope): string | null {
    if (isAttributeScope(scope)) {
        return scope.header.attributeHeaderItem.uri ?? null;
    }
    if (isAttributeTotalScope(scope)) {
        return scope.header.totalHeaderItem.type;
    }
    return null;
}

/**
 * Helper: Check if leaf columns have different elements at a given depth
 * Returns true if they have different elements (attribute-level group)
 */
function hasLeavesWithDifferentElements(
    leafColumnDefinitions: ITableColumnDefinition[],
    depth: number,
): boolean {
    if (leafColumnDefinitions.length <= 1) {
        return false;
    }

    const firstLeaf = leafColumnDefinitions[0];
    const firstScopes = getAttributeScopes(firstLeaf);

    if (firstScopes.length <= depth) {
        return false;
    }

    const firstElement = getElementFromScope(firstScopes[depth]);

    return leafColumnDefinitions.some((def) => {
        const scopes = getAttributeScopes(def);
        if (scopes.length <= depth) return false;
        const element = getElementFromScope(scopes[depth]);
        return element !== firstElement;
    });
}

/**
 * Helper: Build expected attribute IDs for a pivot group at a specific depth
 * @returns New array of attribute IDs
 */
function getExpectedAttributeIds(columnDef: ITableColumnDefinition, depth: number): string[] {
    const scopes = getAttributeScopes(columnDef);
    return scopes
        .slice(0, depth + 1)
        .map((s: ITableDataHeaderScope) => {
            if (isAttributeScope(s) || isAttributeTotalScope(s)) {
                return s.descriptor.attributeHeader.localIdentifier;
            }
            return "";
        })
        .filter((id) => id !== "");
}

/**
 * Helper: Build expected element values for a pivot group at a specific depth
 * @returns New array of element values
 */
function getExpectedElements(columnDef: ITableColumnDefinition, depth: number): (string | null)[] {
    const scopes = getAttributeScopes(columnDef);
    return scopes.slice(0, depth + 1).map((s) => getElementFromScope(s));
}

/**
 * Helper: Find an exact depth override for a pivot group
 * @returns Matching override or undefined
 */
function findExactDepthOverride(
    columnOverrides: IColumnTextWrappingItem[],
    expectedAttributeIds: string[],
    expectedElements: (string | null)[],
    expectAttributeLevel: boolean,
): IColumnTextWrappingItem | undefined {
    return columnOverrides.find((item) => {
        if (item.matchType !== "pivotGroup") {
            return false;
        }

        const attributeLocators = item.locators.filter(isAttributeColumnLocator);

        // Must have exactly the same number of attributes (not more, not less)
        if (attributeLocators.length !== expectedAttributeIds.length) {
            return false;
        }

        // Check if identifiers match
        const idsMatch = attributeLocators.every(
            (loc, idx) => loc.attributeLocatorItem.attributeIdentifier === expectedAttributeIds[idx],
        );
        if (!idsMatch) {
            return false;
        }

        // Check element matching based on what we expect
        const hasElements = attributeLocators.some((loc) => loc.attributeLocatorItem.element !== undefined);

        if (expectAttributeLevel) {
            // We expect attribute-level (no elements), locator must also have no elements
            return !hasElements;
        } else {
            // We expect element-specific, check if elements match
            if (!hasElements) {
                return false; // Locator is attribute-level but we expect element-specific
            }
            return attributeLocators.every(
                (loc, idx) => loc.attributeLocatorItem.element === expectedElements[idx],
            );
        }
    });
}

/**
 * Helper: Calculate effective wrapping state for a header
 * @returns Effective wrapText and wrapHeaderText values
 */
function calculateEffectiveWrapping(
    leafColumnDefinitions: ITableColumnDefinition[],
    isGroupHeader: boolean,
    pivotGroupDepth: number | undefined,
    textWrapping: ITextWrapping | undefined,
): { effectiveWrapText: boolean | undefined; effectiveWrapHeaderText: boolean | undefined } {
    const defaultWrapping = {
        effectiveWrapText: textWrapping?.wrapText,
        effectiveWrapHeaderText: textWrapping?.wrapHeaderText,
    };

    if (leafColumnDefinitions.length === 0) {
        return defaultWrapping;
    }

    // For pivot group headers
    if (isGroupHeader && pivotGroupDepth !== undefined) {
        return calculateEffectiveWrappingForPivotGroup(
            leafColumnDefinitions,
            pivotGroupDepth,
            textWrapping,
            defaultWrapping,
        );
    }

    // For regular headers
    return calculateEffectiveWrappingForRegularHeader(leafColumnDefinitions[0], textWrapping);
}

/**
 * Helper: Calculate effective wrapping for pivot group headers
 */
function calculateEffectiveWrappingForPivotGroup(
    leafColumnDefinitions: ITableColumnDefinition[],
    pivotGroupDepth: number,
    textWrapping: ITextWrapping | undefined,
    defaultWrapping: { effectiveWrapText: boolean | undefined; effectiveWrapHeaderText: boolean | undefined },
): { effectiveWrapText: boolean | undefined; effectiveWrapHeaderText: boolean | undefined } {
    const columnDef = leafColumnDefinitions[0];
    const scopes = getAttributeScopes(columnDef);

    if (scopes.length === 0) {
        return defaultWrapping;
    }

    const expectedAttributeIds = getExpectedAttributeIds(columnDef, pivotGroupDepth);
    const expectedElements = getExpectedElements(columnDef, pivotGroupDepth);
    const expectAttributeLevel = hasLeavesWithDifferentElements(leafColumnDefinitions, pivotGroupDepth);

    const exactDepthOverride = findExactDepthOverride(
        textWrapping?.columnOverrides ?? [],
        expectedAttributeIds,
        expectedElements,
        expectAttributeLevel,
    );

    return {
        effectiveWrapText: exactDepthOverride ? exactDepthOverride.wrapText : textWrapping?.wrapText,
        effectiveWrapHeaderText: exactDepthOverride
            ? exactDepthOverride.wrapHeaderText
            : textWrapping?.wrapHeaderText,
    };
}

/**
 * Helper: Calculate effective wrapping for regular headers
 */
function calculateEffectiveWrappingForRegularHeader(
    columnDef: ITableColumnDefinition,
    textWrapping: ITextWrapping | undefined,
): { effectiveWrapText: boolean | undefined; effectiveWrapHeaderText: boolean | undefined } {
    const override = getColumnTextWrappingItemForColumnDefinition(
        columnDef,
        textWrapping?.columnOverrides ?? [],
    );

    return {
        effectiveWrapText: override?.wrapText ?? textWrapping?.wrapText,
        effectiveWrapHeaderText: override?.wrapHeaderText ?? textWrapping?.wrapHeaderText,
    };
}

/**
 * Helper: Calculate new wrapping values based on which menu item was clicked
 * @returns New wrapText and wrapHeaderText values
 */
function calculateNewWrappingValues(
    clickedItem: ITextWrappingMenuItem,
    currentWrapText: boolean | undefined,
    currentWrapHeaderText: boolean | undefined,
): { newWrapText: boolean | undefined; newWrapHeaderText: boolean | undefined } {
    const isHeaderItem = clickedItem.id === "header";
    return {
        newWrapText: isHeaderItem ? currentWrapText : !clickedItem.isActive,
        newWrapHeaderText: isHeaderItem ? !clickedItem.isActive : currentWrapHeaderText,
    };
}

/**
 * Helper: Create text wrapping overrides for columns
 * @returns New array of override items
 */
function createOverridesForColumns(
    leafColumnDefinitions: ITableColumnDefinition[],
    isGroupHeader: boolean,
    pivotGroupDepth: number | undefined,
    newWrapText: boolean | undefined,
    newWrapHeaderText: boolean | undefined,
): IColumnTextWrappingItem[] {
    // For pivot group headers, create a single pivot group override
    if (isGroupHeader && leafColumnDefinitions.length > 0 && pivotGroupDepth !== undefined) {
        return [
            createColumnTextWrappingItemForColumnDefinition(
                leafColumnDefinitions[0],
                { wrapText: newWrapText, wrapHeaderText: newWrapHeaderText },
                {
                    usePivotGroupLocator: true,
                    pivotGroupDepth,
                    includeElements: !hasLeavesWithDifferentElements(leafColumnDefinitions, pivotGroupDepth),
                },
            ),
        ];
    }

    // For regular headers, create individual column overrides
    return leafColumnDefinitions.map((columnDef) =>
        createColumnTextWrappingItemForColumnDefinition(columnDef, {
            wrapText: newWrapText,
            wrapHeaderText: newWrapHeaderText,
        }),
    );
}

/**
 * Helper: Merge new overrides with existing ones and clean up defaults
 * @returns New array of overrides with unnecessary ones removed
 */
function mergeAndCleanupOverrides(
    existingOverrides: IColumnTextWrappingItem[],
    newOverrides: IColumnTextWrappingItem[],
    newWrapText: boolean | undefined,
    newWrapHeaderText: boolean | undefined,
    globalWrapText: boolean | undefined,
    globalWrapHeaderText: boolean | undefined,
): IColumnTextWrappingItem[] {
    let updatedOverrides = [...existingOverrides];

    // Merge new overrides (replace matching ones, add new ones)
    newOverrides.forEach((newOverride) => {
        const existingIndex = updatedOverrides.findIndex((o) =>
            isColumnTextWrappingItemMatch(o, newOverride),
        );

        if (existingIndex >= 0) {
            updatedOverrides[existingIndex] = newOverride;
        } else {
            updatedOverrides.push(newOverride);
        }
    });

    // Remove overrides if both values match the global default (no actual override needed)
    if (newWrapText === globalWrapText && newWrapHeaderText === globalWrapHeaderText) {
        updatedOverrides = updatedOverrides.filter(
            (o) => !newOverrides.some((newO) => isColumnTextWrappingItemMatch(o, newO)),
        );
    }

    return updatedOverrides;
}

/**
 * Helper: Apply text wrapping settings to AG-Grid column definitions
 */
function applyTextWrappingToAgGrid(
    agGridApi: AgGridApi,
    getAgGridColumns: (api: AgGridApi) => ReturnType<AgGridApi["getColumns"]> | null,
    updateAgGridColumnDefs: (colDefs: AgGridColumnDef[], api: AgGridApi) => void,
    updatedOverrides: IColumnTextWrappingItem[],
    globalWrapText: boolean | undefined,
    globalWrapHeaderText: boolean | undefined,
): void {
    const allColumns = getAgGridColumns(agGridApi);
    if (!allColumns) {
        return;
    }

    const updatedColDefs = allColumns.map((column) => {
        const colDef = column.getColDef();
        const currentWidth = column.getActualWidth();
        const colColumnDefinition = colDef.context?.columnDefinition;

        if (!colColumnDefinition) {
            return colDef;
        }

        // Get effective wrapping values for this column
        const directOverride = getColumnTextWrappingItemForColumnDefinition(
            colColumnDefinition,
            updatedOverrides,
        );
        const pivotGroupOverride = getPivotGroupTextWrappingItemForColumnDefinition(
            colColumnDefinition,
            updatedOverrides,
        );

        const colWrapText = directOverride?.wrapText ?? pivotGroupOverride?.wrapText ?? globalWrapText;
        const colWrapHeaderText =
            directOverride?.wrapHeaderText ?? pivotGroupOverride?.wrapHeaderText ?? globalWrapHeaderText;

        return {
            ...colDef,
            wrapText: !!colWrapText,
            wrapHeaderText: !!colWrapHeaderText,
            autoHeight: !!colWrapText,
            autoHeaderHeight: !!colWrapHeaderText,
            width: currentWidth,
        };
    });

    updateAgGridColumnDefs(updatedColDefs as AgGridColumnDef[], agGridApi);
}

/**
 * Helper: Persist text wrapping configuration to insight
 */
function persistTextWrappingToInsight(
    pushData: ((data: IPushData) => void) | undefined,
    currentTextWrapping: ITextWrapping | undefined,
    updatedOverrides: IColumnTextWrappingItem[],
): void {
    if (!pushData) {
        return;
    }

    pushData({
        properties: {
            controls: {
                textWrapping: {
                    ...currentTextWrapping,
                    columnOverrides: updatedOverrides.length > 0 ? updatedOverrides : undefined,
                },
            },
        },
    });
}
