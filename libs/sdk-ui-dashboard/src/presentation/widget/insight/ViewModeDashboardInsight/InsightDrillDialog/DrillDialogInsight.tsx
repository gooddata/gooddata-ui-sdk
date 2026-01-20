// (C) 2020-2026 GoodData Corporation

import {
    type CSSProperties,
    type ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { createSelector } from "@reduxjs/toolkit";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IExecutionConfig, insightSetFilters } from "@gooddata/sdk-model";
import {
    type GoodDataSdkError,
    type OnError,
    type OnLoadingChanged,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import { useDrillDialogInsightDrills } from "./useDrillDialogInsightDrills.js";
import { useDrillDialogSyncInsightProperties } from "./useDrillDialogSyncInsightProperties.js";
import {
    selectAgGridToken,
    selectCatalogAttributes,
    selectColorPalette,
    selectDrillableItems,
    selectExecutionTimestamp,
    selectIsExport,
    selectLocale,
    selectMapboxToken,
    selectPreloadedAttributesWithReferences,
    selectSeparators,
    selectSettings,
    useDashboardSelector,
    useWidgetFilters,
} from "../../../../../model/index.js";
import { IntlWrapper } from "../../../../localization/index.js";
import { getGeoDefaultDisplayFormRefs } from "../../geoDefaultDisplayFormRefs.js";
import { InsightBody } from "../../InsightBody.js";
import { convertInsightToTableDefinition } from "../../insightToTable.js";
import { type IDashboardInsightProps } from "../../types.js";
import { CustomError } from "../CustomError/CustomError.js";
import { useInsightPositionStyle } from "../useInsightPositionStyle.js";
import { useResolveDashboardInsightProperties } from "../useResolveDashboardInsightProperties.js";

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
    [selectMapboxToken, selectAgGridToken, selectSeparators, selectDrillableItems, selectIsExport],
    (mapboxToken, agGridToken, separators, drillableItems, isExport) => ({
        mapboxToken,
        agGridToken,
        separators,
        forceDisableDrillOnAxes: !drillableItems.length, // to keep in line with KD, enable axes drilling only if using explicit drills
        isExportMode: isExport,
    }),
);

/**
 * @internal
 */
export function DrillDialogInsight({
    insight,
    widget,
    backend,
    workspace,
    drillStep,
    onError,
    onDrill: onDrillFn,
    isWidgetAsTable,
    onExportReady,
    onLoadingChanged,
    onWidgetFiltersReady,
    pushData,
    ErrorComponent,
    LoadingComponent,
}: IDashboardInsightProps): ReactElement {
    const visualizationContainerRef = useRef<HTMLDivElement>(null);

    // Context
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

    // State props
    const { locale, settings, colorPalette } = useDashboardSelector(selectCommonDashboardInsightProps);
    const chartConfig = useDashboardSelector(selectChartConfig);
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);
    const preloadedAttributesWithReferences = useDashboardSelector(selectPreloadedAttributesWithReferences);

    // Loading and rendering
    const [isVisualizationLoading, setIsVisualizationLoading] = useState(false);
    const [visualizationError, setVisualizationError] = useState<GoodDataSdkError | undefined>();

    const handleLoadingChanged = useCallback<OnLoadingChanged>(({ isLoading }) => {
        setIsVisualizationLoading(isLoading);
        onLoadingChanged?.({ isLoading });
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const { syncedInsight, handlePushData } = useDrillDialogSyncInsightProperties({
        insight: insightWithAddedWidgetProperties,
        drillStepInsightId: drillStep?.insight.insight.identifier,
        onPushData,
        pushData,
        isWidgetAsTable,
    });

    // Convert insight to table format if needed for drill dialog
    const finalInsight = useMemo(() => {
        const defaultDisplayFormRefs = getGeoDefaultDisplayFormRefs(
            syncedInsight,
            settings,
            catalogAttributes,
            preloadedAttributesWithReferences,
        );
        if (!isWidgetAsTable) {
            return syncedInsight;
        }
        return convertInsightToTableDefinition(syncedInsight, { settings, defaultDisplayFormRefs });
    }, [isWidgetAsTable, syncedInsight, settings, catalogAttributes, preloadedAttributesWithReferences]);

    // CSS
    const insightPositionStyle = useInsightPositionStyle();

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
                        <div
                            ref={visualizationContainerRef}
                            className="insight-view-visualization"
                            style={insightWrapperStyle}
                        >
                            <InsightBody
                                widget={widget}
                                insight={finalInsight}
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
}
