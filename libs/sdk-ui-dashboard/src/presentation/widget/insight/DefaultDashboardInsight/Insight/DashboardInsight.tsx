// (C) 2020 GoodData Corporation
import React, { useCallback, useMemo, useState, CSSProperties } from "react";
import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { createSelector } from "@reduxjs/toolkit";
import {
    insightFilters,
    insightSetFilters,
    insightVisualizationUrl,
    objRefToString,
} from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    IntlWrapper,
    OnError,
    OnLoadingChanged,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { InsightRenderer } from "@gooddata/sdk-ui-ext";
import { useDashboardComponentsContext } from "../../../../dashboardContexts";
import {
    useDashboardSelector,
    selectColorPalette,
    selectLocale,
    selectMapboxToken,
    selectSeparators,
    selectSettings,
    selectIsExport,
    selectDrillableItems,
    useDashboardAsyncRender,
    useDashboardEventDispatch,
    insightWidgetExecutionFailed,
} from "../../../../../model";
import { useResolveDashboardInsightProperties } from "../useResolveDashboardInsightProperties";
import { IDashboardInsightProps } from "../../types";
import { useWidgetFiltersQuery } from "../../../common";
import { useDashboardInsightDrills } from "./useDashboardInsightDrills";
import { CustomError } from "../CustomError/CustomError";

const DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH = 180;
const insightStyle: CSSProperties = { width: "100%", height: "100%", position: "relative", flex: "1 1 auto" };

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
        forceDisableDrillOnAxes: !drillableItems, // to keep in line with KD, enable axes drilling only if using explicit drills
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

    // State props
    const { locale, settings, colorPalette } = useDashboardSelector(selectCommonDashboardInsightProps);
    const chartConfig = useDashboardSelector(selectChartConfig);

    // Loading and rendering
    const [isVisualizationLoading, setIsVisualizationLoading] = useState(false);
    const [visualizationError, setVisualizationError] = useState<GoodDataSdkError | undefined>();

    const { onRequestAsyncRender, onResolveAsyncRender } = useDashboardAsyncRender(
        objRefToString(widget.ref),
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
            setIsVisualizationLoading(isLoading);
            onLoadingChanged?.({ isLoading });
        },
        [onLoadingChanged],
    );

    /// Filtering
    const {
        result: filtersForInsight,
        status: filtersStatus,
        error: filtersError,
    } = useWidgetFiltersQuery(widget, insight && insightFilters(insight));

    const insightWithAddedFilters = insightSetFilters(insight, filtersForInsight);
    const insightWithAddedWidgetProperties = useResolveDashboardInsightProperties({
        insight: insightWithAddedFilters ?? insight,
        widget,
    });

    const { drillableItems, onDrill, onPushData } = useDashboardInsightDrills({
        widget,
        insight,
        onDrill: onDrillFn,
    });

    const isPositionRelative =
        insight &&
        insightVisualizationUrl(insight).includes("headline") &&
        clientWidth &&
        clientWidth < DASHBOARD_LAYOUT_RESPONSIVE_SMALL_WIDTH;

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
    }, [insight]);

    // Error handling
    const handleError = useCallback<OnError>(
        (error) => {
            setVisualizationError(error);
            dispatchEvent(insightWidgetExecutionFailed(error));
            onError?.(error);
        },
        [onError, dispatchEvent],
    );

    const error = filtersError ?? visualizationError;

    return (
        <div style={insightStyle}>
            <div style={insightPositionStyle}>
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
                            pushData={onPushData}
                            ErrorComponent={ErrorComponent}
                            LoadingComponent={LoadingComponent}
                            onExportReady={onExportReady}
                        />
                    )}
                </IntlWrapper>
            </div>
        </div>
    );
};
