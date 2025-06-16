// (C) 2025 GoodData Corporation

import { useCallback } from "react";
import { IVisualizationSizeInfo, isVisualizationDefaultSizeInfo } from "@gooddata/sdk-ui-ext";
import { isDashboardLayout } from "@gooddata/sdk-model";

import { useDashboardSelector, selectLayout } from "../../../../model/index.js";
import { hasParent, findItem, getParentPath } from "../../../../_staging/layout/coordinates.js";
import { ILayoutItemPath } from "../../../../types.js";
import { BaseDraggableLayoutItemSize } from "../../../dragAndDrop/index.js";
import { getLayoutConfiguration } from "../../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";

/**
 * The hook will take an item path, finds its parent layout and uses this information to return a function
 * that can be used to modify the default widget size. If the parent layout uses a "row" direction,
 * the original size is returned. If the parent layout uses a "column" direction, the original size is
 * returned with the default width set to the parent layout width.
 *
 * @param itemLayoutPath - path of the item for which we want to change sizing info
 */
export const useUpdateWidgetDefaultSizeByParent = (itemLayoutPath: ILayoutItemPath) => {
    const rootLayout = useDashboardSelector(selectLayout);

    return useCallback(
        <T extends BaseDraggableLayoutItemSize | IVisualizationSizeInfo>(size: T): T => {
            if (hasParent(itemLayoutPath)) {
                const parentPath = getParentPath(itemLayoutPath);
                const item = findItem(rootLayout, parentPath!);

                if (isDashboardLayout(item.widget)) {
                    const { direction } = getLayoutConfiguration(item.widget);
                    if (direction === "row") {
                        return size;
                    }
                    if (isVisualizationDefaultSizeInfo(size)) {
                        return {
                            ...size,
                            width: {
                                ...size.width,
                                default: item.size.xl.gridWidth,
                            },
                        };
                    }
                    return {
                        ...size,
                        gridWidth: item.size.xl.gridWidth,
                    };
                }
            }
            return size;
        },
        [itemLayoutPath, rootLayout],
    );
};
