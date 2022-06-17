// (C) 2020-2022 GoodData Corporation
import React, { useMemo, useCallback } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";
import {
    IInsight,
    insightVisualizationUrl,
    IInsightWidget,
    widgetTitle,
    ScreenSize,
} from "@gooddata/sdk-model";
import { OnError, OnExportReady, OnLoadingChanged, VisType } from "@gooddata/sdk-ui";

import {
    useDashboardSelector,
    selectInsightsMap,
    isCustomWidget,
    useDashboardScheduledEmails,
    selectCanExportReport,
    selectIsInEditMode,
} from "../../../model";
import {
    DashboardItem,
    DashboardItemHeadline,
    DashboardItemVisualization,
    getVisTypeCssClass,
} from "../../presentationComponents";

import { DashboardInsight } from "../insight/DashboardInsight";
import { useInsightExport } from "../common/useInsightExport";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { useInsightMenu } from "./useInsightMenu";

interface IDefaultDashboardInsightWidgetProps {
    widget: IInsightWidget;
    screen: ScreenSize;

    onLoadingChanged?: OnLoadingChanged;
    onExportReady?: OnExportReady;
    onError?: OnError;
}

// Sometimes this component is rendered even before insights are ready, which blows up.
// Since the behavior is nearly impossible to replicate reliably, let's be defensive here and not render
// anything until the insights "catch up".
const DefaultDashboardInsightWidgetWrapper: React.FC<
    IDefaultDashboardInsightWidgetProps & WrappedComponentProps
> = (props) => {
    const {
        widget,
        // @ts-expect-error Don't expose index prop on public interface (we need it only for css class for KD tests)
        index,
    } = props;
    const insights = useDashboardSelector(selectInsightsMap);
    const insight = insights.get(widget.insight);

    if (!insight) {
        // eslint-disable-next-line no-console
        console.debug(
            "DefaultDashboardInsightWidget rendered before the insights were ready, skipping render.",
        );
        return null;
    }

    return (
        <DefaultDashboardInsightWidgetCore
            {...props}
            insight={insight}
            // @ts-expect-error Don't expose index prop on public interface (we need it only for css class for KD tests)
            index={index}
        />
    );
};

/**
 * @internal
 */
const DefaultDashboardInsightWidgetCore: React.FC<
    IDefaultDashboardInsightWidgetProps & WrappedComponentProps & { insight: IInsight }
> = ({
    widget,
    insight,
    screen,
    onError,
    onExportReady,
    onLoadingChanged,
    intl,
    // @ts-expect-error Don't expose index prop on public interface (we need it only for css class for KD tests)
    index,
}) => {
    const visType = insightVisualizationUrl(insight).split(":")[1] as VisType;
    const { ref: widgetRef } = widget;

    const { exportCSVEnabled, exportXLSXEnabled, onExportCSV, onExportXLSX } = useInsightExport({
        widgetRef,
        title: widgetTitle(widget) || intl.formatMessage({ id: "export.defaultTitle" }),
        insight,
    });

    const { isScheduledEmailingVisible, enableInsightExportScheduling, onScheduleEmailingOpen } =
        useDashboardScheduledEmails();
    const canExportReport = useDashboardSelector(selectCanExportReport);

    const onScheduleExport = useCallback(() => {
        onScheduleEmailingOpen(widgetRef);
    }, [onScheduleEmailingOpen, widgetRef]);
    const scheduleExportEnabled = !isCustomWidget(widget);

    const { closeMenu, isMenuOpen, menuItems, openMenu } = useInsightMenu({
        insight,
        widget,
        exportCSVEnabled,
        exportXLSXEnabled,
        scheduleExportEnabled,
        onExportCSV,
        onExportXLSX,
        onScheduleExport,
        isScheduleExportVisible:
            isScheduledEmailingVisible && canExportReport && enableInsightExportScheduling,
    });

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

    const isEditMode = useDashboardSelector(selectIsInEditMode);

    return (
        <DashboardItem
            className={cx(
                `s-dash-item-${index}`,
                "type-visualization",
                "gd-dashboard-view-widget",
                getVisTypeCssClass(widget.type, visType),
            )}
            screen={screen}
        >
            <DashboardItemVisualization
                isSelectable={isEditMode}
                objRef={widget.ref}
                renderHeadline={(clientHeight) =>
                    !widget.configuration?.hideTitle && (
                        <DashboardItemHeadline title={widget.title} clientHeight={clientHeight} />
                    )
                }
                renderBeforeVisualization={() => (
                    <InsightMenuButtonComponent
                        insight={insight}
                        widget={widget}
                        isOpen={isMenuOpen}
                        onClick={openMenu}
                        items={menuItems}
                    />
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

export const DefaultDashboardInsightWidget = injectIntl(DefaultDashboardInsightWidgetWrapper);
