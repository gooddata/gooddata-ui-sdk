// (C) 2020 GoodData Corporation
import React, { useCallback, useState } from "react";
import cx from "classnames";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { areObjRefsEqual, insightVisualizationUrl } from "@gooddata/sdk-model";
import { IInsightWidget, ScreenSize, widgetTitle } from "@gooddata/sdk-backend-spi";
import {
    GoodDataSdkError,
    IExportFunction,
    OnError,
    OnExportReady,
    OnLoadingChanged,
    VisType,
} from "@gooddata/sdk-ui";

import { selectInsights, useDashboardSelector } from "../../../model";
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
import { isDataError } from "../common";
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
    const insights = useDashboardSelector(selectInsights);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [exportFunction, setExportFunction] = useState<IExportFunction | undefined>();

    // insight rendering status - needed for showing/hiding export options
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<GoodDataSdkError | undefined>();

    const handleLoadingChanged = useCallback<OnLoadingChanged>(
        ({ isLoading }) => {
            setIsLoading(isLoading);
            onLoadingChanged?.({ isLoading });
            if (isLoading) {
                setError(undefined);
            }
        },
        [onLoadingChanged],
    );

    const handleError = useCallback<OnError>(
        (newError) => {
            setError(newError);
            onError?.(newError);
        },
        [onError],
    );

    const insight = insights.find((i) => areObjRefsEqual(i.insight.ref, widget.insight))!;
    const visType = insightVisualizationUrl(insight).split(":")[1] as VisType;

    const handleExportReady = useCallback<OnExportReady>(
        (newExportFunction) => {
            setExportFunction(() => newExportFunction); // for functions in state, we always need to use the extra lambda
            onExportReady?.(newExportFunction);
        },
        [onExportReady],
    );

    const bubbleMessageKey = isDataError(error)
        ? "options.menu.unsupported.error"
        : "options.menu.unsupported.loading";

    const { exportCSVEnabled, exportXLSXEnabled, onExportCSV, onExportXLSX } = useInsightExport({
        error,
        isLoading,
        exportFunction,
        title: widgetTitle(widget) || intl.formatMessage({ id: "export.defaultTitle" }),
    });

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
                            exportFunction={exportFunction}
                            bubbleMessageKey={bubbleMessageKey}
                            exportCSVDisabled={!exportCSVEnabled}
                            onExportCSV={onExportCSV}
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
                        onExportReady={handleExportReady}
                        onLoadingChanged={handleLoadingChanged}
                        onError={handleError}
                    >
                        <DashboardInsight />
                    </DashboardInsightPropsProvider>
                )}
            </DashboardItemVisualization>
        </DashboardItem>
    );
};

export const DefaultDashboardInsightWidget = injectIntl(DefaultDashboardInsightWidgetCore);
