// (C) 2020-2025 GoodData Corporation
import React, { useCallback, useMemo, useState, CSSProperties, useEffect } from "react";
import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { createSelector } from "@reduxjs/toolkit/dist/redux-toolkit.esm.js";
import { IExecutionConfig, insightSetFilters } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    IPushData,
    OnError,
    OnLoadingChanged,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import {
    useDashboardSelector,
    selectColorPalette,
    selectLocale,
    selectMapboxToken,
    selectSeparators,
    selectSettings,
    selectIsExport,
    selectDrillableItems,
    useWidgetFilters,
    selectExecutionTimestamp,
} from "../../../../../model/index.js";
import { IDashboardInsightProps } from "../../types.js";
import { useResolveDashboardInsightProperties } from "../useResolveDashboardInsightProperties.js";
import { useDrillDialogInsightDrills } from "./useDrillDialogInsightDrills.js";
import { CustomError } from "../CustomError/CustomError.js";
import { IntlWrapper } from "../../../../localization/index.js";
import { InsightBody } from "../../InsightBody.js";
import { useInsightPositionStyle } from "../useInsightPositionStyle.js";

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
        forceDisableDrillOnAxes: !drillableItems.length, // to keep in line with KD, enable axes drilling only if using explicit drills
        isExportMode: isExport,
    }),
);

/**
 * @internal
 */
export const DrillDialogInsight = (props: IDashboardInsightProps): JSX.Element => {
    const {
        insight,
        widget,
        backend,
        workspace,
        drillStep,
        onError,
        onDrill: onDrillFn,
        onExportReady,
        onLoadingChanged,
        onWidgetFiltersReady,
        pushData,
        ErrorComponent,
        LoadingComponent,
    } = props;

    // Context
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

    // State props
    const { locale, settings, colorPalette } = useDashboardSelector(selectCommonDashboardInsightProps);
    const chartConfig = useDashboardSelector(selectChartConfig);

    // Loading and rendering
    const [isVisualizationLoading, setIsVisualizationLoading] = useState(false);
    const [visualizationError, setVisualizationError] = useState<GoodDataSdkError | undefined>();

    const handleLoadingChanged = useCallback<OnLoadingChanged>(({ isLoading }) => {
        setIsVisualizationLoading(isLoading);
        onLoadingChanged?.({ isLoading });
    }, []);

    // Filtering
    const {
        result: filtersForInsight,
        status: filtersStatus,
        error: filtersError,
    } = useWidgetFilters(widget, insight);

    const insightWithAddedFilters = useMemo(
        () => insightSetFilters(insight, filtersForInsight),
        [insight, filtersForInsight],
    );

    const insightWithAddedWidgetProperties = useResolveDashboardInsightProperties({
        insight: insightWithAddedFilters ?? insight,
        widget,
    });

    const { drillableItems, onDrill, onPushData } = useDrillDialogInsightDrills({
        widget,
        insight: insightWithAddedFilters ?? insight,
        onDrill: onDrillFn,
    });

    const handlePushData = useCallback(
        (data: IPushData) => {
            onPushData(data);
            pushData?.(data);
        },
        [onPushData, pushData],
    );

    // CSS
    const insightPositionStyle = useInsightPositionStyle(insight);

    // Error handling
    const handleError = useCallback<OnError>(
        (error) => {
            setVisualizationError(error);
            onError?.(error);
        },
        [onError],
    );
    const effectiveError = filtersError ?? visualizationError;

    const insightWrapperStyle: CSSProperties | undefined = useMemo(() => {
        return isVisualizationLoading || effectiveError ? { height: 0 } : undefined;
    }, [isVisualizationLoading, effectiveError]);

    useEffect(() => {
        onWidgetFiltersReady?.(filtersForInsight);
    }, [filtersForInsight, onWidgetFiltersReady]);

    const executionTimestamp = useDashboardSelector(selectExecutionTimestamp);
    const execConfig: IExecutionConfig = useMemo(
        () => ({ timestamp: executionTimestamp }),
        [executionTimestamp],
    );

    return (
        <div style={insightStyle}>
            <div style={insightPositionStyle}>
                <IntlWrapper locale={locale}>
                    {filtersStatus === "running" || isVisualizationLoading ? <LoadingComponent /> : null}
                    {effectiveError ? (
                        <CustomError
                            error={effectiveError}
                            // drill dialog does not measure its size but is always large enough to fit the full content
                            forceFullContent
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
                                onExportReady={onExportReady}
                                pushData={handlePushData}
                                ErrorComponent={ErrorComponent}
                                LoadingComponent={LoadingComponent}
                                execConfig={execConfig}
                                drillStep={drillStep}
                            />
                        </div>
                    ) : null}
                </IntlWrapper>
            </div>
        </div>
    );
};
