// (C) 2026 GoodData Corporation

import cx from "classnames";

import { type IInsightWidget, type IVisualizationSwitcherWidget, type ScreenSize } from "@gooddata/sdk-model";
import { useId } from "@gooddata/sdk-ui-kit";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { type WidgetExportData } from "../../export/types.js";
import { restrictedWidgetContentExportData } from "../../export/useExportData.js";
import { DashboardItem } from "../../presentationComponents/DashboardItems/DashboardItem.js";
import { DashboardItemVisualization } from "../../presentationComponents/DashboardItems/DashboardItemVisualization.js";
import { useResolveRestrictedRender } from "../common/useResolveRestrictedRender.js";
import { VisualizationSwitcherNavigationHeader } from "../widget/VisualizationSwitcherWidget/VisualizationSwitcherNavigationHeader.js";

export interface IViewModeDashboardVisualizationSwitcherRestrictedProps {
    widget: IVisualizationSwitcherWidget;
    activeVisualization: IInsightWidget;
    screen: ScreenSize;
    exportData?: WidgetExportData;
    onActiveVisualizationChange: (activeVisualizationId: string) => void;
}

/**
 * The switcher with a restricted visualization active. The switcher keeps its entry list, so the user
 * can move to a readable visualization; only the body becomes the access placeholder, and no widget
 * menu is offered, which leaves the widget without drill and without export.
 */
export function ViewModeDashboardVisualizationSwitcherRestricted({
    widget,
    activeVisualization,
    screen,
    exportData,
    onActiveVisualizationChange,
}: IViewModeDashboardVisualizationSwitcherRestrictedProps) {
    const titleId = useId();
    const { RestrictedPlaceholderComponentProvider } = useDashboardComponentsContext();
    const Content = RestrictedPlaceholderComponentProvider(activeVisualization);
    // this component renders only while the active entry is restricted
    useResolveRestrictedRender(activeVisualization.ref, true);

    return (
        <DashboardItem
            className={cx("type-visualization", "gd-dashboard-view-widget")}
            screen={screen}
            titleId={titleId}
        >
            <DashboardItemVisualization
                isExport={!!exportData}
                renderHeadline={(clientHeight, clientWidth) => (
                    <VisualizationSwitcherNavigationHeader
                        widget={widget}
                        clientHeight={clientHeight}
                        clientWidth={clientWidth}
                        titleId={titleId}
                        activeVisualization={activeVisualization}
                        onActiveVisualizationChange={onActiveVisualizationChange}
                        exportData={exportData?.title}
                    />
                )}
            >
                {({ clientHeight, clientWidth }) => (
                    // the same wrapper the readable path uses, so the content takes the space below
                    // the entry list instead of the whole tile, which would centre it over the title
                    <div className="gd-visualization-switcher-visible-visualization">
                        <div
                            className="visualization-content"
                            {...(exportData ? restrictedWidgetContentExportData : {})}
                        >
                            <Content width={clientWidth} height={clientHeight} />
                        </div>
                    </div>
                )}
            </DashboardItemVisualization>
        </DashboardItem>
    );
}
