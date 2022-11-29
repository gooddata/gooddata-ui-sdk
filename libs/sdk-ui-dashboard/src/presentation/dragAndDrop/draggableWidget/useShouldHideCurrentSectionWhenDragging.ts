// (C) 2022 GoodData Corporation
import { useMemo } from "react";

import { selectDraggingWidgetSource, useDashboardSelector } from "../../../model";

export function useShouldHideCurrentSectionWhenDragging(sectionIndex: number) {
    const dragItem = useDashboardSelector(selectDraggingWidgetSource);

    return useMemo(() => {
        if (!dragItem) {
            return false;
        }

        return dragItem.sectionIndex === sectionIndex && dragItem.isOnlyItemInSection;
    }, [dragItem, sectionIndex]);
}
