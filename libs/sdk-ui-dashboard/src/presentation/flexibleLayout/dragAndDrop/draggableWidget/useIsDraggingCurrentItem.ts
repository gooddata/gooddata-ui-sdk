// (C) 2022-2024 GoodData Corporation
import { useMemo } from "react";

import { selectDraggingWidgetSource, useDashboardSelector } from "../../../../model/index.js";
import { ILayoutItemPath } from "../../../../types.js";

import { areLayoutPathsEqual } from "../../../../_staging/layout/coordinates.js";

export function useIsDraggingCurrentItem(layoutPath: ILayoutItemPath) {
    const dragItem = useDashboardSelector(selectDraggingWidgetSource);

    return useMemo(() => {
        if (!dragItem) {
            return false;
        }
        return areLayoutPathsEqual(dragItem.layoutPath, layoutPath);
    }, [dragItem, layoutPath]);
}
