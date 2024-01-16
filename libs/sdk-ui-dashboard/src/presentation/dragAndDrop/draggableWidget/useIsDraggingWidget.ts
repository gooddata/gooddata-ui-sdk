// (C) 2022-2024 GoodData Corporation

import { useDashboardDrop } from "../useDashboardDrop.js";

export function useIsDraggingWidget() {
    const [{ canDrop: isDraggingWidget }] = useDashboardDrop(
        [
            "insightListItem",
            "kpi-placeholder",
            "insight-placeholder",
            "kpi",
            "insight",
            "richText",
            "richText-placeholder",
        ],
        {},
        [],
    );

    return isDraggingWidget;
}
