// (C) 2022 GoodData Corporation

import { useDashboardDrop } from "../useDashboardDrop";

export function useIsDraggingWidget() {
    const [{ canDrop: isDraggingWidget }] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder", "insight-placeholder", "kpi", "insight"],
        {},
        [],
    );

    return isDraggingWidget;
}
