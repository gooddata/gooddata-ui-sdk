// (C) 2020-2025 GoodData Corporation
import React, { useMemo, useCallback, useEffect, useState, useRef } from "react";
import cx from "classnames";
import { useIntl } from "react-intl";
import {
    IInsight,
    widgetTitle,
    insightVisualizationType,
    IInsightWidget,
    objRefToString,
    isInsightWidget,
} from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";

import {
    useDashboardSelector,
    selectSettings,
    useDashboardScheduledEmails,
    selectDashboardUserAutomations,
    selectWidgets,
    selectIsDashboardExecuted,
    selectFocusObject,
} from "../../../../model/index.js";
import {
    DashboardItem,
    DashboardItemHeadline,
    DashboardItemVisualization,
    getVisTypeCssClass,
} from "../../../presentationComponents/index.js";
import { DashboardInsight } from "../../insight/index.js";
import { useInsightExport } from "../../common/index.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";
import { InsightWidgetDescriptionTrigger } from "../../description/InsightWidgetDescriptionTrigger.js";

import { useInsightMenu } from "./useInsightMenu.js";
import { DashboardWidgetInsightGuard } from "./DashboardWidgetInsightGuard.js";
import { IDefaultDashboardInsightWidgetProps } from "./types.js";
import { useAlertingAndScheduling } from "./useAlertingAndScheduling.js";
import { createSelector } from "@reduxjs/toolkit";

const selectIsWidgetHighlighted = (widget: IInsightWidget) =>
    createSelector(
        selectFocusObject,
        selectDashboardUserAutomations,
        selectIsDashboardExecuted,
        selectWidgets,
        (dashboardFocusObject, automations, dashboardExecuted, widgets) => {
            const { automationId, widgetId, visualizationId } = dashboardFocusObject;

            const isAutomationContext =
                !!automationId &&
                automations?.some((a) => a.id === automationId && a.metadata?.widget === widget.identifier);
            const isWidgetContext = widgetId === widget.identifier;

            const firstWidgetWithVisualization = widgets.find(
                (w) => isInsightWidget(w) && objRefToString(w.insight) === visualizationId,
            );
            const isFirstWidgetByVisualizationContext =
                visualizationId && firstWidgetWithVisualization?.identifier === widget.identifier;

            // do not highlight widget if dashboard is already executed to avoid repeating event when switching dashboard modes
            return (
                !dashboardExecuted &&
                (isAutomationContext || isWidgetContext || isFirstWidgetByVisualizationContext)
            );
        },
    );

const useOutsideClick = <T extends HTMLElement>(ref: React.RefObject<T>, callbackFn: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callbackFn();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callbackFn]);
};

export const DefaultDashboardInsightWidget: React.FC<Omit<IDefaultDashboardInsightWidgetProps, "insight">> = (
    props,
) => {
    return <DashboardWidgetInsightGuard {...props} Component={DefaultDashboardInsightWidgetCore} />;
};

/**
 * @internal
 */
const DefaultDashboardInsightWidgetCore: React.FC<
    IDefaultDashboardInsightWidgetProps & { insight?: IInsight }
> = ({ widget, insight, screen, onError, onExportReady, onLoadingChanged, dashboardItemClasses }) => {
    const intl = useIntl();
    const settings = useDashboardSelector(selectSettings);
    const { automationId, widgetId, visualizationId } = useDashboardSelector(selectFocusObject);

    const {
        isScheduledEmailingVisible,
        isScheduledManagementEmailingVisible,
        onScheduleEmailingOpen,
        onScheduleEmailingManagementOpen,
    } = useDashboardScheduledEmails();

    const visType = insight ? (insightVisualizationType(insight) as VisType) : undefined;
    const { ref: widgetRef } = widget;

    const { exportCSVEnabled, exportXLSXEnabled, onExportCSV, onExportXLSX } = useInsightExport({
        widgetRef,
        title: widgetTitle(widget) || intl.formatMessage({ id: "export.defaultTitle" }),
        insight,
    });

    const onScheduleExport = useCallback(() => {
        onScheduleEmailingOpen(widget);
    }, [onScheduleEmailingOpen, widget]);

    const onScheduleManagementExport = useCallback(() => {
        onScheduleEmailingManagementOpen(widget);
    }, [onScheduleEmailingManagementOpen, widget]);

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
        () => InsightMenuButtonComponentProvider(insight, widget),
        [InsightMenuButtonComponentProvider, insight, widget],
    );

    const InsightMenuComponent = useMemo(
        () => InsightMenuComponentProvider(insight, widget),
        [InsightMenuComponentProvider, insight, widget],
    );

    const isHighlighted = useDashboardSelector(selectIsWidgetHighlighted(widget));
    const [keepHighlight, setKeepHighlight] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isHighlighted && !keepHighlight) {
            // We only want to scroll to element when one context property is specified at a time
            const shouldScrollTo = [automationId, widgetId, visualizationId].filter(Boolean).length === 1;

            if (elementRef.current && shouldScrollTo) {
                elementRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            }

            setKeepHighlight(true);
        }
        // We intentionally exclude keepHighlight
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHighlighted, automationId, visualizationId, widgetId]);

    // Remove highlight on outside click
    const removeHighlight = useCallback(() => setKeepHighlight(false), []);
    useOutsideClick(elementRef, removeHighlight);

    return (
        <DashboardItem
            className={cx(
                dashboardItemClasses,
                "type-visualization",
                "gd-dashboard-view-widget",
                getVisTypeCssClass(widget.type, visType),
                { "gd-highlighted": keepHighlight },
            )}
            screen={screen}
            ref={elementRef}
        >
            <DashboardItemVisualization
                renderHeadline={(clientHeight) =>
                    !widget.configuration?.hideTitle && (
                        <DashboardItemHeadline title={widget.title} clientHeight={clientHeight} />
                    )
                }
                renderBeforeVisualization={() => (
                    <div className="gd-absolute-row">
                        {settings?.enableDescriptions ? (
                            <InsightWidgetDescriptionTrigger
                                insight={insight}
                                widget={widget}
                                screen={screen}
                            />
                        ) : null}
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
                    />
                )}
            </DashboardItemVisualization>
        </DashboardItem>
    );
};
