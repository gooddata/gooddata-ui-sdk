// (C) 2020-2025 GoodData Corporation

import React, { useCallback, useEffect, useRef } from "react";

import compose from "lodash/flowRight.js";
import isEqual from "lodash/isEqual.js";
import noop from "lodash/noop.js";
// eslint-disable-next-line react/no-deprecated
import { render } from "react-dom";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { v4 as uuidv4 } from "uuid";

import {
    ExecutionFactoryUpgradingToExecByReference,
    ExecutionFactoryWithFixedFilters,
} from "@gooddata/sdk-backend-base";
import { IExecutionFactory, IExportResult, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    IColorPalette,
    IInsightDefinition,
    IInsightWidget,
    ITheme,
    insightProperties,
    insightSetProperties,
    insightTitle,
    insightVisualizationType,
    insightVisualizationUrl,
} from "@gooddata/sdk-model";
import {
    DefaultLocale,
    ErrorComponent,
    IExportFunction,
    IExtendedExportConfig,
    ILocale,
    IntlWrapper,
    LoadingComponent,
    OnError,
    fillMissingFormats,
    fillMissingTitles,
    ignoreTitlesForSimpleMeasures,
    withContexts,
} from "@gooddata/sdk-ui";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { Root, _createRoot } from "../internal/createRootProvider.js";
import {
    FullVisualizationCatalog,
    IInsightViewProps,
    IVisProps,
    IVisualization,
    unmountComponentsAtNodes,
} from "../internal/index.js";

/**
 * @internal
 */
export interface IInsightRendererProps
    extends Omit<IInsightViewProps, "insight" | "TitleComponent" | "onInsightLoaded" | "showTitle"> {
    insight: IInsightDefinition | undefined;
    locale: ILocale;
    settings: IUserWorkspaceSettings | undefined;
    colorPalette: IColorPalette | undefined;
    onError?: OnError;
    theme?: ITheme;
    afterRender?: () => void;
    /**
     * Widget data containing title and other metadata.
     * When provided, the widget title and description will be passed through to the chart configuration.
     */
    widget?: IInsightWidget;
}

const getElementId = () => `gd-vis-${uuidv4()}`;

const visualizationUriRootStyle: React.CSSProperties = {
    height: "100%",
    display: "flex",
    flex: "1 1 auto",
    flexDirection: "column",
};

// this needs to be a pure component as it can happen that this might be rendered multiple times
// with the same props (referentially) - this might make the rendered visualization behave unpredictably
// and is bad for performance so we need to make sure the re-renders are performed only if necessary
class InsightRendererCore extends React.PureComponent<IInsightRendererProps & WrappedComponentProps> {
    private elementId = getElementId();
    private visualization: IVisualization | undefined;
    private containerRef = React.createRef<HTMLDivElement>();

    /**
     * The component may render both visualization and config panel. In React18 we therefore need two
     * roots with their respective render methods. This Map holds the roots for both and provides
     * render and unmount methods whenever needed.
     */
    private reactRootsMap: Map<HTMLElement, Root> = new Map();

    public static defaultProps: Pick<
        IInsightRendererProps,
        | "ErrorComponent"
        | "filters"
        | "drillableItems"
        | "LoadingComponent"
        | "pushData"
        | "locale"
        | "afterRender"
    > = {
        ErrorComponent,
        filters: [],
        drillableItems: [],
        LoadingComponent,
        pushData: noop,
        locale: DefaultLocale,
        afterRender: () => {},
    };

    private unmountVisualization = () => {
        if (this.visualization) {
            this.visualization.unmount();
        }
        this.visualization = undefined;
    };

