// (C) 2024-2025 GoodData Corporation
import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

import { IDashboardVisualizationSwitcherProps } from "./types.js";
import {
    useDashboardSelector,
    selectInsightsMap,
    selectSettings,
    useDashboardScheduledEmails,
} from "../../../model/index.js";
import { useDashboardComponentsContext } from "../../../presentation/dashboardContexts/index.js";
import {
    DashboardItem,
    DashboardItemVisualization,
    getVisTypeCssClass,
} from "../../../presentation/presentationComponents/index.js";
import { IInsight, IInsightWidget, insightVisualizationType, widgetTitle } from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";
import { InsightWidgetDescriptionTrigger } from "../description/InsightWidgetDescriptionTrigger.js";
import { ShowAsTableButton } from "../showAsTableButton/ShowAsTableButton.js";
import { useInsightExport } from "../common/index.js";
import { useAlertingAndScheduling } from "../widget/InsightWidget/useAlertingAndScheduling.js";
import { useInsightMenu } from "../widget/InsightWidget/useInsightMenu.js";
import { VisualizationSwitcherNavigationHeader } from "../widget/VisualizationSwitcherWidget/VisualizationSwitcherNavigationHeader.js";
import { useExecutionProgress } from "./useExecutionProgress.js";
import { AllVisualizationsDashInsights } from "./AllVisualizationsDashInsights.js";
import { useShowAsTable } from "../showAsTableButton/useShowAsTable.js";
import { supportsShowAsTable } from "../insight/insightToTable.js";

/**
 * @internal
 */
export function ViewModeDashboardVisualizationSwitcher({
    widget,
    activeVisualizationId: initialActiveVisualizationId,
    onError,
    onExportReady,
    onLoadingChanged,
    screen,
    exportData,
}: IDashboardVisualizationSwitcherProps) {
    const [activeVisualizationId, setActiveVisualizationId] = useState(initialActiveVisualizationId);

    const activeVisualization =
        widget.visualizations.find((visualization) => visualization.identifier === activeVisualizationId) ??
        widget.visualizations[0];

    const insights = useDashboardSelector(selectInsightsMap);
    const insight = activeVisualization ? insights.get(activeVisualization.insight) : undefined;

    if (!activeVisualization || !insight) {
        return <ViewModeDashboardVisualizationSwitcherEmpty />;
    } else {
        return (
            <ViewModeDashboardVisualizationSwitcherContent
                widget={widget}
                insight={insight}
                activeVisualization={activeVisualization}
                screen={screen}
                onError={onError}
                onExportReady={onExportReady}
                onLoadingChanged={onLoadingChanged}
                onActiveVisualizationChange={setActiveVisualizationId}
                exportData={exportData}
            />
        );
    }
}

export function ViewModeDashboardVisualizationSwitcherEmpty() {
    return <div className="gd-visualization-switcher-widget-empty-content" />;
}

export interface IViewModeDashboardVisualizationSwitcherContentProps
    extends IDashboardVisualizationSwitcherProps {
    insight: IInsight;
    activeVisualization: IInsightWidget;
    onActiveVisualizationChange: (activeVisualizationId: string) => void;
}

