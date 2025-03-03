// (C) 2020-2025 GoodData Corporation
import React, { CSSProperties, useRef, useCallback, useEffect, useMemo, useState } from "react";
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

import { useDashboardComponentsContext } from "../../../../dashboardContexts/index.js";
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
    selectIsInEditMode,
    selectCrossFilteringSelectedPointsByWidgetRef,
    useWidgetFilters,
    selectEnableExecutionCancelling,
} from "../../../../../model/index.js";

import { useResolveDashboardInsightProperties } from "../useResolveDashboardInsightProperties.js";
import { IDashboardInsightProps } from "../../types.js";
import { useDashboardInsightDrills } from "./useDashboardInsightDrills.js";
import { CustomError } from "../CustomError/CustomError.js";
import { DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH } from "../../../../constants/index.js";
import { IntlWrapper } from "../../../../localization/index.js";
import { InsightBody } from "../../InsightBody.js";
import { useHandlePropertiesPushData } from "./useHandlePropertiesPushData.js";
import { useVisualizationExportData } from "../../../../export/index.js";

const selectCommonDashboardInsightProps = createSelector(
    [selectLocale, selectSettings, selectColorPalette],
    (locale, settings, colorPalette) => ({
        locale,
        settings,
        colorPalette,
    }),
);

const selectChartConfig = createSelector(
    [
        selectMapboxToken,
        selectSeparators,
        selectDrillableItems,
        selectIsExport,
        selectIsInEditMode,
        selectEnableExecutionCancelling,
    ],
    (mapboxToken, separators, drillableItems, isExportMode, isInEditMode, enableExecutionCancelling) => ({
        mapboxToken,
        separators,
        forceDisableDrillOnAxes: !drillableItems?.length, // to keep in line with KD, enable axes drilling only if using explicit drills
        isExportMode,
        isInEditMode,
        enableExecutionCancelling,
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
        afterRender,
        onExportReady,
        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,
        exportData,
    } = props;

    const ref = widgetRef(widget);

    // register as early as possible
    const [initialRegistered, setInitialRegistered] = useState(true);
    const afterRenderCalled = useRef(false);
    useEffect(() => {
        onRequestAsyncRender();
    }, []);

    // Custom components
    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext({
        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,
    });

    // Context
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

    const executionsHandler = useWidgetExecutionsHandler(ref);

    // State props
    const { locale, settings, colorPalette } = useDashboardSelector(selectCommonDashboardInsightProps);
    const { enableKDWidgetCustomHeight, enableDashboardAfterRenderDetection } =
        useDashboardSelector(selectSettings);
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const crossFilteringSelectedPoints = useDashboardSelector(
        selectCrossFilteringSelectedPointsByWidgetRef(ref),
    );

    const chartConfig = useDashboardSelector(selectChartConfig);

    // Loading and rendering
    const [isVisualizationLoading, setIsVisualizationLoading] = useState(false);
    const [isVisualizationInitializing, setIsVisualizationInitializing] = useState(true);
    const [visualizationError, setVisualizationError] = useState<GoodDataSdkError | undefined>();

    const { onRequestAsyncRender, onResolveAsyncRender } = useDashboardAsyncRender(objRefToString(ref));
    const handleLoadingChanged = useCallback<OnLoadingChanged>(
        ({ isLoading }) => {
            if (isLoading) {
                // when loading starts, reset the afterRenderCalled
                if (enableDashboardAfterRenderDetection) {
                    afterRenderCalled.current = false;
                }

                if (!initialRegistered) {
                    // request when loading changed in later phases
                    // such as re-execution on filters change
                    onRequestAsyncRender();
                }

                // if we started loading, any previous vis error is obsolete at this point, get rid of it
                setVisualizationError(undefined);
            } else {
                // reset after first successful execution
                if (initialRegistered) {
                    setInitialRegistered(false);
                }

                // fallback to onLoadingChange-based resolve if afterRender detection not enabled
                if (!enableDashboardAfterRenderDetection) {
                    onResolveAsyncRender();
                }
            }
            executionsHandler.onLoadingChanged({ isLoading });
            setIsVisualizationLoading(isLoading);
            setIsVisualizationInitializing(isLoading);
            onLoadingChanged?.({ isLoading });
        },
        [
            onLoadingChanged,
            executionsHandler.onLoadingChanged,
            initialRegistered,
            enableDashboardAfterRenderDetection,
        ],
    );

    const handleAfterRender = useCallback(() => {
        if (enableDashboardAfterRenderDetection && !afterRenderCalled.current) {
            afterRenderCalled.current = true;
            onResolveAsyncRender();
        }
    }, [afterRender, onResolveAsyncRender, enableDashboardAfterRenderDetection]);

    // Filtering
    const {
        result: filtersForInsight,
        status: filtersStatus,
        error: filtersError,
    } = useWidgetFilters(widget, insight);

    /**
     * Filters hash for hooks dependencies
     * We use stringified value to avoid setting equal filters. This prevents cascading cache invalidation
     * and expensive re-renders down the line. The stringification is worth it as the filters are usually
     * pretty small thus saving more time than it is taking.
     */
    const filtersForInsightHash = stringify(filtersForInsight);

    const insightWithAddedFilters = useMemo(
        () => insightSetFilters(insight, filtersForInsight),
        [insight, filtersForInsightHash],
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

    const handlePropertiesPushData = useHandlePropertiesPushData(widget, insight);

    const handlePushData = useCallback(
        (data: IPushData): void => {
            onPushData(data);
            executionsHandler.onPushData(data);
            handlePropertiesPushData(data);
        },
        [onPushData, executionsHandler.onPushData, handlePropertiesPushData],
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
            // rendered with error, notify if we're using afterRender to detect
            if (enableDashboardAfterRenderDetection) {
                onResolveAsyncRender();
            }
        },
        [onError, executionsHandler.onError, enableDashboardAfterRenderDetection, onResolveAsyncRender],
    );

    const effectiveError = filtersError ?? visualizationError;

    useEffect(() => {
        // need reset custom error when filters changed
        // one of custom error is no data
        setVisualizationError(undefined);
    }, [filtersForInsightHash]);

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

    // we need wait with insight rendering until filters are successfully resolved
    // loading of insight is initiated after filters are successful, until then show loading component
    // if filter status is success and visualization is loading, render both loading and insight
    const loading = filtersStatus === "running" || isVisualizationLoading;

    const exportDataVis = useVisualizationExportData(
        exportData,
        isVisualizationInitializing,
        !!effectiveError,
    );

    const renderComponent = () => {
        if (effectiveError) {
            return (
                <CustomError
                    error={effectiveError}
                    isCustomWidgetHeightEnabled={!!settings?.enableKDWidgetCustomHeight}
                    height={clientHeight}
                    width={clientWidth}
                />
            );
        } else {
            return (
                <>
                    {loading ? (
                        <div className="insight-view-loader">
                            <LoadingComponent />
                        </div>
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
                                config={{
                                    ...chartConfig,
                                    selectedPoints: crossFilteringSelectedPoints,
                                }}
                                onLoadingChanged={handleLoadingChanged}
                                locale={locale}
                                settings={settings as IUserWorkspaceSettings}
                                colorPalette={colorPalette}
                                onError={handleError}
                                pushData={handlePushData}
                                ErrorComponent={ErrorComponent}
                                LoadingComponent={LoadingComponent}
                                onExportReady={onExportReady}
                                afterRender={handleAfterRender}
                            />
                        </div>
                    ) : null}
                </>
            );
        }
    };

    return (
        <div
            className={cx("visualization-content", {
                "in-edit-mode": isInEditMode,
            })}
            {...exportDataVis}
        >
            <div
                className={cx("gd-visualization-content", { zoomable: isZoomable })}
                style={insightPositionStyle}
            >
                <IntlWrapper locale={locale}>{renderComponent()}</IntlWrapper>
            </div>
        </div>
    );
};
