// (C) 2019-2026 GoodData Corporation

import { useCallback, useMemo, useRef, useState } from "react";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    type ObjRef,
    areObjRefsEqual,
    idRef,
    insightRef,
    insightTitle,
    insightVisualizationUrl,
    isIdentifierRef,
    isUriRef,
} from "@gooddata/sdk-model";
import {
    ErrorComponent as DefaultError,
    LoadingComponent as DefaultLoading,
    type GoodDataSdkError,
    IntlWrapper,
    type OnError,
    type OnLoadingChanged,
    convertError,
    resolveLocale,
    useBackendWithCorrelation,
    useCancelablePromise,
    withContexts,
} from "@gooddata/sdk-ui";
import { withMapboxToken } from "@gooddata/sdk-ui-geo";
import { withAgGridToken } from "@gooddata/sdk-ui-pivot/next";

import { InsightError } from "./InsightError.js";
import { InsightRenderer } from "./InsightRenderer.js";
import { InsightTitle } from "./InsightTitle.js";
import {
    colorPaletteDataLoaderFactory,
    insightDataLoaderFactory,
    userWorkspaceSettingsDataLoaderFactory,
    workspacePermissionsDataLoaderFactory,
} from "../dataLoaders/index.js";
import { type IInsightViewProps } from "../internal/index.js";

interface IInsightViewCoreState {
    isVisualizationLoading: boolean;
    visualizationError: GoodDataSdkError | undefined;
}

/**
 * @internal
 */
export function mergeInsightConfigWithSettings(
    config: IInsightViewProps["config"],
    settings?: IUserWorkspaceSettings,
) {
    return {
        ...config,
        mapboxToken: config?.mapboxToken ?? settings?.["mapboxToken"],
        agGridToken: config?.agGridToken ?? settings?.["agGridToken"],
        maxZoomLevel: config?.maxZoomLevel ?? settings?.["maxZoomLevel"],
    };
}

