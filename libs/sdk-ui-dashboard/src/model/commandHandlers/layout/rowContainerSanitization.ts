// (C) 2025 GoodData Corporation

import { type AnyAction } from "@reduxjs/toolkit";

import {
    type IDashboardLayout,
    type IDashboardLayoutItem,
    type ScreenSize,
    isDashboardLayout,
} from "@gooddata/sdk-model";

import { getChildWidgetLayoutPaths, getUpdatedSizesOnly } from "./containerWidthSanitization.js";
import {
    getContainerDirectionAtPath,
    getLayoutConfiguration,
} from "../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";
import { getParentPath } from "../../../_staging/layout/coordinates.js";
import { type ILayoutItemPath } from "../../../types.js";
import { type IDashboardCommand } from "../../commands/index.js";
import { tabsActions } from "../../store/tabs/index.js";
import { type ExtendedDashboardWidget } from "../../types/layoutTypes.js";

function findNestedRowContainers(
    container: ExtendedDashboardWidget,
    containerLayoutPath: ILayoutItemPath,
): ILayoutItemPath[] {
    if (!isDashboardLayout(container)) {
        return [];
    }
    return [
        // include itself if the container has a row direction
        ...(getLayoutConfiguration(container).direction === "row" ? [containerLayoutPath] : []),
        // process nested items and look for row containers
        ...container.sections.flatMap((section, sectionIndex) =>
            section.items.flatMap((item, itemIndex) => {
                const currentPath: ILayoutItemPath = [...containerLayoutPath, { sectionIndex, itemIndex }];
                return item.widget && isDashboardLayout(item.widget)
                    ? findNestedRowContainers(item.widget, currentPath)
                    : [];
            }),
        ),
    ];
}

function mapChildrenWithNewWidth(
    rootLayout: IDashboardLayout<ExtendedDashboardWidget>,
    container: ExtendedDashboardWidget | undefined,
    containerLayoutPath: ILayoutItemPath,
    newWidth: number,
    screen: ScreenSize,
) {
    if (!isDashboardLayout(container)) {
        return [];
    }
    const children = getChildWidgetLayoutPaths(container, containerLayoutPath, true);
    const childrenWithNewSize = children.map((itemPath) => ({
        itemPath,
        width: newWidth,
    }));
    return getUpdatedSizesOnly(rootLayout, childrenWithNewSize, screen);
}

function shouldChangeNestedContainersDirectionToColumn(
    rootLayout: IDashboardLayout<ExtendedDashboardWidget>,
    item: IDashboardLayoutItem<ExtendedDashboardWidget>,
    targetItemIndex: ILayoutItemPath,
) {
    const targetParentPath = getParentPath(targetItemIndex);
    const targetLayoutDirection = getContainerDirectionAtPath(rootLayout, targetParentPath);
    return isDashboardLayout(item.widget) && targetLayoutDirection === "column";
}

function calculateRowContainerSanitization(
    rootLayout: IDashboardLayout<ExtendedDashboardWidget>,
    possibleContainer: IDashboardLayoutItem<ExtendedDashboardWidget>,
    fromItemIndex: ILayoutItemPath,
    toItemIndex: ILayoutItemPath,
    screen: ScreenSize,
) {
    const changeNestedContainersDirectionToColumn = shouldChangeNestedContainersDirectionToColumn(
        rootLayout,
        possibleContainer,
        toItemIndex,
    );
    if (!changeNestedContainersDirectionToColumn) {
        return {
            containersForDirectionChange: [],
            childrenWithNewWidth: [],
        };
    }

    const containersForDirectionChange = findNestedRowContainers(possibleContainer.widget!, fromItemIndex);
    const newWidth = possibleContainer.size.xl.gridWidth;
    const childrenWithNewWidth = mapChildrenWithNewWidth(
        rootLayout,
        possibleContainer.widget,
        fromItemIndex,
        newWidth,
        screen,
    );

    return {
        containersForDirectionChange,
        childrenWithNewWidth,
    };
}

/**
 * Builds actions for row container sanitization when moving items between layouts.
 *
 * If a container is being moved, we need to check if it has a row direction, and it is being moved to
 * a column layout. If yes, we need to change its direction to column. In any case, we need to check all
 * its children and find all the row containers and change their direction to column. We will also need to
 * update the width of all the children to match the moved container width.
 */
export function buildRowContainerSanitizationActions(
    cmd: IDashboardCommand,
    rootLayout: IDashboardLayout<ExtendedDashboardWidget>,
    possibleContainer: IDashboardLayoutItem<ExtendedDashboardWidget>,
    fromItemIndex: ILayoutItemPath,
    toItemIndex: ILayoutItemPath,
    screen: ScreenSize,
): AnyAction[] {
    const { containersForDirectionChange, childrenWithNewWidth } = calculateRowContainerSanitization(
        rootLayout,
        possibleContainer,
        fromItemIndex,
        toItemIndex,
        screen,
    );
    return [
        ...containersForDirectionChange.map((itemPath) =>
            tabsActions.toggleLayoutDirection({
                layoutPath: itemPath,
                direction: "column",
                undo: {
                    cmd,
                },
            }),
        ),
        ...(childrenWithNewWidth.length > 0
            ? [
                  tabsActions.updateWidthOfMultipleItems({
                      itemsWithSizes: childrenWithNewWidth,
                  }),
              ]
            : []),
    ];
}