export function ViewModeDashboardVisualizationSwitcherContent({
    widget,
    insight,
    activeVisualization,
    onActiveVisualizationChange,
    screen,
    onError,
    onExportReady,
    onLoadingChanged,
    exportData,
}: IViewModeDashboardVisualizationSwitcherContentProps) {
    const intl = useIntl();
    const visType = insightVisualizationType(insight) as VisType;
    const settings = useDashboardSelector(selectSettings);

    const { showOthers } = useExecutionProgress();

    const { ref: widgetRef } = activeVisualization;

    const {
        exportCSVEnabled,
        exportXLSXEnabled,
        exportCSVRawEnabled,
        isExportRawVisible,
        isExportVisible,
        isExportPngImageVisible,
        isExporting,
        onExportRawCSV,
        onExportCSV,
        onExportXLSX,
        onExportPdfPresentation,
        onExportPngImage,
        onExportPowerPointPresentation,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
        exportPngImageDisabled,
    } = useInsightExport({
        widgetRef,
        title: widgetTitle(activeVisualization) || intl.formatMessage({ id: "export.defaultTitle" }),
        insight,
        widget: activeVisualization,
        useNewTabularExport: true,
    });

    const {
        onScheduleEmailingOpen,
        onScheduleEmailingManagementOpen,
        isScheduledEmailingVisible,
        isScheduledManagementEmailingVisible,
    } = useDashboardScheduledEmails();

    const onScheduleExport = useCallback(() => {
        onScheduleEmailingOpen(activeVisualization);
    }, [onScheduleEmailingOpen, activeVisualization]);

    const onScheduleManagementExport = useCallback(() => {
        onScheduleEmailingManagementOpen(activeVisualization);
    }, [onScheduleEmailingManagementOpen, activeVisualization]);

    const {
        isAlertingVisible,
        alertingDisabled,
        alertingDisabledReason,
        scheduleExportDisabled,
        scheduleExportManagementDisabled,
        scheduleExportDisabledReason,
    } = useAlertingAndScheduling({
        widget: activeVisualization,
        insight,
    });

    const { closeMenu, isMenuOpen, menuItems, openMenu } = useInsightMenu({
        insight,
        widget: activeVisualization,
        exportCSVEnabled,
        exportXLSXEnabled,
        exportCSVRawEnabled,
        isExportRawVisible,
        isExportVisible,
        isExportPngImageVisible,
        isExporting,
        onExportCSV,
        onExportXLSX,
        onExportRawCSV,
        onScheduleExport,
        onScheduleManagementExport,
        onExportPdfPresentation,
        onExportPowerPointPresentation,
        onExportPngImage,
        isScheduleExportVisible: isScheduledEmailingVisible,
        isScheduleExportManagementVisible: isScheduledManagementEmailingVisible,
        isAlertingVisible,
        alertingDisabled,
        alertingDisabledReason,
        scheduleExportDisabled,
        scheduleExportManagementDisabled,
        scheduleExportDisabledReason,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
        exportPngImageDisabled,
    });
    const toggleMenu = useCallback(() => {
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }, [isMenuOpen, closeMenu, openMenu]);

    const { InsightMenuButtonComponentProvider, InsightMenuComponentProvider } =
        useDashboardComponentsContext();

    const InsightMenuButtonComponent = useMemo(
        () => InsightMenuButtonComponentProvider(insight, activeVisualization),
        [InsightMenuButtonComponentProvider, insight, activeVisualization],
    );

    const InsightMenuComponent = useMemo(
        () => InsightMenuComponentProvider(insight, activeVisualization),
        [InsightMenuComponentProvider, insight, activeVisualization],
    );

    const accessibilityWidgetDescription = settings.enableDescriptions
        ? activeVisualization.configuration?.description?.source === "widget" || !insight
            ? activeVisualization.description
            : insight.insight.summary
        : "";

    const { isWidgetAsTable, toggleWidgetAsTable } = useShowAsTable(activeVisualization);

    return (
        <DashboardItem
            className={cx(
                "type-visualization",
                "gd-dashboard-view-widget",
                getVisTypeCssClass(activeVisualization.type, visType),
            )}
            screen={screen}
            description={accessibilityWidgetDescription}
        >
            <DashboardItemVisualization
                isExport={!!exportData}
                renderHeadline={(clientHeight, clientWidth) => (
                    <VisualizationSwitcherNavigationHeader
                        widget={widget}
                        clientHeight={clientHeight}
                        clientWidth={clientWidth}
                        activeVisualization={activeVisualization}
                        onActiveVisualizationChange={(activeVisualizationId) =>
                            onActiveVisualizationChange(activeVisualizationId)
                        }
                        exportData={exportData?.title}
                    />
                )}
                renderBeforeVisualization={() => (
                    <div className="gd-absolute-row">
                        {settings?.enableDescriptions ? (
                            <InsightWidgetDescriptionTrigger
                                insight={insight}
                                widget={activeVisualization}
                                screen={screen}
                            />
                        ) : null}
                        {/* AsTable button: show for all except table, repeater, headline */}
                        {(() => {
                            const visType = insightVisualizationType(insight);
                            if (supportsShowAsTable(visType)) {
                                return (
                                    <ShowAsTableButton
                                        widget={activeVisualization}
                                        isWidgetAsTable={isWidgetAsTable}
                                        onClick={toggleWidgetAsTable}
                                    />
                                );
                            }
                            return null;
                        })()}
                        <InsightMenuButtonComponent
                            insight={insight}
                            widget={activeVisualization}
                            isOpen={isMenuOpen}
                            onClick={toggleMenu}
                            items={menuItems}
                        />
                    </div>
                )}
                renderAfterContent={() => {
                    if (!isMenuOpen) {
                        return null;
                    }

                    return (
                        <InsightMenuComponent
                            insight={insight}
                            widget={activeVisualization}
                            isOpen={isMenuOpen}
                            onClose={closeMenu}
                            items={menuItems}
                        />
                    );
                }}
            >
                {({ clientHeight, clientWidth }) => (
                    <AllVisualizationsDashInsights
                        visualizations={widget.visualizations}
                        activeVisualization={activeVisualization}
                        showOthers={showOthers}
                        onExportReady={onExportReady}
                        onError={onError}
                        onLoadingChanged={onLoadingChanged}
                        clientHeight={clientHeight}
                        clientWidth={clientWidth}
                        exportData={exportData?.widget}
                    />
                )}
            </DashboardItemVisualization>
        </DashboardItem>
    );
}
