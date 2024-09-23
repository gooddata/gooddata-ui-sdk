// (C) 2024 GoodData Corporation
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Icon, Typography } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import cx from "classnames";

import { IDashboardVisualizationSwitcherProps } from "./types.js";
import {
    useDashboardSelector,
    selectInsightsMap,
    selectSettings,
    useDashboardScheduledEmails,
    selectIsDashboardExecuted,
    DashboardEventHandler,
    useDashboardEventsContext,
    isDashboardFilterContextChanged,
    isDashboardCommandStarted,
    DashboardCommandStarted,
    RequestAsyncRender,
    ResolveAsyncRender,
} from "../../../model/index.js";
import { useDashboardComponentsContext } from "../../../presentation/dashboardContexts/index.js";
import {
    DashboardItem,
    DashboardItemVisualization,
    getVisTypeCssClass,
} from "../../../presentation/presentationComponents/index.js";
import {
    IInsight,
    IInsightWidget,
    IVisualizationSwitcherWidget,
    insightVisualizationType,
    widgetTitle,
} from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";
import { DashboardInsight } from "../insight/DashboardInsight.js";
import { InsightWidgetDescriptionTrigger } from "../description/InsightWidgetDescriptionTrigger.js";
import { useInsightExport } from "../common/index.js";
import { useAlertingAndScheduling } from "../widget/InsightWidget/useAlertingAndScheduling.js";
import { useInsightMenu } from "../widget/InsightWidget/useInsightMenu.js";
import { VisualizationSwitcherNavigationHeader } from "../widget/VisualizationSwitcherWidget/VisualizationSwitcherNavigationHeader.js";

/**
 * @internal
 */
export const ViewModeDashboardVisualizationSwitcher: React.FC<IDashboardVisualizationSwitcherProps> = (
    props,
) => {
    const {
        widget,
        activeVisualizationId: initialActiveVisualizationId,
        onError,
        onExportReady,
        onLoadingChanged,
        screen,
    } = props;

    const [activeVisualizationId, setActiveVisualizationId] = React.useState(initialActiveVisualizationId);

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
            />
        );
    }
};

export const ViewModeDashboardVisualizationSwitcherEmpty: React.FC = () => {
    const theme = useTheme();
    const intl = useIntl();
    const emptyContentIconColor = theme?.palette?.complementary?.c7 ?? "#6D7680";

    return (
        <div className="gd-visualization-switcher-widget-empty-content">
            <Icon.VisualizationSwitcher width={32} height={38} color={emptyContentIconColor} />
            <Typography tagName="p">
                {intl.formatMessage({ id: "visualizationSwitcher.emptyContent" })}
            </Typography>
        </div>
    );
};

export interface IViewModeDashboardVisualizationSwitcherContentProps
    extends IDashboardVisualizationSwitcherProps {
    insight: IInsight;
    activeVisualization: IInsightWidget;
    onActiveVisualizationChange: (activeVisualizationId: string) => void;
}

export const ViewModeDashboardVisualizationSwitcherContent: React.FC<
    IViewModeDashboardVisualizationSwitcherContentProps
