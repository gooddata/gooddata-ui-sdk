// (C) 2025 GoodData Corporation

import { invariant } from "ts-invariant";
import { SagaReturnType, select, put } from "redux-saga/effects";
import {
    isDashboardLayout,
    IDashboardLayout,
    IDashboardLayoutItem,
    ScreenSize,
    IDashboardLayoutSection,
    IDashboardLayoutSizeByScreenSize,
} from "@gooddata/sdk-model";

import { ILayoutItemPath } from "../../../types.js";
import { selectLayout, selectScreen } from "../../store/layout/layoutSelectors.js";
import { IItemWithHeight, ExtendedDashboardWidget } from "../../types/layoutTypes.js";
import { findItem, areLayoutPathsEqual } from "../../../_staging/layout/coordinates.js";
import {
    implicitLayoutItemSizeFromXlSize,
    splitDashboardLayoutItemsAsRenderedGridRows,
} from "../../../_staging/layout/sizing.js";
import { layoutActions } from "../../store/layout/index.js";

// ============================================================================
// Types and Interfaces
// ============================================================================

type HeightLookupFunction = (itemPath: ILayoutItemPath) => IItemWithHeight | undefined;

// ============================================================================
// Path Utilities
// ============================================================================

/**
 * Generates parent paths from the deepest to shallowest level.
 * Used for processing containers in the correct order during height calculations.
 */
const generateParentPathsFromDeepestToShallowest = (parentPath: ILayoutItemPath): ILayoutItemPath[] =>
    parentPath.map((_, index) => parentPath.slice(0, parentPath.length - index));

/**
 * Generates a lookup function to find the height of a specific item based on its itemPath from
 * the previously performed calculation provided to this generator.
 */
const generateHeightLookupFunction =
    (parentContainerHeights: IItemWithHeight[]): HeightLookupFunction =>
    (itemPath) =>
        parentContainerHeights.find(({ itemPath: existingPath }) =>
            areLayoutPathsEqual(existingPath, itemPath),
        );

// ============================================================================
// Height Calculation Utilities
// ============================================================================

/**
 * Calculates the maximum height of all items in a row.
 * Takes into account previously computed heights for accurate calculations.
 */
const calculateRowHeight = (
    section: IDashboardLayoutSection<ExtendedDashboardWidget>,
    sectionIndex: number,
    row: IDashboardLayoutItem<ExtendedDashboardWidget>[],
    containerPath: ILayoutItemPath,
    screen: ScreenSize,
    getPreviouslyComputedHeight: HeightLookupFunction,
): number => {
    return row.reduce((maxHeight, item) => {
        const itemIndex = section.items.findIndex((currentItem) => currentItem === item);
        const itemPath: ILayoutItemPath = [...containerPath, { sectionIndex, itemIndex }];

        // Check if we already computed height for this item
        const previouslyComputedHeight = getPreviouslyComputedHeight(itemPath);
        if (previouslyComputedHeight) {
            return Math.max(maxHeight, previouslyComputedHeight.height);
        }

        // Use the item's current height
        const sanitizedItemSize = implicitLayoutItemSizeFromXlSize(item.size.xl);
        const currentHeight = sanitizedItemSize[screen]?.gridHeight ?? 0;
        return Math.max(maxHeight, currentHeight);
    }, 0);
};

/**
 * Computes the total height of a container by summing all its section heights.
 * Each section height is calculated based on the maximum height of items in each row.
 */
const calculateContainerHeight = (
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    containerPath: ILayoutItemPath,
    screen: ScreenSize,
    getPreviouslyComputedHeight: HeightLookupFunction,
): number => {
    const container = findItem(layout, containerPath);
    invariant(isDashboardLayout(container.widget), "Container must be a dashboard layout");

    const containerSize = implicitLayoutItemSizeFromXlSize(container.size.xl);

    return container.widget.sections.reduce((totalHeight, section, sectionIndex) => {
        const rows = splitDashboardLayoutItemsAsRenderedGridRows(section.items, containerSize, screen);

        const sectionHeight = rows.reduce((sectionTotal, row) => {
            const rowHeight = calculateRowHeight(
                section,
                sectionIndex,
                row,
                containerPath,
                screen,
                getPreviouslyComputedHeight,
            );
            return sectionTotal + rowHeight;
        }, 0);

        return totalHeight + sectionHeight;
    }, 0);
};

// ============================================================================
// Layout Traversal and Container Discovery
// ============================================================================

/**
 * Recursively discovers all containers in a layout and calculates their updated heights.
 * Processes containers to ensure they match the height of their row siblings.
 */
