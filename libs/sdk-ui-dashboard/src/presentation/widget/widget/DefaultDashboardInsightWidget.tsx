// (C) 2020 GoodData Corporation
import React, { useCallback, useState } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { insightVisualizationUrl } from "@gooddata/sdk-model";
import { IInsightWidget, ScreenSize, widgetTitle } from "@gooddata/sdk-backend-spi";
import { OnError, OnExportReady, OnLoadingChanged, VisType } from "@gooddata/sdk-ui";

import { selectExecutionResultByRef, useDashboardSelector, selectInsightsMap } from "../../../model";
import {
    DashboardItem,
    DashboardItemHeadline,
    DashboardItemVisualization,
    getVisTypeCssClass,
} from "../../presentationComponents";

import { DashboardInsightPropsProvider } from "../insight/DashboardInsightPropsContext";
import { DashboardInsight } from "../insight/DashboardInsight";
import { OptionsButton } from "./OptionsMenu/OptionsButton";
import { OptionsMenu } from "./OptionsMenu/OptionsMenu";
import { isDataError } from "../../../_staging/errors/errorPredicates";
import { useInsightExport } from "../common/useInsightExport";

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

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const insight = insights.get(widget.insight)!;
    const visType = insightVisualizationUrl(insight).split(":")[1] as VisType;

    const execution = useDashboardSelector(selectExecutionResultByRef(widget.ref));

    const { exportCSVEnabled, exportXLSXEnabled, onExportCSV, onExportXLSX } = useInsightExport({
        widgetRef: widget.ref,
        title: widgetTitle(widget) || intl.formatMessage({ id: "export.defaultTitle" }),
    });

    const bubbleMessageKey = isDataError(execution?.error)
        ? "options.menu.unsupported.error"
        : "options.menu.unsupported.loading";

    const onExportCSVWrapped = useCallback(() => {
        setIsMenuOpen(false);
        onExportCSV();
    }, [onExportCSV]);

    const onExportXLSXWrapped = useCallback(() => {
        setIsMenuOpen(false);
        onExportXLSX();
    }, [onExportXLSX]);

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
                    <OptionsButton
                        isMenuOpen={isMenuOpen}
                        onClick={() => setIsMenuOpen(true)}
                        visType={visType}
                        widget={widget}
                    />
                )}
                renderAfterContent={() => {
                    if (!isMenuOpen) {
                        return null;
                    }

                    return (
                        <OptionsMenu
                            widget={widget}
                            hideOptionsMenu={() => setIsMenuOpen(false)}
                            bubbleMessageKey={bubbleMessageKey}
                            exportCSVDisabled={!exportCSVEnabled}
                            onExportCSV={onExportCSVWrapped}
                            exportXLSXDisabled={!exportXLSXEnabled}
                            onExportXLSX={onExportXLSXWrapped}
                        />
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