> = ({
    widget,
    insight,
    activeVisualization,
    onActiveVisualizationChange,
    screen,
    onError,
    onExportReady,
    onLoadingChanged,
}) => {
    const intl = useIntl();
    const visType = insightVisualizationType(insight) as VisType;
    const settings = useDashboardSelector(selectSettings);
    const isDashboardExecuted = useDashboardSelector(selectIsDashboardExecuted);
    const [isReexecuting, setIsReexecuting] = useState(false);

    const [_executionsProgress, setExecutionsProgress] = useState({});

    const { registerHandler, unregisterHandler } = useDashboardEventsContext();

    useEffect(() => {
        const onFilterContextChanged: DashboardEventHandler = {
            eval: (evt: any) => {
                return isDashboardFilterContextChanged(evt);
            },
            handler: () => {
                setIsReexecuting(true);
            },
        };
        const onRenderRequest: DashboardEventHandler = {
            eval: (evt: any) => {
                return (
                    isDashboardCommandStarted(evt) &&
                    evt.payload.command.type === "GDC.DASH/CMD.RENDER.ASYNC.REQUEST"
                );
            },
            handler: (evt: DashboardCommandStarted<RequestAsyncRender>) => {
                setExecutionsProgress((prev) => ({
                    ...prev,
                    [evt.payload.command.payload.id]: true,
                }));
            },
        };

        const onRenderResponse: DashboardEventHandler = {
            eval: (evt: any) => {
                return (
                    isDashboardCommandStarted(evt) &&
                    evt.payload.command.type === "GDC.DASH/CMD.RENDER.ASYNC.RESOLVE"
                );
            },
            handler: (evt: DashboardCommandStarted<ResolveAsyncRender>) => {
                setExecutionsProgress((prev) => {
                    const newProgress = {
                        ...prev,
                        [evt.payload.command.payload.id]: false,
                    };

                    if (Object.values(newProgress).every((value) => !value)) {
                        setIsReexecuting(false);
                    }
                    return newProgress;
                });
            },
        };

        registerHandler(onFilterContextChanged);
        registerHandler(onRenderRequest);
        registerHandler(onRenderResponse);

        return () => {
            unregisterHandler(onFilterContextChanged);
            unregisterHandler(onRenderRequest);
            unregisterHandler(onRenderResponse);
        };
    }, [registerHandler, unregisterHandler]);

    const { ref: widgetRef } = activeVisualization;

    const { exportCSVEnabled, exportXLSXEnabled, onExportCSV, onExportXLSX } = useInsightExport({
        widgetRef,
        title: widgetTitle(activeVisualization) || intl.formatMessage({ id: "export.defaultTitle" }),
        insight,
    });

    const {
        onScheduleEmailingOpen,
        onScheduleEmailingManagementOpen,
        isScheduledEmailingVisible,
        isScheduledManagementEmailingVisible,
        numberOfAvailableDestinations,
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
        numberOfAvailableDestinations,
    });

    ///
    const { closeMenu, isMenuOpen, menuItems, openMenu } = useInsightMenu({
        insight,
        widget: activeVisualization,
        exportCSVEnabled,
        exportXLSXEnabled,
        onExportCSV,
        onExportXLSX,
        onScheduleExport,
        onScheduleManagementExport,
        isScheduleExportVisible: isScheduledEmailingVisible,
        isScheduleExportManagementVisible: isScheduledManagementEmailingVisible,
        isAlertingVisible,
        alertingDisabled,
        alertingDisabledReason,
        scheduleExportDisabled,
        scheduleExportManagementDisabled,
        scheduleExportDisabledReason,
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
        () => InsightMenuButtonComponentProvider(insight, activeVisualization),
        [InsightMenuButtonComponentProvider, insight, activeVisualization],
    );

    const InsightMenuComponent = useMemo(
        () => InsightMenuComponentProvider(insight, activeVisualization),
        [InsightMenuComponentProvider, insight, activeVisualization],
    );

    return (
        <DashboardItem
            className={cx(
                "type-visualization",
                "gd-dashboard-view-widget",
                getVisTypeCssClass(activeVisualization.type, visType),
            )}
            screen={screen}
        >
            <DashboardItemVisualization
                renderHeadline={(clientHeight, clientWidth) => (
                    <VisualizationSwitcherNavigationHeader
                        widget={widget}
                        clientHeight={clientHeight}
                        clientWidth={clientWidth}
                        activeVisualization={activeVisualization}
                        onActiveVisualizationChange={(activeVisualizationId) =>
                            onActiveVisualizationChange(activeVisualizationId)
                        }
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
                    <DashboardInsight
                        key={activeVisualization.identifier}
                        clientHeight={clientHeight}
                        clientWidth={clientWidth}
                        insight={insight}
                        widget={activeVisualization}
                        onExportReady={onExportReady}
                        onLoadingChanged={onLoadingChanged}
                        onError={onError}
                        ErrorComponent={ErrorComponent}
                        LoadingComponent={LoadingComponent}
                    />
                    // TODO INE: once active visualization is loaded and executed then we can render on background also other switcher visualizations
                )}
            </DashboardItemVisualization>
            {isDashboardExecuted && !isReexecuting ? (
                <OtherVisualizations
                    widget={widget}
                    visualizations={widget.visualizations.filter(
                        (visualization) => visualization.identifier !== activeVisualization.identifier,
                    )}
                />
            ) : null}
        </DashboardItem>
    );
};

const OtherVisualizations: React.FC<{
    widget: IVisualizationSwitcherWidget;
    visualizations: IInsightWidget[];
}> = ({ visualizations }) => {
    const insights = useDashboardSelector(selectInsightsMap);
    const othersAreExecuted = useDashboardSelector(selectIsDashboardExecuted);
    if (!othersAreExecuted) {
        return null;
    }
    return (
        <div className="gd-visualization-switcher-hidden-visualizations">
            {visualizations.map((visualization) => {
                const insight = insights.get(visualization.insight);
                if (!insight) {
                    return null;
                }
                return (
                    <DashboardInsight
                        key={visualization.identifier}
                        clientHeight={0}
                        clientWidth={0}
                        insight={insight}
                        widget={visualization}
                        ErrorComponent={() => null}
                        LoadingComponent={() => null}
                    />
                );
            })}
        </div>
    );
};
