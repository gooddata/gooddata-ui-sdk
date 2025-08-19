// (C) 2022-2025 GoodData Corporation
import { useMemo } from "react";

import { areLayoutPathsEqual } from "../../../../_staging/layout/coordinates.js";
import { selectDraggingWidgetSource, useDashboardSelector } from "../../../../model/index.js";
import { ILayoutItemPath } from "../../../../types.js";

export function useIsDraggingCurrentItem(layoutPath: ILayoutItemPath) {
    const dragItem = useDashboardSelector(selectDraggingWidgetSource);

    return useMemo(() => {
        if (!dragItem) {
            return false;
        }
        return areLayoutPathsEqual(dragItem.layoutPath, layoutPath);
    }, [dragItem, layoutPath]);
}
