// (C) 2020 GoodData Corporation
import React, { useCallback, useMemo, useState, CSSProperties } from "react";
import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    IFilter,
    insightFilters,
    insightSetFilters,
    insightVisualizationUrl,
    objRefToString,
} from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    IntlWrapper,
    IPushData,
    OnError,
    OnLoadingChanged,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { InsightError, InsightRenderer } from "@gooddata/sdk-ui-ext";

import { useDashboardComponentsContext } from "../../../dashboardContexts";
import {
    useDashboardSelector,
    selectColorPalette,
    selectLocale,
    selectMapboxToken,
    selectSeparators,
    selectSettings,
    selectIsExport,
    useDashboardAsyncRender,
} from "../../../../model";

import { useResolveDashboardInsightProperties } from "./useResolveDashboardInsightProperties";
import { useDashboardInsightDrills } from "./useDashboardInsightDrills";
import { IDashboardInsightProps } from "../types";
import { useWidgetFiltersQuery } from "../../common";

const insightStyle: CSSProperties = { width: "100%", height: "100%", position: "relative", flex: "1 1 auto" };

/**
 * @internal
 */
export const DashboardInsightCore = (props: IDashboardInsightProps): JSX.Element => {
    const {
        insight,
        widget,
        clientHeight,
        backend,
        workspace,
        disableWidgetImplicitDrills,
        drillableItems,
        onDrill,
        onError,
        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,
        drillTargets,
        onAvailableDrillTargetsReceived,
    } = props;

    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext({
        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,
    });

    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

    const separators = useDashboardSelector(selectSeparators);
    const mapboxToken = useDashboardSelector(selectMapboxToken);
    const locale = useDashboardSelector(selectLocale);
    const settings = useDashboardSelector(selectSettings);
    const colorPalette = useDashboardSelector(selectColorPalette);
    const isExport = useDashboardSelector(selectIsExport);

    const {
        result: filtersForInsight,
        status: filtersStatus,
        error: filtersError,
    } = useWidgetFiltersQuery(widget, insight && insightFilters(insight));

    const [isVisualizationLoading, setIsVisualizationLoading] = useState(false);
    const [visualizationError, setVisualizationError] = useState<GoodDataSdkError | undefined>();

    const { onRequestAsyncRender, onResolveAsyncRender } = useDashboardAsyncRender(
        objRefToString(widget.ref),
    );

    const handlePushData = useCallback(
        (data: IPushData): void => {
            if (onAvailableDrillTargetsReceived && data?.availableDrillTargets) {
                onAvailableDrillTargetsReceived(data.availableDrillTargets);
            }
        },
        [onAvailableDrillTargetsReceived],
    );

    const handleLoadingChanged = useCallback<OnLoadingChanged>(({ isLoading }) => {
        if (isLoading) {
            onRequestAsyncRender();
        } else {
            onResolveAsyncRender();
        }
        setIsVisualizationLoading(isLoading);
    }, []);

    const handleError = useCallback<OnError>(
        (error) => {
            setVisualizationError(error);
            onError?.(error);
        },
        [onError],
    );

    const insightWithAddedFilters = insightSetFilters(insight, filtersForInsight as IFilter[]); // TODO how to type this better?

    const insightWithAddedWidgetProperties = useResolveDashboardInsightProperties({
        insight: insightWithAddedFilters ?? insight,
        widget,
    });

    const { drillableItems: drillableItemsToUse, handleDrill } = useDashboardInsightDrills({
        insight: insightWithAddedWidgetProperties,
        widget,
        disableWidgetImplicitDrills,
        drillableItems,
        drillTargets,
        onDrill,
    });

    const chartConfig = useMemo(
        () => ({
            mapboxToken,
            separators,
            forceDisableDrillOnAxes: !drillableItems, // to keep in line with KD, enable axes drilling only if using explicit drills
            isExportMode: isExport,
        }),
        [separators, mapboxToken, drillableItems, isExport],
    );

    const insightPositionStyle: CSSProperties = useMemo(() => {
        return {
            width: "100%",
            height: "100%",
            position:
                // Headline violates the layout contract.
                // It should fit parent height and adapt to it as other visualizations.
                // Now, it works differently for the Headline - parent container adapts to Headline size.
                insight && insightVisualizationUrl(insight).includes("headline") ? "relative" : "absolute",
        };
    }, [insight]);

    const error = filtersError ?? visualizationError;

    return (
        <div style={insightStyle}>
            <div style={insightPositionStyle}>
                <IntlWrapper locale={locale}>
                    {(filtersStatus === "running" || isVisualizationLoading) && <LoadingComponent />}
                    {error && (
                        <InsightError
                            error={error}
                            ErrorComponent={ErrorComponent}
                            clientHeight={settings?.enableKDWidgetCustomHeight ? clientHeight : undefined}
                            height={null} // make sure the error is aligned to the top (this is the behavior in gdc-dashboards)
                        />
                    )}
                    {filtersStatus === "success" && (
                        <InsightRenderer
                            insight={insightWithAddedWidgetProperties}
                            backend={effectiveBackend}
                            workspace={effectiveWorkspace}
                            drillableItems={drillableItemsToUse}
                            onDrill={handleDrill}
                            config={chartConfig}
                            onLoadingChanged={handleLoadingChanged}
                            locale={locale}
                            settings={settings as IUserWorkspaceSettings}
                            colorPalette={colorPalette}
                            onError={handleError}
                            pushData={handlePushData}
                            ErrorComponent={ErrorComponent}
                            LoadingComponent={LoadingComponent}
                        />
                    )}
                </IntlWrapper>
            </div>
        </div>
    );
};
