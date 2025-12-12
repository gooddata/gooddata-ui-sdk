// (C) 2023-2025 GoodData Corporation

import { type Ref, useEffect } from "react";

import cx from "classnames";

import {
    changeFilterContextSelection,
    selectRenderMode,
    useDashboardSelector,
    useDispatchDashboardCommand,
    useWidgetSelection,
} from "../../../model/index.js";
import { useDashboardDrop } from "../../dragAndDrop/index.js";
import { ExportThemeProvider } from "../../export/index.js";
import { useWidgetDragHoverHandlers as useFlexibleWidgetDragHoverHandlers } from "../../flexibleLayout/dragAndDrop/draggableWidget/useWidgetDragHoverHandlers.js";
import { DashboardLayout } from "../../flexibleLayout/index.js";
import { DateFilterConfigWarnings } from "../components/DateFilterConfigWarnings.js";
import { type IDashboardProps } from "../types.js";

/**
 * @internal
 */
export function DefaultDashboardMainContent(_: IDashboardProps) {
    const onFiltersChange = useDispatchDashboardCommand(changeFilterContextSelection);
    const { deselectWidgets } = useWidgetSelection();

    const renderMode = useDashboardSelector(selectRenderMode);

    const { handleDragHoverEnd } = useFlexibleWidgetDragHoverHandlers();
    const [{ isOver }, dropRef] = useDashboardDrop(
        [
            "insight",
            "insight-placeholder",
            "insightListItem",
            "kpi",
            "kpi-placeholder",
            "richText",
            "richTextListItem",
            "visualizationSwitcher",
            "visualizationSwitcherListItem",
            "dashboardLayout",
            "dashboardLayoutListItem",
        ],
        {},
    );

    useEffect(() => {
        if (!isOver) {
            handleDragHoverEnd();
        }
    }, [handleDragHoverEnd, isOver]);

    const classNames = cx(
        "gd-flex-container",
        "root-flex-maincontent",
        "gd-grid-layout",
        "gd-auto-resized-dashboard-descriptions",
    );

    const renderContent = () => {
        return (
            <div
                className={classNames}
                ref={dropRef as unknown as Ref<HTMLDivElement> | undefined}
                onClick={deselectWidgets}
            >
                <DateFilterConfigWarnings />
                <DashboardLayout onFiltersChange={onFiltersChange} />
            </div>
        );
    };

    if (renderMode === "export") {
        return <ExportThemeProvider>{renderContent()}</ExportThemeProvider>;
    }

    return renderContent();
}