    private updateVisualization = () => {
        // if the container no longer exists, update was called after unmount -> do nothing
        if (!this.visualization || !this.containerRef.current) {
            return;
        }

        // if there is no insight, bail early
        if (!this.props.insight) {
            return;
        }

        const { config = {} } = this.props;
        const { responsiveUiDateFormat } = this.props.settings ?? {};

        const visProps: IVisProps = {
            locale: this.props.locale,
            dateFormat: responsiveUiDateFormat,
            a11yTitle: this.props.widget?.title,
            a11yDescription: this.props.widget?.description,
            custom: {
                drillableItems: this.props.drillableItems,
                lastSavedVisClassUrl: insightVisualizationUrl(this.props.insight),
            },
            config: {
                separators: config.separators,
                colorPalette: this.props.colorPalette,
                mapboxToken: config.mapboxToken,
                agGridToken: config.agGridToken,
                forceDisableDrillOnAxes: config.forceDisableDrillOnAxes,
                isInEditMode: config.isInEditMode,
                isExportMode: config.isExportMode,
                enableExecutionCancelling: config.enableExecutionCancelling,
            },
            executionConfig: this.props.execConfig,
            customVisualizationConfig: config,
            theme: this.props.theme,
            supportsChartFill: config.supportsChartFill,
        };

        const visClass = insightVisualizationType(this.props.insight);
        let insight = fillMissingFormats(fillMissingTitles(this.props.insight, this.props.locale));

        /**
         * Ignore titles for simple measures in all visualizations except for repeater.
         * This is not nice, and InsightRenderer should not be aware of the visualization types.
         * However, repeater is transforming simple measures to inline ones, so we need to keep the titles for them.
         * We can remove this once we have a better solution on execution level,
         * or all the visualizations start to use actual measure titles specified in AD, and not measure metadata titles.
         * See also https://gooddata.atlassian.net/browse/SD-1012
         */
        if (visClass !== "repeater") {
            insight = ignoreTitlesForSimpleMeasures(insight);
        }
        this.visualization.update(visProps, insight, {}, this.getExecutionFactory());
    };

    private setupVisualization = async () => {
        // if there is no insight, bail early
        if (!this.props.insight) {
            return;
        }

        // the visualization we may have from earlier is no longer valid -> get rid of it
        this.unmountVisualization();

        const visualizationFactory = FullVisualizationCatalog.forInsight(
            this.props.insight,
            this.props.settings?.enableNewPivotTable ?? false,
        ).getFactory();

        this.visualization = visualizationFactory({
            backend: this.props.backend,
            callbacks: {
                onError: (error) => {
                    this.props.onError?.(error);
                    this.props.onLoadingChanged?.({ isLoading: false });
                },
                onLoadingChanged: this.props.onLoadingChanged,
                pushData: this.props.pushData,
                onDrill: this.props.onDrill,
                onDataView: this.props.onDataView,
                onExportReady: this.onExportReadyDecorator,
                afterRender: this.props.afterRender,
            },
            configPanelElement: () => {
                const rootNode =
                    (this.containerRef.current?.getRootNode() as Document | ShadowRoot) ?? document;

                // this is apparently a well-know constant (see BaseVisualization)
                return rootNode.querySelector(".gd-configuration-panel-content");
            },
            element: () => {
                const rootNode =
                    (this.containerRef.current?.getRootNode() as Document | ShadowRoot) ?? document;

                return rootNode.querySelector(`#${this.elementId}`);
            },
            environment: "dashboards", // TODO get rid of this
            locale: this.props.locale,
            projectId: this.props.workspace,
            visualizationProperties: insightProperties(this.props.insight),
            featureFlags: this.props.settings,
            renderFun: this.getReactRenderFunction(),
            unmountFun: this.getReactUnmountFunction(),
        });
    };

    private getReactRenderFunction = () => {
        if (_createRoot) {
            return (children: any, element: Element) => {
                const htmlElement = element as HTMLElement;
                if (!this.reactRootsMap.get(htmlElement)) {
                    this.reactRootsMap.set(htmlElement, _createRoot(htmlElement));
                }
                this.reactRootsMap.get(htmlElement).render(children);
            };
        } else {
            return render;
        }
    };

    private getReactUnmountFunction = () => {
        if (_createRoot) {
            return () => this.reactRootsMap.forEach((root) => root.render(null));
        } else {
            return (elementsOrSelectors: (string | HTMLElement)[]) =>
                unmountComponentsAtNodes(elementsOrSelectors);
        }
    };

    private onExportReadyDecorator = (exportFunction: IExportFunction): void => {
        if (!this.props.onExportReady) {
            return;
        }

        const decorator = (exportConfig: IExtendedExportConfig): Promise<IExportResult> => {
            if (exportConfig.title || !this.props.insight) {
                return exportFunction(exportConfig);
            }

            return exportFunction({
                ...exportConfig,
                title: insightTitle(this.props.insight),
            });
        };

        this.props.onExportReady(decorator);
    };

