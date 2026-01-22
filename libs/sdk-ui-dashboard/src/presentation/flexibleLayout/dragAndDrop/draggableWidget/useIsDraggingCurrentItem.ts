// (C) 2022-2026 GoodData Corporation

import { useMemo } from "react";

import { areLayoutPathsEqual } from "../../../../_staging/layout/coordinates.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectDraggingWidgetSource } from "../../../../model/store/ui/uiSelectors.js";
import { type ILayoutItemPath } from "../../../../types.js";

export function useIsDraggingCurrentItem(layoutPath: ILayoutItemPath) {
    const dragItem = useDashboardSelector(selectDraggingWidgetSource);

    return useMemo(() => {
        if (!dragItem) {
            return false;
        }
        return areLayoutPathsEqual(dragItem.layoutPath, layoutPath);
    }, [dragItem, layoutPath]);
}