export const IntlInsightView = withAgGridToken(
    withMapboxToken(
        withContexts(function InsightViewCore(props: IInsightViewProps) {
            const {
                insight,
                backend,
                workspace,
                filters,
                executeByReference,
                showTitle,
                colorPalette,
                config,
                execConfig,
                locale,
                drillableItems,

                onDrill,
                onLoadingChanged,
                onExportReady,
                onError,
                onDataView,
                onInsightLoaded,
                pushData,

                ErrorComponent = DefaultError,
                LoadingComponent = DefaultLoading,
                TitleComponent = InsightTitle,
            } = props;

            const [state, setState] = useState<IInsightViewCoreState>({
                isVisualizationLoading: false,
                visualizationError: undefined,
            });

            // ref of the insight last reported by the onInsightLoaded
            const lastReportedRef = useRef<ObjRef | undefined>(undefined);

            const {
                error: insightError,
                result: insightResult,
                status: insightStatus,
            } = useCancelablePromise(
                {
                    promise: async () => {
                        const ref = typeof insight === "string" ? idRef(insight, "insight") : insight;

                        const insightData = await insightDataLoaderFactory
                            .forWorkspace(workspace!)
                            .getInsight(backend!, ref);

                        if (
                            !lastReportedRef.current ||
                            !areObjRefsEqual(lastReportedRef.current, insightRef(insightData))
                        ) {
                            onInsightLoaded?.(insightData);
                            lastReportedRef.current = insightRef(insightData);
                        }

                        if (executeByReference) {
                            /*
                             * In execute-by-reference, filter merging happens on the server
                             */
                            return insightData;
                        }

                        /*
                         * In freeform execution, frontend is responsible for filter merging. Code defers the merging to the
                         * implementation of analytical backend because the merging may first need to unify how the different
                         * filter entities are referenced (id vs uri).
                         */
                        return backend!
                            .workspace(workspace!)
                            .insights()
                            .getInsightWithAddedFilters(insightData, filters ?? []);
                    },
                    onError: (err) => {
                        const sdkError = convertError(err);
                        onError?.(sdkError);
                    },
                },
                [insight, backend, workspace, executeByReference, filters, onInsightLoaded],
            );

            const {
                error: permissionsError,
                result: permissionsResult,
                status: permissionsStatus,
            } = useCancelablePromise(
                {
                    promise: async () => {
                        return await workspacePermissionsDataLoaderFactory
                            .forWorkspace(workspace!)
                            .getWorkspacePermissions(backend!);
                    },
                    onError: (err) => {
                        const sdkError = convertError(err);
                        onError?.(sdkError);
                    },
                },
                [backend, workspace, executeByReference],
            );

            const {
                error: colorPaletteError,
                result: colorPaletteResult,
                status: colorPaletteStatus,
            } = useCancelablePromise(
                {
                    promise: () => {
                        return colorPaletteDataLoaderFactory
                            .forWorkspace(workspace!)
                            .getColorPalette(backend!);
                    },
                },
                [backend, workspace],
            );

            const {
                error: workspaceSettingsError,
                result: workspaceSettingsResult,
                status: workspaceSettingsStatus,
            } = useCancelablePromise(
                {
                    promise: () => {
                        return userWorkspaceSettingsDataLoaderFactory
                            .forWorkspace(workspace!)
                            .getUserWorkspaceSettings(backend!);
                    },
                },
                [backend, workspace],
            );

            // extract the url outside backendWithTelemetry and use it as a dependency instead of the whole insight
            // this reduces the amount of re-renders in case just filters change for example
            const currentInsightVisualizationUrl = insightResult && insightVisualizationUrl(insightResult);
            const backendWithTelemetry = useMemo(() => {
                const telemetryProps: Record<string, unknown> = { ...props };

                // add a fake prop so that the type of the visualization rendered is present in the telemetry
                if (currentInsightVisualizationUrl) {
                    const key = `visualizationUrl_${currentInsightVisualizationUrl}`;
                    telemetryProps[key] = true;
                }

                return backend!.withTelemetry("InsightView", telemetryProps);
                // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [currentInsightVisualizationUrl, backend]);

            const handleLoadingChanged = useCallback<OnLoadingChanged>(
                ({ isLoading }): void => {
                    setState((oldState) => {
                        return {
                            isVisualizationLoading: isLoading,
                            // if we started loading, any previous vis error is obsolete at this point, get rid of it
                            visualizationError: isLoading ? undefined : oldState.visualizationError,
                        };
                    });
                    onLoadingChanged?.({ isLoading });
                },
                [onLoadingChanged],
            );

            const handleError = useCallback<OnError>(
                (visualizationError): void => {
                    setState((oldState) => {
                        return {
                            ...oldState,
                            visualizationError,
                        };
                    });
                    onError?.(visualizationError);
                },
                [onError],
            );

            const isDataLoading =
                insightStatus === "loading" ||
                insightStatus === "pending" ||
                colorPaletteStatus === "loading" ||
                colorPaletteStatus === "pending" ||
                workspaceSettingsStatus === "loading" ||
                workspaceSettingsStatus === "pending" ||
                permissionsStatus === "loading" ||
                permissionsStatus === "pending";
            const settingsResolved = workspaceSettingsStatus === "success";

            const resolveInsightTitle = (insight: IInsight | undefined): string | undefined => {
                switch (typeof showTitle) {
                    case "string":
                        return showTitle;
                    case "boolean":
                        return !isDataLoading && showTitle && insight ? insightTitle(insight) : undefined;
                    case "function":
                        return !isDataLoading && insight ? showTitle(insight) : undefined;
                    default:
                        return undefined;
                }
            };
            const resolvedTitle = resolveInsightTitle(insightResult);

            const isLoadingShown = isDataLoading || state.isVisualizationLoading;
            const error =
                state.visualizationError ||
                insightError ||
                colorPaletteError ||
                workspaceSettingsError ||
                permissionsError;

            const resolvedConfig = useMemo(
                () => mergeInsightConfigWithSettings(config, workspaceSettingsResult),
                [config, workspaceSettingsResult],
            );

            return (
                <div className="insight-view-container">
                    {resolvedTitle ? <TitleComponent title={resolvedTitle} /> : null}
                    {isLoadingShown ? <LoadingComponent className="insight-view-loader" /> : null}
                    {error && !isDataLoading ? (
                        <InsightError error={convertError(error)} ErrorComponent={ErrorComponent} />
                    ) : null}
                    <div
                        className="insight-view-visualization"
                        // make the visualization div 0 height so that the loading component can take up the whole area
                        style={isLoadingShown ? { height: 0 } : undefined}
                    >
                        {settingsResolved ? (
                            <InsightRenderer
                                insight={insightResult}
                                workspace={workspace}
                                backend={backendWithTelemetry}
                                colorPalette={colorPalette ?? colorPaletteResult}
                                config={resolvedConfig}
                                execConfig={execConfig}
                                drillableItems={drillableItems}
                                executeByReference={executeByReference}
                                filters={filters}
                                locale={locale || resolveLocale(workspaceSettingsResult?.locale)}
                                settings={workspaceSettingsResult}
                                permissions={permissionsResult}
                                ErrorComponent={ErrorComponent}
                                LoadingComponent={LoadingComponent}
                                onDrill={onDrill}
                                onError={handleError}
                                onExportReady={onExportReady}
                                onLoadingChanged={handleLoadingChanged}
                                onDataView={onDataView}
                                pushData={pushData}
                            />
                        ) : null}
                    </div>
                </div>
            );
        }),
    ),
);

/**
 * Renders insight which was previously created and saved in the Analytical Designer.
 *
 * @public
 */
export function InsightView(props: IInsightViewProps) {
    const backend = useBackendWithVisualizationCorrelation(props);

    return (
        <IntlWrapper locale={props.locale}>
            <IntlInsightView {...props} backend={backend} />
        </IntlWrapper>
    );
}

function useBackendWithVisualizationCorrelation({ backend, insight }: IInsightViewProps) {
    let visualizationId;
    if (typeof insight === "string") {
        visualizationId = insight;
    } else if (isIdentifierRef(insight)) {
        visualizationId = insight.identifier;
    } else if (isUriRef(insight)) {
        visualizationId = insight.uri;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return useBackendWithCorrelation(backend, { visualizationId: visualizationId! });
}
