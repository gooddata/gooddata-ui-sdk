// (C) 2019-2023 GoodData Corporation
import React, { useCallback, useMemo, useRef, useState } from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import {
    IInsight,
    idRef,
    insightTitle,
    insightVisualizationUrl,
    ObjRef,
    areObjRefsEqual,
    insightRef,
} from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    withContexts,
    LoadingComponent as DefaultLoading,
    ErrorComponent as DefaultError,
    IntlWrapper,
    OnLoadingChanged,
    OnError,
    useCancelablePromise,
    convertError,
    resolveLocale,
} from "@gooddata/sdk-ui";
import { withMapboxToken } from "@gooddata/sdk-ui-geo";

import InsightTitle from "./InsightTitle.js";
import { InsightRenderer } from "./InsightRenderer.js";
import { InsightError } from "./InsightError.js";
import {
    colorPaletteDataLoaderFactory,
    insightDataLoaderFactory,
    userWorkspaceSettingsDataLoaderFactory,
} from "../dataLoaders/index.js";
import { IInsightViewProps } from "../internal/index.js";

interface IInsightViewCoreState {
    isVisualizationLoading: boolean;
    visualizationError: GoodDataSdkError | undefined;
}

const InsightViewCore: React.FC<IInsightViewProps & WrappedComponentProps> = (props) => {
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
    const lastReportedRef = useRef<ObjRef | undefined>();

    const {
        error: insightError,
        result: insightResult,
        status: insightStatus,
    } = useCancelablePromise(
        {
            promise: async () => {
                const ref = typeof insight === "string" ? idRef(insight, "insight") : insight;

                const insightData = await insightDataLoaderFactory
                    .forWorkspace(workspace)
                    .getInsight(backend, ref);

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
        },
        [insight, backend, workspace, executeByReference, filters, onInsightLoaded],
    );

    const {
        error: colorPaletteError,
        result: colorPaletteResult,
        status: colorPaletteStatus,
    } = useCancelablePromise(
        {
            promise: () => {
                return colorPaletteDataLoaderFactory.forWorkspace(workspace).getColorPalette(backend);
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
                    .forWorkspace(workspace)
                    .getUserWorkspaceSettings(backend);
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

        return backend.withTelemetry("InsightView", telemetryProps);
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
        workspaceSettingsStatus === "pending";

    const resolveInsightTitle = (insight: IInsight | undefined): string | undefined => {
        switch (typeof showTitle) {
            case "string":
                return showTitle;
            case "boolean":
                return !isDataLoading && showTitle && insight ? insightTitle(insight) : undefined;
            case "function":
                return !isDataLoading && insight && showTitle(insight);
            default:
                return undefined;
        }
    };
    const resolvedTitle = resolveInsightTitle(insightResult);

    const isLoadingShown = isDataLoading || state.isVisualizationLoading;
    const error = state.visualizationError || insightError || colorPaletteError || workspaceSettingsError;

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
                <InsightRenderer
                    insight={insightResult}
                    workspace={workspace}
                    backend={backendWithTelemetry}
                    colorPalette={colorPalette ?? colorPaletteResult}
                    config={config}
                    execConfig={execConfig}
                    drillableItems={drillableItems}
                    executeByReference={executeByReference}
                    filters={filters}
                    locale={locale || resolveLocale(workspaceSettingsResult?.locale)}
                    settings={workspaceSettingsResult}
                    ErrorComponent={ErrorComponent}
                    LoadingComponent={LoadingComponent}
                    onDrill={onDrill}
                    onError={handleError}
                    onExportReady={onExportReady}
                    onLoadingChanged={handleLoadingChanged}
                    pushData={pushData}
                />
            </div>
        </div>
    );
};

export const IntlInsightView = withMapboxToken(withContexts(injectIntl(InsightViewCore)));

/**
 * Renders insight which was previously created and saved in the Analytical Designer.
 *
 * @public
 */
export class InsightView extends React.Component<IInsightViewProps> {
    public render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <IntlInsightView {...this.props} />
            </IntlWrapper>
        );
    }
}
