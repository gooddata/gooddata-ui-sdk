// (C) 2023-2026 GoodData Corporation

import { type Ref, useEffect } from "react";

import cx from "classnames";

import { changeFilterContextSelection } from "../../../model/commands/filters.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDispatchDashboardCommand } from "../../../model/react/useDispatchDashboardCommand.js";
import { useWidgetSelection } from "../../../model/react/useWidgetSelection.js";
import { selectIsAiLoading } from "../../../model/store/config/configSelectors.js";
import { selectIsNewDashboard } from "../../../model/store/meta/metaSelectors.js";
import { selectRenderMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { useDashboardDrop } from "../../dragAndDrop/useDashboardDrop.js";
import { ExportThemeProvider } from "../../export/ExportThemeProvider.js";
import { useWidgetDragHoverHandlers as useFlexibleWidgetDragHoverHandlers } from "../../flexibleLayout/dragAndDrop/draggableWidget/useWidgetDragHoverHandlers.js";
import { DashboardLayout } from "../../widget/dashboardLayout/DashboardLayout.js";
import { DateFilterConfigWarnings } from "../components/DateFilterConfigWarnings.js";
import { type IDashboardProps } from "../types.js";

import { DashboardContentLoader } from "./DashboardContentLoader.js";

/**
 * @internal
 */
export function DefaultDashboardMainContent(_: IDashboardProps) {
    const onFiltersChange = useDispatchDashboardCommand(changeFilterContextSelection);
    const { deselectWidgets } = useWidgetSelection();

    const renderMode = useDashboardSelector(selectRenderMode);
    const isAiLoading = useDashboardSelector(selectIsAiLoading);
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);

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
                {isNewDashboard && isAiLoading ? (
                    <DashboardContentLoader />
                ) : (
                    <>
                        <DateFilterConfigWarnings />
                        <DashboardLayout onFiltersChange={onFiltersChange} />
                    </>
                )}
            </div>
        );
    };

    if (renderMode === "export") {
        return <ExportThemeProvider>{renderContent()}</ExportThemeProvider>;
    }

    return renderContent();
}