    private getExecutionFactory = (): IExecutionFactory => {
        const factory = this.props.backend.workspace(this.props.workspace).execution();

        if (this.props.executeByReference) {
            /*
             * When executing by reference, decorate the original execution factory so that it
             * transparently routes `forInsight` to `forInsightByRef` AND adds the filters
             * from InsightView props.
             *
             * Code will pass this factory over to the pluggable visualizations - they will do execution
             * `forInsight` and under the covers things will be routed and done differently without the
             * plug viz knowing.
             */
            return new ExecutionFactoryUpgradingToExecByReference(
                new ExecutionFactoryWithFixedFilters(factory, this.props.filters),
            );
        }

        return factory;
    };

    private componentDidMountInner = async () => {
        await this.setupVisualization();
        return this.updateVisualization();
    };

    public override componentDidMount(): void {
        this.componentDidMountInner();
    }

    private componentDidUpdateInner = async (prevProps: IInsightRendererProps) => {
        /**
         * Ignore properties when comparing insights to determine if a new setup is needed: changes to properties
         * only will be handled using the updateVisualization without unnecessary new setup just fine.
         */
        const prevInsightForCompare = prevProps.insight && insightSetProperties(prevProps.insight, {});
        const newInsightForCompare = this.props.insight && insightSetProperties(this.props.insight, {});

        const needsNewSetup =
            !isEqual(newInsightForCompare, prevInsightForCompare) ||
            !isEqual(this.props.filters, prevProps.filters) ||
            !isEqual(this.props.settings, prevProps.settings) ||
            this.props.workspace !== prevProps.workspace;

        if (needsNewSetup) {
            await this.setupVisualization();
        }

        return this.updateVisualization();
    };

    public override componentDidUpdate(prevProps: IInsightRendererProps & WrappedComponentProps): void {
        this.componentDidUpdateInner(prevProps);
    }

    public override componentWillUnmount() {
        this.unmountVisualization();
        if (_createRoot) {
            // In order to avoid race conditions when mounting and unmounting synchronously,
            // we use timeout for React18.
            // https://github.com/facebook/react/issues/25675
            this.reactRootsMap.forEach((root) => setTimeout(() => root.unmount(), 0));
        }
    }

    public override render() {
        return (
            // never ever dynamically change the props of this div, otherwise bad things will happen
            // e.g. visualization being rendered multiple times, etc.
            <div
                className="visualization-uri-root"
                id={this.elementId}
                ref={this.containerRef}
                style={visualizationUriRootStyle}
            />
        );
    }
}

export const IntlInsightRenderer = compose(injectIntl, withTheme, withContexts)(InsightRendererCore);

/**
 * Updated callback (callback with a different reference) is not properly propagated to the "visualization" instance
 * (because it only takes the callbacks provided on the first render)
 * Workaround it by storing the updated callback to the ref and calling it instead.
 */
function useUpdatableCallback<T extends (...args: any[]) => any>(callback: T): T {
    const pushDataCached = useRef(callback);

    useEffect(() => {
        pushDataCached.current = callback;
    }, [callback]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback<T>(
        ((...args) => {
            if (pushDataCached.current) {
                pushDataCached.current(...args);
            }
        }) as T,
        [],
    );
}

/**
 * Renders insight passed as a parameter.
 *
 * @internal
 */
export function InsightRenderer(props: IInsightRendererProps) {
    const {
        pushData,
        onDrill: onDrillCallBack,
        onError: onErrorCallBack,
        onExportReady: onExportReadyCallback,
        onLoadingChanged: onLoadingChangedCallback,
        onDataView: onDataViewCallback,
        ...resProps
    } = props;

    const onPushData = useUpdatableCallback(pushData);
    const onDrill = useUpdatableCallback(onDrillCallBack);
    const onError = useUpdatableCallback(onErrorCallBack);
    const onExportReady = useUpdatableCallback(onExportReadyCallback);
    const onLoadingChanged = useUpdatableCallback(onLoadingChangedCallback);
    const onDataView = useUpdatableCallback(onDataViewCallback);

    return (
        <IntlWrapper locale={props.locale}>
            <IntlInsightRenderer
                pushData={onPushData}
                onDrill={onDrill}
                onError={onError}
                onExportReady={onExportReady}
                onLoadingChanged={onLoadingChanged}
                onDataView={onDataView}
                {...resProps}
            />
        </IntlWrapper>
    );
}
