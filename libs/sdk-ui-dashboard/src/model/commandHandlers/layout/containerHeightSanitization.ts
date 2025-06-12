// (C) 2025 GoodData Corporation

import { invariant } from "ts-invariant";
import { SagaReturnType, select, put } from "redux-saga/effects";
import {
    isDashboardLayout,
    IDashboardLayout,
    IDashboardLayoutItem,
    ScreenSize,
    IDashboardLayoutSection,
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

const getParentPathsFromDeepestToShallowest = (parentPath: ILayoutItemPath) =>
    parentPath.map((_, index) => {
        return parentPath.slice(0, parentPath.length - index);
    });

const getUpdatedSizesOnly = (
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    itemsWithSizes: IItemWithHeight[],
    screen: ScreenSize,
) => {
    return itemsWithSizes.filter(({ itemPath, height }) => {
        const container = findItem(layout, itemPath);
        const sanitizedItemSize = implicitLayoutItemSizeFromXlSize(container.size.xl);
        return sanitizedItemSize[screen]?.gridHeight !== height;
    });
};

class ContainerHeightCalculator {
    constructor(
        private readonly screen: ScreenSize,
        private readonly getPreviouslyComputedHeight: (
            itemPath: ILayoutItemPath,
        ) => IItemWithHeight | undefined,
    ) {}

    public computeContainerHeight(
        layout: IDashboardLayout<ExtendedDashboardWidget>,
        itemPath: ILayoutItemPath,
    ) {
        const container = findItem(layout, itemPath);
        invariant(isDashboardLayout(container.widget));

        return container.widget.sections.reduce((totalHeight, section, sectionIndex) => {
            const sectionHeight = this.getSectionHeight(container, section, sectionIndex, itemPath);
            return totalHeight + sectionHeight;
        }, 0);
    }

    private getSectionHeight = (
        container: IDashboardLayoutItem<ExtendedDashboardWidget>,
        section: IDashboardLayoutSection<ExtendedDashboardWidget>,
        sectionIndex: number,
        itemPath: ILayoutItemPath,
    ): number => {
        const allScreenSizes = implicitLayoutItemSizeFromXlSize(container.size.xl);
        const rows = splitDashboardLayoutItemsAsRenderedGridRows(section.items, allScreenSizes, this.screen);

        return rows.reduce((sectionHeight, row) => {
            const rowHeight = this.getRowHeight(section, sectionIndex, row, itemPath);
            return sectionHeight + rowHeight;
        }, 0);
    };

    private getRowHeight = (
        section: IDashboardLayoutSection<ExtendedDashboardWidget>,
        sectionIndex: number,
        row: IDashboardLayoutItem<ExtendedDashboardWidget>[],
        itemPath: ILayoutItemPath,
    ) => {
        return row.reduce((maxItemHeight, item) => {
            const itemIndex = section.items.findIndex((currentItem) => currentItem === item);
            const currentItemPath: ILayoutItemPath = [...itemPath, { sectionIndex, itemIndex }];
            const previouslyComputedHeight = this.getPreviouslyComputedHeight(currentItemPath);
            const sanitizedItemSize = implicitLayoutItemSizeFromXlSize(item.size.xl);
            const currentItemHeight =
                previouslyComputedHeight?.height ?? sanitizedItemSize[this.screen]?.gridHeight ?? 0;
            return Math.max(maxItemHeight, currentItemHeight);
        }, 0);
    };
}

// the handler does not support heightRatio, only gridHeight
export function* resizeParentContainers(parentPath: ILayoutItemPath | undefined) {
    if (parentPath === undefined) {
        return;
    }
    const layout: SagaReturnType<typeof selectLayout> = yield select(selectLayout);
    const screen: SagaReturnType<typeof selectScreen> = yield select(selectScreen);
    invariant(screen);

    const containers = getParentPathsFromDeepestToShallowest(parentPath);

    // go through each container from the deepest one to the shallowest one, get new height for each of them
    const itemsWithSizes = containers.reduce<IItemWithHeight[]>((aggregator, itemPath) => {
        const getPreviouslyComputedHeight = (currentItemPath: ILayoutItemPath) =>
            aggregator.find(({ itemPath }) => areLayoutPathsEqual(itemPath, currentItemPath));

        const calculator = new ContainerHeightCalculator(screen, getPreviouslyComputedHeight);
        const height = calculator.computeContainerHeight(layout, itemPath);
        return [
            ...aggregator,
            {
                itemPath,
                height,
            },
        ];
    }, []);

    const updatedItemsWithSizes = getUpdatedSizesOnly(layout, itemsWithSizes, screen);

    if (updatedItemsWithSizes.length > 0) {
        yield put(
            layoutActions.updateHeightOfMultipleItems({
                itemsWithSizes: updatedItemsWithSizes,
            }),
        );
    }
}
