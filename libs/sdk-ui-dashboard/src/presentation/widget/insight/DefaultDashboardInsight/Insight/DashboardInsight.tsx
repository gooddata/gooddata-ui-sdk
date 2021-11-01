// (C) 2020 GoodData Corporation
import React, { CSSProperties, useCallback, useMemo, useState } from "react";
import { IUserWorkspaceSettings, widgetRef } from "@gooddata/sdk-backend-spi";
import { createSelector } from "@reduxjs/toolkit";
import { insightSetFilters, insightVisualizationUrl, objRefToString } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    IPushData,
    OnError,
    OnLoadingChanged,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { InsightRenderer } from "@gooddata/sdk-ui-ext";

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
    useDashboardEventDispatch,
    useDashboardSelector,
    useWidgetExecutionsHandler,
} from "../../../../../model";
import { useResolveDashboardInsightProperties } from "../useResolveDashboardInsightProperties";
import { IDashboardInsightProps } from "../../types";
import { useWidgetFiltersQuery } from "../../../common";
import { useDashboardInsightDrills } from "./useDashboardInsightDrills";
import { CustomError } from "../CustomError/CustomError";
import { DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH } from "../../../../constants";
import { IntlWrapper } from "../../../../localization";

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

    const dispatchEvent = useDashboardEventDispatch();
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

    /// Filtering
    const {
        result: filtersForInsight,
        status: filtersStatus,
        error: filtersError,
    } = useWidgetFiltersQuery(widget);

    const insightWithAddedFilters = useMemo(
        () => insightSetFilters(insight, filtersForInsight),
        [insight, filtersForInsight],
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

    // Error handling
    const handleError = useCallback<OnError>(
        (error) => {
            setVisualizationError(error);
            onError?.(error);
            executionsHandler.onError(error);
        },
        [onError, dispatchEvent, executionsHandler.onError],
    );

    const error = filtersError ?? visualizationError;

    return (
        <div className="visualization-content">
            <div className="gd-visualization-content" style={insightPositionStyle}>
                <IntlWrapper locale={locale}>
                    {(filtersStatus === "running" || isVisualizationLoading) && <LoadingComponent />}
                    {error && (
                        <CustomError
                            error={error}
                            isCustomWidgetHeightEnabled={!!settings?.enableKDWidgetCustomHeight}
                            height={clientHeight}
                            width={clientWidth}
                        />
                    )}
                    {filtersStatus === "success" && (
                        <div
                            className="insight-view-visualization"
                            style={isVisualizationLoading ? { height: 0 } : undefined}
                        >
                            <InsightRenderer
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
                    )}
                </IntlWrapper>
            </div>
        </div>
    );
};
