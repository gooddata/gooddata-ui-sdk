// (C) 2020-2026 GoodData Corporation

import { type CSSProperties, memo, useCallback, useEffect, useRef, useState } from "react";

import { isEqual } from "lodash-es";
import { type Root, createRoot } from "react-dom/client";
import { type WrappedComponentProps, injectIntl } from "react-intl";
import { v4 as uuidv4 } from "uuid";

import {
    ExecutionFactoryUpgradingToExecByReference,
    ExecutionFactoryWithFixedFilters,
} from "@gooddata/sdk-backend-base";
import {
    type IExecutionFactory,
    type IExportResult,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import {
    type IColorPalette,
    type IInsightDefinition,
    type IInsightWidget,
    type ITheme,
    type IWorkspacePermissions,
    insightProperties,
    insightSetProperties,
    insightTitle,
    insightVisualizationType,
    insightVisualizationUrl,
} from "@gooddata/sdk-model";
import {
    DefaultLocale,
    ErrorComponent,
    type IExportFunction,
    type IExtendedExportConfig,
    type ILocale,
    type ITranslations,
    IntlWrapper,
    LoadingComponent,
    type OnError,
    fillMissingFormats,
    fillMissingTitlesWithMessages,
    ignoreTitlesForSimpleMeasures,
    useResolveMessages,
    withContexts,
} from "@gooddata/sdk-ui";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import {
    DEFAULT_MESSAGES,
    FullVisualizationCatalog,
    type IInsightViewProps,
    type IVisConstruct,
    type IVisProps,
    type IVisualization,
    resolveMessages,
} from "../internal/index.js";

/**
 * @internal
 */
export interface IInsightRendererProps extends Omit<
    IInsightViewProps,
    "insight" | "TitleComponent" | "onInsightLoaded" | "showTitle"
> {
    insight: IInsightDefinition | undefined;
    locale: ILocale;
    settings: IUserWorkspaceSettings | undefined;
    permissions?: IWorkspacePermissions;
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

type InsightRendererCoreProps = IInsightRendererProps & WrappedComponentProps & { messages: ITranslations };

/**
 * Props of the core renderer with all the defaults applied.
 */
type ResolvedInsightRendererCoreProps = InsightRendererCoreProps &
    Required<
        Pick<
            InsightRendererCoreProps,
            | "ErrorComponent"
            | "filters"
            | "drillableItems"
            | "LoadingComponent"
            | "pushData"
            | "locale"
            | "afterRender"
        >
    >;

const getElementId = () => `gd-vis-${uuidv4()}`;

const visualizationUriRootStyle: CSSProperties = {
    height: "100%",
    display: "flex",
    flex: "1 1 auto",
    flexDirection: "column",
};

const noop = () => {};
const defaultFilters: NonNullable<IInsightRendererProps["filters"]> = [];
const defaultDrillableItems: NonNullable<IInsightRendererProps["drillableItems"]> = [];

/**
 * Applies the defaults on the props. The values used as defaults are referentially stable so that they do not
 * trigger any unnecessary work down the line.
 */
const resolveProps = (props: InsightRendererCoreProps): ResolvedInsightRendererCoreProps => ({
    ...props,
    ErrorComponent: props.ErrorComponent ?? ErrorComponent,
    filters: props.filters ?? defaultFilters,
    drillableItems: props.drillableItems ?? defaultDrillableItems,
    LoadingComponent: props.LoadingComponent ?? LoadingComponent,
    pushData: props.pushData ?? noop,
    locale: props.locale ?? DefaultLocale,
    afterRender: props.afterRender ?? noop,
});

// this needs to be a memoized component as it can happen that this might be rendered multiple times
// with the same props (referentially) - this might make the rendered visualization behave unpredictably
// and is bad for performance so we need to make sure the re-renders are performed only if necessary
const InsightRendererCore = memo(function InsightRendererCore(props: InsightRendererCoreProps) {
    const currentProps = resolveProps(props);

    const [elementId] = useState(getElementId);
    const visualizationRef = useRef<IVisualization | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);

    /**
     * The component may render both visualization and config panel. In React18 we therefore need two
     * roots with their respective render methods. This Map holds the roots for both and provides
     * render and unmount methods whenever needed.
     */
    const reactRootsMapRef = useRef<Map<HTMLElement, Root>>(new Map());

    /**
     * The callbacks and element getters below outlive the render they were created in (the visualization
     * instance only ever gets the ones from the render it was set up in). They therefore read the props from
     * this ref to always see the current values - the very same way `this.props` did before.
     *
     * This effect must stay first so that the ref is up to date before any other effect runs.
     */
    const propsRef = useRef(currentProps);
    useEffect(() => {
        propsRef.current = currentProps;
    });

    const unmountVisualization = useCallback(() => {
        if (visualizationRef.current) {
            visualizationRef.current.unmount();
        }
        visualizationRef.current = undefined;
    }, []);

    const getExecutionFactory = useCallback((): IExecutionFactory => {
        const { backend, workspace, executeByReference, filters } = propsRef.current;
        const factory = backend!.workspace(workspace!).execution();

        if (executeByReference) {
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
                new ExecutionFactoryWithFixedFilters(factory, filters),
            );
        }

        return factory;
    }, []);

    const updateVisualization = useCallback(() => {
        // if the container no longer exists, update was called after unmount -> do nothing
        if (!visualizationRef.current || !containerRef.current) {
            return;
        }

        const {
            insight: insightProp,
            config = {},
            settings,
            locale,
            messages,
            widget,
            drillableItems,
            colorPalette,
            execConfig,
            theme,
        } = propsRef.current;

        // if there is no insight, bail early
        if (!insightProp) {
            return;
        }

        const { responsiveUiDateFormat } = settings ?? {};

        const visProps: IVisProps = {
            locale,
            messages,
            dateFormat: responsiveUiDateFormat,
            a11yTitle: widget?.title,
            a11yDescription: widget?.description,
            custom: {
                drillableItems,
                lastSavedVisClassUrl: insightVisualizationUrl(insightProp),
            },
            config: {
                separators: config.separators,
                colorPalette,
                mapboxToken: config.mapboxToken,
                agGridToken: config.agGridToken,
                forceDisableDrillOnAxes: config.forceDisableDrillOnAxes,
                isInEditMode: config.isInEditMode,
                isExportMode: config.isExportMode,
                enableExecutionCancelling: config.enableExecutionCancelling,
            },
            executionConfig: execConfig,
            customVisualizationConfig: config,
            theme,
            supportsChartFill: config.supportsChartFill,
        };

        const visClass = insightVisualizationType(insightProp);
        const filled = fillMissingTitlesWithMessages(insightProp, locale, messages, undefined);
        let insight = fillMissingFormats(filled);

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
        visualizationRef.current?.update(visProps, insight, {}, getExecutionFactory());
    }, [getExecutionFactory]);

    const reactRenderFunction = useCallback<IVisConstruct["renderFun"]>((children, element) => {
        if (!element) {
            return;
        }
        const htmlElement = element as HTMLElement;
        if (!reactRootsMapRef.current.get(htmlElement)) {
            reactRootsMapRef.current.set(htmlElement, createRoot(htmlElement));
        }
        reactRootsMapRef.current.get(htmlElement)!.render(children);
    }, []);

    const reactUnmountFunction = useCallback<IVisConstruct["unmountFun"]>(() => {
        reactRootsMapRef.current.forEach((root) => root.render(null));
    }, []);

    const onExportReadyDecorator = useCallback((exportFunction: IExportFunction): void => {
        const { onExportReady } = propsRef.current;

        if (!onExportReady) {
            return;
        }

        const decorator = (exportConfig: IExtendedExportConfig): Promise<IExportResult> => {
            const { insight } = propsRef.current;

            if (exportConfig.title || !insight) {
                return exportFunction(exportConfig);
            }

            return exportFunction({
                ...exportConfig,
                title: insightTitle(insight),
            });
        };

        onExportReady(decorator);
    }, []);

    const setupVisualization = useCallback(() => {
        const {
            insight,
            settings,
            backend,
            workspace,
            permissions,
            locale,
            messages,
            pushData,
            onDrill,
            onDataView,
            onLoadingChanged,
            afterRender,
        } = propsRef.current;

        // if there is no insight, bail early
        if (!insight) {
            return;
        }

        // the visualization we may have from earlier is no longer valid -> get rid of it
        unmountVisualization();

        const visualizationFactory = FullVisualizationCatalog.forInsight(
            insight,
            settings?.enableNewPivotTable ?? true,
            settings?.enableNewGeoPushpin ?? false,
        ).getFactory();

        visualizationRef.current = visualizationFactory({
            backend: backend!,
            callbacks: {
                onError: (error) => {
                    propsRef.current.onError?.(error);
                    propsRef.current.onLoadingChanged?.({ isLoading: false });
                },
                onLoadingChanged,
                pushData,
                onDrill,
                onDataView,
                onExportReady: onExportReadyDecorator,
                afterRender,
            },
            // This renderer has no configuration panel of its own — it renders read-only insights.
            // It used to resolve the panel with a document-wide lookup of the well-known
            // `.gd-configuration-panel-content` class (see BaseVisualization), which only ever
            // matched nothing in a plain dashboard. Once AD runs in-process on the same page (the
            // insight-edit overlay opened from Dashboards), that lookup started matching AD's
            // configuration panel: every re-render of a dashboard widget then created a second
            // React root on AD's panel node and replaced its content with a dashboards-environment
            // panel, losing the drill-down hierarchies and detaching the panel from AD's store.
            // fix STL-3184
            configPanelElement: () => null,
            element: () => {
                const rootNode = (containerRef.current?.getRootNode() as Document | ShadowRoot) ?? document;

                return rootNode.querySelector(`#${elementId}`);
            },
            environment: "dashboards", // TODO get rid of this
            locale,
            messages,
            projectId: workspace!,
            visualizationProperties: insightProperties(insight),
            featureFlags: settings,
            permissions,
            renderFun: reactRenderFunction,
            unmountFun: reactUnmountFunction,
        });
    }, [elementId, onExportReadyDecorator, reactRenderFunction, reactUnmountFunction, unmountVisualization]);

    const prevPropsRef = useRef<ResolvedInsightRendererCoreProps | undefined>(undefined);

    // componentDidMount & componentDidUpdate: intentionally without dependencies so that it runs after
    // every render of this (memoized) component
    useEffect(() => {
        const prevProps = prevPropsRef.current;
        prevPropsRef.current = currentProps;

        if (!prevProps) {
            setupVisualization();
            updateVisualization();
            return;
        }

        /**
         * Ignore properties when comparing insights to determine if a new setup is needed: changes to properties
         * only will be handled using the updateVisualization without unnecessary new setup just fine.
         */
        const prevInsightForCompare = prevProps.insight && insightSetProperties(prevProps.insight, {});
        const newInsightForCompare = currentProps.insight && insightSetProperties(currentProps.insight, {});

        const needsNewSetup =
            !isEqual(newInsightForCompare, prevInsightForCompare) ||
            !isEqual(currentProps.filters, prevProps.filters) ||
            !isEqual(currentProps.settings, prevProps.settings) ||
            currentProps.workspace !== prevProps.workspace;

        if (needsNewSetup) {
            setupVisualization();
        }

        updateVisualization();
    });

    // componentWillUnmount
    useEffect(() => {
        const reactRootsMap = reactRootsMapRef.current;

        return () => {
            unmountVisualization();
            // In order to avoid race conditions when mounting and unmounting synchronously,
            // we use timeout for React18.
            // https://github.com/facebook/react/issues/25675
            reactRootsMap.forEach((root) => setTimeout(() => root.unmount(), 0));
        };
    }, [unmountVisualization]);

    return (
        // never ever dynamically change the props of this div, otherwise bad things will happen
        // e.g. visualization being rendered multiple times, etc.
        <div
            className="visualization-uri-root"
            id={elementId}
            ref={containerRef}
            style={visualizationUriRootStyle}
        />
    );
});

export const IntlInsightRenderer = injectIntl(withTheme(withContexts(InsightRendererCore)));

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
        locale,
        ...resProps
    } = props;

    const onPushData = useUpdatableCallback(pushData!);
    const onDrill = useUpdatableCallback(onDrillCallBack!);
    const onError = useUpdatableCallback(onErrorCallBack!);
    const onExportReady = useUpdatableCallback(onExportReadyCallback!);
    const onLoadingChanged = useUpdatableCallback(onLoadingChangedCallback!);
    const onDataView = useUpdatableCallback(onDataViewCallback!);

    const messages = useResolveMessages(locale, resolveMessages, DEFAULT_MESSAGES);
    if (!messages[locale]) {
        return null;
    }

    return (
        <IntlWrapper locale={locale}>
            <IntlInsightRenderer
                pushData={onPushData}
                onDrill={onDrill}
                onError={onError}
                onExportReady={onExportReady}
                messages={messages[locale]}
                onLoadingChanged={onLoadingChanged}
                onDataView={onDataView}
                locale={locale}
                {...resProps}
            />
        </IntlWrapper>
    );
}
