// (C) 2020-2022 GoodData Corporation
import React, { useMemo } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IInsight, insightVisualizationUrl } from "@gooddata/sdk-model";
import { IInsightWidget, ScreenSize, widgetTitle } from "@gooddata/sdk-backend-spi";
import { OnError, OnExportReady, OnLoadingChanged, VisType } from "@gooddata/sdk-ui";

import { useDashboardSelector, selectInsightsMap } from "../../../model";
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
    const { widget } = props;
    const insights = useDashboardSelector(selectInsightsMap);
    const insight = insights.get(widget.insight);

    if (!insight) {
        // eslint-disable-next-line no-console
        console.debug(
            "DefaultDashboardInsightWidget rendered before the insights were ready, skipping render.",
        );
        return null;
    }

    return <DefaultDashboardInsightWidgetCore {...props} insight={insight} />;
};

/**
 * @internal
 */
const DefaultDashboardInsightWidgetCore: React.FC<
    IDefaultDashboardInsightWidgetProps & WrappedComponentProps & { insight: IInsight }
> = ({ widget, insight, screen, onError, onExportReady, onLoadingChanged, intl }) => {
    const visType = insightVisualizationUrl(insight).split(":")[1] as VisType;

    const { exportCSVEnabled, exportXLSXEnabled, onExportCSV, onExportXLSX } = useInsightExport({
        widgetRef: widget.ref,
        title: widgetTitle(widget) || intl.formatMessage({ id: "export.defaultTitle" }),
        insight,
    });

    const { closeMenu, isMenuOpen, menuItems, openMenu } = useInsightMenu({
        insight,
        widget,
        exportCSVEnabled,
        exportXLSXEnabled,
        onExportCSV,
        onExportXLSX,
    });

    const { InsightMenuButtonComponentProvider, InsightMenuComponentProvider } =
        useDashboardComponentsContext();

    const InsightMenuButtonComponent = useMemo(
        () => InsightMenuButtonComponentProvider(insight, widget),
        [InsightMenuButtonComponentProvider, insight, widget],
    );

    const InsightMenuComponent = useMemo(
        () => InsightMenuComponentProvider(insight, widget),
        [InsightMenuComponentProvider, insight, widget],
    );

    return (
        <DashboardItem
            className={cx(
                "type-visualization",
                "gd-dashboard-view-widget",
                getVisTypeCssClass(widget.type, visType),
            )}
            screen={screen}
        >
            <DashboardItemVisualization
                renderHeadline={(clientHeight) => (
                    <DashboardItemHeadline title={widget.title} clientHeight={clientHeight} />
                )}
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
                    />
                )}
            </DashboardItemVisualization>
        </DashboardItem>
    );
};

export const DefaultDashboardInsightWidget = injectIntl(DefaultDashboardInsightWidgetWrapper);