const getContainersWithUpdatedHeights = (
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    screen: ScreenSize,
    getPreviouslyComputedHeight: HeightLookupFunction,
    parentSize: IDashboardLayoutSizeByScreenSize | undefined = undefined,
    currentPath: ILayoutItemPath = [],
): IItemWithHeight[] => {
    return layout.sections.flatMap((section, sectionIndex) => {
        const rows = splitDashboardLayoutItemsAsRenderedGridRows(section.items, parentSize, screen);

        return rows.flatMap((row) => {
            const rowHeight = calculateRowHeight(
                section,
                sectionIndex,
                row,
                currentPath,
                screen,
                getPreviouslyComputedHeight,
            );

            return row.flatMap((item) => {
                if (!isDashboardLayout(item.widget)) {
                    return [];
                }
                const itemIndexInSection = section.items.findIndex((currentItem) => currentItem === item);
                const itemPath: ILayoutItemPath = [
                    ...currentPath,
                    { sectionIndex, itemIndex: itemIndexInSection },
                ];

                // Current container with its row height
                const currentContainer: IItemWithHeight = {
                    itemPath,
                    height: rowHeight,
                };

                // Recursively process nested containers
                const nestedContainerUpdates = getContainersWithUpdatedHeights(
                    item.widget,
                    screen,
                    getPreviouslyComputedHeight,
                    item.size,
                    itemPath,
                );

                return [currentContainer, ...nestedContainerUpdates];
            });
        });
    });
};

const getParentContainerHeights = (
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    parentContainerPaths: ILayoutItemPath[],
    screen: ScreenSize,
) =>
    parentContainerPaths.reduce<IItemWithHeight[]>((accumulator, containerPath) => {
        const getPreviousHeight = generateHeightLookupFunction(accumulator);
        const height = calculateContainerHeight(layout, containerPath, screen, getPreviousHeight);

        return [...accumulator, { itemPath: containerPath, height }];
    }, []);

// ============================================================================
// Filtering and Optimization
// ============================================================================

/**
 * Filters items to only include those that actually need height updates.
 * Avoids unnecessary DOM updates by comparing current and target heights.
 */
const filterItemsRequiringHeightUpdates = (
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    itemsWithSizes: IItemWithHeight[],
    screen: ScreenSize,
): IItemWithHeight[] => {
    return itemsWithSizes.filter(({ itemPath, height }) => {
        const container = findItem(layout, itemPath);
        const currentSize = implicitLayoutItemSizeFromXlSize(container.size.xl);
        const currentHeight = currentSize[screen]?.gridHeight ?? 0;
        return currentHeight !== height;
    });
};

/**
 * Merges multiple arrays of items with heights, ensuring no duplicates.
 * Later items override earlier ones for the same path.
 */
const mergeItemsWithHeights = (itemArrays: IItemWithHeight[][]): IItemWithHeight[] => {
    const allItems = itemArrays.flat();

    return allItems.reduce<IItemWithHeight[]>((uniqueItems, item) => {
        const existingIndex = uniqueItems.findIndex((existing) =>
            areLayoutPathsEqual(existing.itemPath, item.itemPath),
        );

        return existingIndex === -1
            ? [...uniqueItems, item]
            : uniqueItems.map((existing, index) => (index === existingIndex ? item : existing));
    }, []);
};

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Resizes parent containers to maintain consistent row heights throughout the layout.
 * This is the main entry point for container height sanitization.
 *
 * The function:
 * 1. Calculates heights for specific parent containers
 * 2. Recalculates the entire layout to ensure row height consistency
 * 3. Merges and deduplicates all height updates
 * 4. Applies only the changes that are actually needed
 */
export function* resizeParentContainers(parentPath: ILayoutItemPath | undefined) {
    if (!parentPath) {
        return;
    }

    const layout: SagaReturnType<typeof selectLayout> = yield select(selectLayout);
    const screen: SagaReturnType<typeof selectScreen> = yield select(selectScreen);
    invariant(screen, "Screen size must be available");

    // Step 1: Calculate heights for specific parent containers
    const parentContainerPaths = generateParentPathsFromDeepestToShallowest(parentPath);
    const parentContainerHeights = getParentContainerHeights(layout, parentContainerPaths, screen);

    // Step 2: Recalculate the entire layout for row height consistency
    const getPreviousHeight = generateHeightLookupFunction(parentContainerHeights);
    const allLayoutContainerHeights = getContainersWithUpdatedHeights(layout, screen, getPreviousHeight);

    // Step 3: Merge all height calculations
    const allHeightUpdates = mergeItemsWithHeights([parentContainerHeights, allLayoutContainerHeights]);

    // Step 4: Filter to only items that actually need updates
    const requiredUpdates = filterItemsRequiringHeightUpdates(layout, allHeightUpdates, screen);

    // Step 5: Apply the updates
    if (requiredUpdates.length > 0) {
        yield put(
            layoutActions.updateHeightOfMultipleItems({
                itemsWithSizes: requiredUpdates,
            }),
        );
    }
}
