// (C) 2020-2022 GoodData Corporation
import React, { CSSProperties, useCallback, useMemo, useState } from "react";
import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { createSelector } from "@reduxjs/toolkit";
import {
    insightProperties,
    insightSetFilters,
    insightVisualizationUrl,
    objRefToString,
    widgetRef,
} from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    IPushData,
    OnError,
    OnLoadingChanged,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import stringify from "json-stable-stringify";
import cx from "classnames";

import { useDashboardComponentsContext } from "../../../../dashboardContexts";
import {
    selectColorPalette,
    selectDrillableItems,
    selectIsExport,
    selectLocale,
    selectMapboxToken,
    selectSeparators,
    selectSettings,
    useDashboardAsyncRender,
    useDashboardSelector,
    useWidgetExecutionsHandler,
} from "../../../../../model";
import { useResolveDashboardInsightProperties } from "../useResolveDashboardInsightProperties";
import { IDashboardInsightProps } from "../../types";
import { useWidgetFilters } from "../../../common";
import { useDashboardInsightDrills } from "./useDashboardInsightDrills";
import { CustomError } from "../CustomError/CustomError";
import { DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH } from "../../../../constants";
import { IntlWrapper } from "../../../../localization";
import { InsightBody } from "../../InsightBody";

const selectCommonDashboardInsightProps = createSelector(
    [selectLocale, selectSettings, selectColorPalette],
    (locale, settings, colorPalette) => ({
        locale,
        settings,
        colorPalette,
    }),
);

const selectChartConfig = createSelector(
    [selectMapboxToken, selectSeparators, selectDrillableItems, selectIsExport],
    (mapboxToken, separators, drillableItems, isExport) => ({
        mapboxToken,
        separators,
        forceDisableDrillOnAxes: !drillableItems?.length, // to keep in line with KD, enable axes drilling only if using explicit drills
        isExportMode: isExport,
    }),
);

/**
 * @internal
 */
export const DashboardInsight = (props: IDashboardInsightProps): JSX.Element => {
    const {
        insight,
        widget,
        clientHeight,
        clientWidth,
        backend,
        workspace,
        onError,
        onDrill: onDrillFn,
        onLoadingChanged,
        onExportReady,
        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,
    } = props;

    // Custom components
    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext({
        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,
    });

    // Context
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

    const executionsHandler = useWidgetExecutionsHandler(widgetRef(widget));

    // State props
    const { locale, settings, colorPalette } = useDashboardSelector(selectCommonDashboardInsightProps);
    const { enableKDWidgetCustomHeight } = useDashboardSelector(selectSettings);

    const chartConfig = useDashboardSelector(selectChartConfig);

    // Loading and rendering
    const [isVisualizationLoading, setIsVisualizationLoading] = useState(false);
    const [visualizationError, setVisualizationError] = useState<GoodDataSdkError | undefined>();

    const { onRequestAsyncRender, onResolveAsyncRender } = useDashboardAsyncRender(
        objRefToString(widgetRef(widget)),
    );
    const handleLoadingChanged = useCallback<OnLoadingChanged>(
        ({ isLoading }) => {
            if (isLoading) {
                onRequestAsyncRender();
                // if we started loading, any previous vis error is obsolete at this point, get rid of it
                setVisualizationError(undefined);
            } else {
                onResolveAsyncRender();
            }
            executionsHandler.onLoadingChanged({ isLoading });
            setIsVisualizationLoading(isLoading);
            onLoadingChanged?.({ isLoading });
        },
        [onLoadingChanged, executionsHandler.onLoadingChanged],
    );

    // Filtering
    const {
        result: filtersForInsight,
        status: filtersStatus,
        error: filtersError,
    } = useWidgetFilters(widget);

    const insightWithAddedFilters = useMemo(
        () => insightSetFilters(insight, filtersForInsight),
        [
            insight,
            /**
             * We use stringified value to avoid setting equal filters. This prevents cascading cache invalidation
             * and expensive re-renders down the line. The stringification is worth it as the filters are usually
             * pretty small thus saving more time than it is taking.
             */
            stringify(filtersForInsight),
        ],
    );

    const insightWithAddedWidgetProperties = useResolveDashboardInsightProperties({
        insight: insightWithAddedFilters ?? insight,
        widget,
    });

    const { drillableItems, onDrill, onPushData } = useDashboardInsightDrills({
        widget,
        insight,
        onDrill: onDrillFn,
    });

    const handlePushData = useCallback(
        (data: IPushData): void => {
            onPushData(data);
            executionsHandler.onPushData(data);
        },
        [onPushData, executionsHandler.onPushData],
    );

    const isPositionRelative =
        insight &&
        insightVisualizationUrl(insight).includes("headline") &&
        clientWidth &&
        clientWidth < DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH &&
        !enableKDWidgetCustomHeight;

    // Error handling
    const handleError = useCallback<OnError>(
        (error) => {
            setVisualizationError(error);
            onError?.(error);
            executionsHandler.onError(error);
        },
        [onError, executionsHandler.onError],
    );

    const effectiveError = filtersError ?? visualizationError;

    // CSS
    const insightPositionStyle: CSSProperties = useMemo(() => {
        return {
            width: "100%",
            height: "100%",
            position:
                // Headline violates the layout contract.
                // It should fit parent height and adapt to it as other visualizations.
                // Now, it works differently for the Headline - parent container adapts to Headline size.
                isPositionRelative ? "relative" : "absolute",
        };
    }, [isPositionRelative]);

    const insightWrapperStyle: CSSProperties | undefined = useMemo(() => {
        return isVisualizationLoading || effectiveError ? { height: 0 } : undefined;
    }, [isVisualizationLoading, effectiveError]);

    const visualizationProperties = insightProperties(insightWithAddedWidgetProperties);
    const isZoomable = visualizationProperties?.controls?.zoomInsight;

    return (
        <div className="visualization-content">
            <div
                className={cx("gd-visualization-content", { zoomable: isZoomable })}
                style={insightPositionStyle}
            >
                <IntlWrapper locale={locale}>
                    {filtersStatus === "running" || isVisualizationLoading ? <LoadingComponent /> : null}
                    {effectiveError ? (
                        <CustomError
                            error={effectiveError}
                            isCustomWidgetHeightEnabled={!!settings?.enableKDWidgetCustomHeight}
                            height={clientHeight}
                            width={clientWidth}
                        />
                    ) : null}
                    {filtersStatus === "success" ? (
                        <div className="insight-view-visualization" style={insightWrapperStyle}>
                            <InsightBody
                                widget={widget}
                                insight={insightWithAddedWidgetProperties}
                                backend={effectiveBackend}
                                workspace={effectiveWorkspace}
                                drillableItems={drillableItems}
                                onDrill={onDrill}
                                config={chartConfig}
                                onLoadingChanged={handleLoadingChanged}
                                locale={locale}
                                settings={settings as IUserWorkspaceSettings}
                                colorPalette={colorPalette}
                                onError={handleError}
                                pushData={handlePushData}
                                ErrorComponent={ErrorComponent}
                                LoadingComponent={LoadingComponent}
                                onExportReady={onExportReady}
                            />
                        </div>
                    ) : null}
                </IntlWrapper>
            </div>
        </div>
    );
};
