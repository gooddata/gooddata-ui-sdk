// (C) 2020-2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IInsight, insightVisualizationType, widgetTitle } from "@gooddata/sdk-model";
import { type VisType } from "@gooddata/sdk-ui";
import { useId } from "@gooddata/sdk-ui-kit";

import { DashboardWidgetInsightGuard } from "./DashboardWidgetInsightGuard.js";
import { type IDefaultDashboardInsightWidgetProps } from "./types.js";
import { useAlertingAndScheduling } from "./useAlertingAndScheduling.js";
import { useInsightMenu } from "./useInsightMenu.js";
import {
    selectRenderMode,
    selectSettings,
    useDashboardAlerts,
    useDashboardScheduledEmails,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";
import {
    DashboardItem,
    DashboardItemHeadline,
    DashboardItemVisualization,
    getVisTypeCssClass,
} from "../../../presentationComponents/index.js";
import { useInsightExport } from "../../common/index.js";
import { useWidgetHighlighting } from "../../common/useWidgetHighlighting.js";
import { useInsightWidgetDescriptionComponent } from "../../description/InsightWidgetDescriptionComponentProvider.js";
import { DashboardInsight } from "../../insight/index.js";
import {
    canConvertToTable,
    convertInsightToTableDefinition,
    supportsShowAsTable,
} from "../../insight/insightToTable.js";
import { ShowAsTableButton } from "../../showAsTableButton/ShowAsTableButton.js";
import { useShowAsTable } from "../../showAsTableButton/useShowAsTable.js";

export function DefaultDashboardInsightWidget(props: Omit<IDefaultDashboardInsightWidgetProps, "insight">) {
    return <DashboardWidgetInsightGuard {...props} Component={DefaultDashboardInsightWidgetCore} />;
}

/**
 * @internal
 */
function DefaultDashboardInsightWidgetCore({
    widget,
    insight,
    screen,
    onError,
    onExportReady,
    onLoadingChanged,
    dashboardItemClasses,
    exportData,
}: IDefaultDashboardInsightWidgetProps & { insight?: IInsight }) {
    const intl = useIntl();
    const settings = useDashboardSelector(selectSettings);
    const renderMode = useDashboardSelector(selectRenderMode);
    const isExportMode = renderMode === "export";
    const isAccessibilityMode = settings.enableAccessibilityMode === true;

    const {
        isScheduledEmailingVisible,
        isScheduledManagementEmailingVisible,
        onScheduleEmailingOpen,
        onScheduleEmailingManagementOpen,
    } = useDashboardScheduledEmails();

    const { onAlertingManagementOpen: onAlertingManagementOpenAction } = useDashboardAlerts();

    const visType = insight ? (insightVisualizationType(insight) as VisType) : undefined;
    const { ref: widgetRef } = widget;

    const {
        exportCSVEnabled,
        exportXLSXEnabled,
        exportCSVRawEnabled,
        isExportRawVisible,
        isExportVisible,
        isExportPngImageVisible,
        isExportPdfTabularVisible,
        isExporting,
        onExportRawCSV,
        onExportCSV,
        onExportXLSX,
        onExportPdfPresentation,
        onExportPowerPointPresentation,
        onExportPngImage,
        onExportPdfTabular,
        exportPdfPresentationDisabled,
        exportPowerPointPresentationDisabled,
        exportPngImageDisabled,
        exportPdfTabularDisabled,
        disabledReason,
    } = useInsightExport({
        widgetRef,
        title: widgetTitle(widget) || intl.formatMessage({ id: "export.defaultTitle" }),
        insight,
        widget,
    });

    const onScheduleExport = useCallback(() => {
        onScheduleEmailingOpen(widget);
    }, [onScheduleEmailingOpen, widget]);

    const onScheduleManagementExport = useCallback(() => {
        onScheduleEmailingManagementOpen(widget);
    }, [onScheduleEmailingManagementOpen, widget]);

    const onAlertingManagementOpen = useCallback(() => {
        onAlertingManagementOpenAction(widget);
    }, [onAlertingManagementOpenAction, widget]);

    const {
        isAlertingVisible,
        alertingDisabled,
        alertingDisabledReason,
        scheduleExportDisabled,
        scheduleExportManagementDisabled,
        scheduleExportDisabledReason,
    } = useAlertingAndScheduling({
        widget,
        insight,
    });

    ///
    const { closeMenu, isMenuOpen, menuItems, openMenu } = useInsightMenu({
        insight,
        widget,
        exportCSVEnabled,
        exportXLSXEnabled,
        exportCSVRawEnabled,
        isExportRawVisible,
        isExportVisible,
        isExportPngImageVisible,
        isExportPdfTabularVisible,
        isExporting,
        onExportCSV,
        onExportXLSX,
        onExportRawCSV,
        onScheduleExport,
        onScheduleManagementExport,
        onAlertingManagementOpen,
        onExportPdfPresentation,
        onExportPowerPointPresentation,
        onExportPngImage,
        onExportPdfTabular,
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
        exportPdfTabularDisabled,
        disabledReason,
    });
    const toggleMenu = useCallback(() => {
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }, [isMenuOpen, closeMenu, openMenu]);

    const {
        InsightMenuButtonComponentProvider,
        InsightMenuComponentProvider,
        ErrorComponent,
        LoadingComponent,
    } = useDashboardComponentsContext();

    const InsightMenuButtonComponent = useMemo(
        () => InsightMenuButtonComponentProvider(insight, widget),
        [InsightMenuButtonComponentProvider, insight, widget],
    );

    const InsightMenuComponent = useMemo(
        () => InsightMenuComponentProvider(insight, widget),
        [InsightMenuComponentProvider, insight, widget],
    );

    const { elementRef, highlighted } = useWidgetHighlighting(widget);
    const { InsightWidgetDescriptionComponent } = useInsightWidgetDescriptionComponent();

    const accessibilityWidgetDescription = settings.enableDescriptions
        ? widget.configuration?.description?.source === "widget" || !insight
            ? widget.description
            : insight.insight.summary
        : "";

    const titleId = useId();

    const { isWidgetAsTable, toggleWidgetAsTable } = useShowAsTable(widget);

    const accessibilityTableInsight = useMemo(() => {
        if (!isExportMode) return null;
        if (!isAccessibilityMode) return null;
        if (!insight) return null;

        const visType = insightVisualizationType(insight);
        if (!canConvertToTable(visType) && visType !== "table" && visType !== "repeater") {
            return null;
        }
        return convertInsightToTableDefinition(insight);
    }, [isExportMode, insight, isAccessibilityMode]);

    return (
        <>
            <DashboardItem
                className={cx(
                    dashboardItemClasses,
                    "type-visualization",
                    "gd-dashboard-view-widget",
                    getVisTypeCssClass(widget.type, visType),
                    { "gd-highlighted": highlighted },
                )}
                screen={screen}
                ref={elementRef}
                description={accessibilityWidgetDescription}
                exportData={exportData?.section}
                titleId={titleId}
            >
                <DashboardItemVisualization
                    isExport={!!exportData}
                    renderHeadline={(clientHeight) =>
                        !widget.configuration?.hideTitle && (
                            <DashboardItemHeadline
                                title={widget.title}
                                titleId={titleId}
                                clientHeight={clientHeight}
                                exportData={exportData?.title}
                            />
                        )
                    }
                    renderBeforeVisualization={() => (
                        <div className="gd-absolute-row">
                            {settings?.enableDescriptions ? (
                                <InsightWidgetDescriptionComponent
                                    insight={insight}
                                    widget={widget}
                                    screen={screen}
                                    exportData={exportData?.description}
                                />
                            ) : null}
                            {(() => {
                                const visType = insight ? insightVisualizationType(insight) : undefined;
                                if (supportsShowAsTable(visType)) {
                                    return (
                                        <ShowAsTableButton
                                            widget={widget}
                                            isWidgetAsTable={isWidgetAsTable}
                                            onClick={toggleWidgetAsTable}
                                        />
                                    );
                                }
                                return null;
                            })()}
                            <InsightMenuButtonComponent
                                insight={insight}
                                widget={widget}
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
                                widget={widget}
                                isOpen={isMenuOpen}
                                onClose={closeMenu}
                                items={menuItems}
                            />
                        );
                    }}
                >
                    {({ clientHeight, clientWidth }) => (
                        <DashboardInsight
                            clientHeight={clientHeight}
                            clientWidth={clientWidth}
                            insight={insight}
                            widget={widget}
                            onExportReady={onExportReady}
                            onLoadingChanged={onLoadingChanged}
                            onError={onError}
                            ErrorComponent={ErrorComponent}
                            LoadingComponent={LoadingComponent}
                            exportData={exportData?.widget}
                        />
                    )}
                </DashboardItemVisualization>
            </DashboardItem>

            {/* Accessibility table for export mode */}
            {accessibilityTableInsight ? (
                <div
                    className="accessibility-data-table"
                    data-widget-id={widget.identifier}
                    data-export-type="accessibility-table"
                    aria-hidden="true"
                >
                    <DashboardInsight
                        insight={accessibilityTableInsight}
                        widget={widget}
                        onExportReady={onExportReady}
                        onLoadingChanged={onLoadingChanged}
                        onError={onError}
                        ErrorComponent={ErrorComponent}
                        LoadingComponent={LoadingComponent}
                        exportData={exportData?.widget}
                    />
                </div>
            ) : null}
        </>
    );
}
