// (C) 2020 GoodData Corporation
import React, { useCallback, useMemo, useState, CSSProperties } from "react";
import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { insightVisualizationUrl } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    IntlWrapper,
    OnError,
    OnLoadingChanged,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { InsightRenderer } from "@gooddata/sdk-ui-ext/esm/insightView/InsightRenderer";
import { InsightError } from "@gooddata/sdk-ui-ext/esm/insightView/InsightError";
import { useDashboardComponentsContext } from "../dashboard/DashboardComponentsContext";
import {
    useDashboardSelector,
    selectColorPalette,
    selectLocale,
    selectMapboxToken,
    selectSeparators,
    selectSettings,
} from "../model";
import { DashboardInsightProps } from "./types";
import { useResolveDashboardInsightFilters } from "./useResolveDashboardInsightFilters";
import { useResolveDashboardInsightProperties } from "./useResolveDashboardInsightProperties";
import { useDashboardInsightDrills } from "./useDashboardInsightDrills";

const insightStyle: CSSProperties = { width: "100%", height: "100%", position: "relative" };

/**
 * @internal
 */
export const DefaultDashboardInsight: React.FC<DashboardInsightProps> = (props): JSX.Element => {
    const {
        widget,
        insight,
        filters,
        drillableItems,
        onDrill,
        onError,
        backend,
        workspace,
        ErrorComponent: CustomErrorComponent,
        LoadingComponent: CustomLoadingComponent,
        clientHeight,
        disableWidgetImplicitDrills,
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

    const [isVisualizationLoading, setIsVisualizationLoading] = useState(false);
    const [visualizationError, setVisualizationError] = useState<GoodDataSdkError | undefined>();

    const handleLoadingChanged = useCallback<OnLoadingChanged>(({ isLoading }) => {
        setIsVisualizationLoading(isLoading);
    }, []);

    const handleError = useCallback<OnError>(
        (error) => {
            setVisualizationError(error);
            onError?.(error);
        },
        [onError],
    );

    const insightWithAddedFilters = useResolveDashboardInsightFilters({
        insight,
        widget,
        backend,
        filters,
        onError,
        workspace,
    });

    const insightWithAddedWidgetProperties = useResolveDashboardInsightProperties({
        insight: insightWithAddedFilters.result ?? insight,
        widget,
    });

    const {
        drillableItems: drillableItemsToUse,
        handleDrill,
        handlePushData,
    } = useDashboardInsightDrills({
        insight: insightWithAddedWidgetProperties,
        widget,
        disableWidgetImplicitDrills,
        drillableItems,
        onDrill,
    });

    const chartConfig = useMemo(
        () => ({
            mapboxToken,
            separators,
            forceDisableDrillOnAxes: !drillableItems, // to keep in line with KD, enable axes drilling only if using explicit drills
        }),
        [separators, mapboxToken, drillableItems],
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

    const error = insightWithAddedFilters.error ?? visualizationError;

    return (
        <div style={insightStyle}>
            <div style={insightPositionStyle}>
                <IntlWrapper locale={locale}>
                    {(insightWithAddedFilters.status === "loading" ||
                        insightWithAddedFilters.status === "pending" ||
                        isVisualizationLoading) && <LoadingComponent />}
                    {error && (
                        <InsightError
                            error={error}
                            ErrorComponent={ErrorComponent}
                            clientHeight={settings?.enableKDWidgetCustomHeight ? clientHeight : undefined}
                            height={null} // make sure the error is aligned to the top (this is the behavior in gdc-dashboards)
                        />
                    )}
                    {insightWithAddedFilters.status === "success" && (
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
