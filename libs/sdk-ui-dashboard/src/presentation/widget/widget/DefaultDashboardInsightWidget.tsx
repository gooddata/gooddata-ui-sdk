// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { insightVisualizationUrl } from "@gooddata/sdk-model";
import { IInsightWidget, ScreenSize, widgetTitle } from "@gooddata/sdk-backend-spi";
import { OnError, OnExportReady, OnLoadingChanged, VisType } from "@gooddata/sdk-ui";

import { useDashboardSelector, selectInsightsMap } from "../../../model";
import {
    DashboardItem,
    DashboardItemHeadline,
    DashboardItemVisualization,
    getVisTypeCssClass,
} from "../../presentationComponents";

import { DashboardInsightPropsProvider } from "../insight/DashboardInsightPropsContext";
import { DashboardInsight } from "../insight/DashboardInsight";
import { useInsightExport } from "../common/useInsightExport";
import { useDashboardComponentsContext } from "../../dashboardContexts";
import { DashboardInsightMenuButtonPropsProvider, DashboardInsightMenuPropsProvider } from "../insightMenu";
import { useInsightMenu } from "./useInsightMenu";

interface IDefaultDashboardInsightWidgetProps {
    widget: IInsightWidget;
    screen: ScreenSize;

    onLoadingChanged?: OnLoadingChanged;
    onExportReady?: OnExportReady;
    onError?: OnError;
}

/**
 * @internal
 */
const DefaultDashboardInsightWidgetCore: React.FC<
    IDefaultDashboardInsightWidgetProps & WrappedComponentProps
> = ({ widget, screen, onError, onExportReady, onLoadingChanged, intl }) => {
    const insights = useDashboardSelector(selectInsightsMap);

    const insight = insights.get(widget.insight)!;
    const visType = insightVisualizationUrl(insight).split(":")[1] as VisType;

    const { exportCSVEnabled, exportXLSXEnabled, onExportCSV, onExportXLSX } = useInsightExport({
        widgetRef: widget.ref,
        title: widgetTitle(widget) || intl.formatMessage({ id: "export.defaultTitle" }),
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
                getVisTypeCssClass(widget.type, visType!),
            )}
            screen={screen}
        >
            <DashboardItemVisualization
                renderHeadline={(clientHeight) => (
                    <DashboardItemHeadline title={widget.title} clientHeight={clientHeight} />
                )}
                renderBeforeVisualization={() => (
                    <DashboardInsightMenuButtonPropsProvider
                        insight={insight}
                        widget={widget}
                        isOpen={isMenuOpen}
                        onClick={openMenu}
                        items={menuItems}
                    >
                        <InsightMenuButtonComponent />
                    </DashboardInsightMenuButtonPropsProvider>
                )}
                renderAfterContent={() => {
                    if (!isMenuOpen) {
                        return null;
                    }

                    return (
                        <DashboardInsightMenuPropsProvider
                            insight={insight}
                            widget={widget}
                            isOpen={isMenuOpen}
                            onClose={closeMenu}
                            items={menuItems}
                        >
                            <InsightMenuComponent />
                        </DashboardInsightMenuPropsProvider>
                    );
                }}
            >
                {({ clientHeight, clientWidth }) => (
                    <DashboardInsightPropsProvider
                        clientHeight={clientHeight}
                        clientWidth={clientWidth}
                        insight={insight!}
                        widget={widget}
                        onExportReady={onExportReady}
                        onLoadingChanged={onLoadingChanged}
                        onError={onError}
                    >
                        <DashboardInsight />
                    </DashboardInsightPropsProvider>
                )}
            </DashboardItemVisualization>
        </DashboardItem>
    );
};

export const DefaultDashboardInsightWidget = injectIntl(DefaultDashboardInsightWidgetCore);
