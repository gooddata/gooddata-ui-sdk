// (C) 2019-2026 GoodData Corporation

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";

import { isEmpty, isEqual, omit } from "lodash-es";
import { type Root, createRoot } from "react-dom/client";
import { v4 as uuidv4 } from "uuid";

import {
    type IAnalyticalBackend,
    type IExecutionFactory,
    type IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import {
    type IExecutionConfig,
    type IInsight,
    type IInsightDefinition,
    type ISettings,
    type ITheme,
    type IVisualizationClass,
    type IWorkspacePermissions,
    insightProperties,
    isInsight,
    visClassUrl,
} from "@gooddata/sdk-model";
import {
    type ExplicitDrill,
    type ILocale,
    type OnError,
    type OnExportReady,
    type OnLoadingChanged,
    type VisualizationEnvironment,
} from "@gooddata/sdk-ui";

import { type ISortConfig } from "../interfaces/SortConfig.js";
import {
    ConfigPanelClassName,
    type IBucketItem,
    type IConfigurationPanelRenderers,
    type IDrillDownContext,
    type IExtendedReferencePoint,
    type IGdcConfig,
    type IReferencePoint,
    type IVisCallbacks,
    type IVisConstruct,
    type IVisProps,
    type IVisualization,
} from "../interfaces/Visualization.js";
import { type PluggableVisualizationFactory } from "../interfaces/VisualizationDescriptor.js";
import { cleanupKeyDriverAnalysisOnMetrics, hideKeyDriverOnMetrics } from "../utils/keyDriverAnalysis.js";

import { FullVisualizationCatalog, type IVisualizationCatalog } from "./VisualizationCatalog.js";

export interface IBaseVisualizationProps extends IVisCallbacks {
    backend: IAnalyticalBackend;
    projectId: string;
    insight: IInsightDefinition;
    insightPropertiesMeta?: any;
    config?: IGdcConfig;
    executionConfig?: IExecutionConfig;
    visualizationClass: IVisualizationClass;
    environment?: VisualizationEnvironment;
    width?: number;
    height?: number;
    locale?: ILocale;
    messages: Record<string, string>;
    dateFormat?: string;
    drillableItems?: ExplicitDrill[];
    totalsEditAllowed?: boolean;
    featureFlags?: ISettings;
    permissions?: IWorkspacePermissions;
    visualizationCatalog?: IVisualizationCatalog;
    newDerivedBucketItems?: IBucketItem[];
    referencePoint?: IReferencePoint;
    onError: OnError;
    onExportReady?: OnExportReady;
    onLoadingChanged: OnLoadingChanged;
    isMdObjectValid?: boolean;
    configPanelClassName?: string;
    theme?: ITheme;
    /**
     * Theme of record for derived color computations, independent of the presentation theme.
     */
    referenceTheme?: ITheme;
    lastSavedVisClassUrl?: string;
    sourceInsightId?: string;
    onExtendedReferencePointChanged?(referencePoint: IExtendedReferencePoint, sortConfig?: ISortConfig): void;
    onSortingChanged?(sortConfig: ISortConfig): void;

    onNewDerivedBucketItemsPlaced?(): void;

    renderer?(component: any, target: Element): void;
    unmount?(): void;
    configurationPanelRenderers?: IConfigurationPanelRenderers;
    supportsChartFill?: boolean;
}

/**
 * Imperative API of the {@link BaseVisualization}, available through its ref.
 */
export interface IBaseVisualizationApi {
    getExecution(): IPreparedExecution | null;
    getExecutions(): IPreparedExecution[] | undefined;
    getInsightWithDrillDownApplied(
        sourceVisualization: IInsight,
        drillDownContext: IDrillDownContext,
    ): IInsight;
}

const noop = () => {};

function getVisualizationId(insight: IInsightDefinition): string {
    return isInsight(insight) ? insight.insight.identifier : "__new_visualization__";
}

function bucketReferencePointHasChanged(
    currentReferencePoint: IReferencePoint,
    nextReferencePoint: IReferencePoint,
) {
    return !isEqual(
        omit(currentReferencePoint, ["properties", "availableSorts"]),
        omit(nextReferencePoint, ["properties", "availableSorts"]),
    );
}

function propertiesControlsHasChanged(
    currentReferencePoint: IReferencePoint,
    nextReferencePoint: IReferencePoint,
) {
    return !isEqual(currentReferencePoint?.properties?.controls, nextReferencePoint?.properties?.controls);
}

export const BaseVisualization = forwardRef<IBaseVisualizationApi, IBaseVisualizationProps>(
    function BaseVisualization(props, ref) {
        const {
            visualizationCatalog = FullVisualizationCatalog,
            newDerivedBucketItems = [],
            referencePoint = undefined,
            onExtendedReferencePointChanged = noop,
            onNewDerivedBucketItemsPlaced = noop,
            isMdObjectValid = true,
            configPanelClassName = ConfigPanelClassName,
            featureFlags = {},
        } = props;

        /**
         * Props with the defaults applied; the lifecycle handling below compares and passes them around
         * the very same way the class component did with props defaulted by React.
         */
        const currentProps: IBaseVisualizationProps = {
            ...props,
            visualizationCatalog,
            newDerivedBucketItems,
            referencePoint,
            onExtendedReferencePointChanged,
            onNewDerivedBucketItemsPlaced,
            isMdObjectValid,
            configPanelClassName,
            featureFlags,
        };

        const [visElementId, setVisElementId] = useState(() => uuidv4());
        /**
         * Mirror of the visElementId state. The element lookups handed over to the pluggable visualization
         * are lazy, so they must see the new id as soon as it is generated - that is, before the state
         * update is processed and the container div is remounted under the new key.
         */
        const visElementIdRef = useRef(visElementId);
        const visualization = useRef<IVisualization | undefined>(undefined);
        const containerRef = useRef<HTMLDivElement>(null);

        /**
         * The component may render both visualization and config panel. In React18 we therefore need two
         * roots with their respective render methods. This Map holds the roots for both and provides
         * render and unmount methods whenever needed.
         */
        const reactRootsMap = useRef<Map<HTMLElement, Root>>(new Map());

        const executionFactory = useRef<IExecutionFactory | undefined>(undefined);
        if (!executionFactory.current) {
            executionFactory.current = props.backend
                .withCorrelation({ visualizationId: getVisualizationId(props.insight) })
                .workspace(props.projectId)
                .execution();
        }

        const getVisElementClassName = (): string => `gd-vis-${visElementIdRef.current}`;

        const getClassName = (): string => `gd-base-visualization ${getVisElementClassName()}`;

        const getReactRenderFunction = () => {
            return (children: any, element: HTMLElement | null) => {
                if (!element) {
                    return;
                }
                if (!reactRootsMap.current.get(element)) {
                    reactRootsMap.current.set(element, createRoot(element));
                }
                reactRootsMap.current.get(element)!.render(children);
            };
        };

        const getReactUnmountFunction = () => {
            return () => reactRootsMap.current.forEach((root) => root.render(null));
        };

        /**
         * The `hostProps` are the equivalent of `this.props` of the original class component: the class
         * picked the catalog and the messages from the props of the last completed render, which - when
         * setting up on a visualization class change - were still the previous ones. Everything else is
         * taken from the props the visualization is being set up for.
         */
        const setupVisualization = (
            setupProps: IBaseVisualizationProps,
            hostProps: IBaseVisualizationProps = setupProps,
        ) => {
            const {
                insight,
                visualizationClass,
                environment,
                locale,
                featureFlags: setupFeatureFlags,
                permissions,
                projectId,
                configPanelClassName: setupConfigPanelClassName,
                renderer,
                unmount,
            } = setupProps;

            if (visualization.current) {
                visualization.current.unmount();
            }

            const visUri = visClassUrl(visualizationClass);
            let visFactory: PluggableVisualizationFactory | undefined;

            try {
                visFactory = hostProps
                    .visualizationCatalog!.forUri(
                        visUri,
                        setupFeatureFlags?.enableNewPivotTable ?? true,
                        setupFeatureFlags?.enableNewGeoPushpin ?? false,
                    )
                    .getFactory();
            } catch {
                console.error(`Error: unsupported visualization type - ${visUri}`);
            }

            if (visFactory) {
                const constructorParams: IVisConstruct = {
                    projectId,
                    locale,
                    messages: hostProps.messages,
                    environment,
                    backend: setupProps.backend.withCorrelation({
                        visualizationId: getVisualizationId(insight),
                    }),
                    element: () => {
                        const rootNode =
                            (containerRef.current?.getRootNode() as Document | ShadowRoot) ?? document;

                        return rootNode.querySelector(`.${getVisElementClassName()}`);
                    },
                    configPanelElement: () => {
                        const rootNode =
                            (containerRef.current?.getRootNode() as Document | ShadowRoot) ?? document;

                        return rootNode.querySelector(`.${setupConfigPanelClassName}`);
                    },
                    callbacks: {
                        afterRender: setupProps.afterRender,
                        onLoadingChanged: setupProps.onLoadingChanged,
                        onError: setupProps.onError,
                        onExportReady: setupProps.onExportReady,
                        pushData: setupProps.pushData,
                        onDrill: setupProps.onDrill,
                        onDataView: setupProps.onDataView,
                    },
                    featureFlags: setupFeatureFlags,
                    permissions,
                    visualizationProperties: insightProperties(setupProps.insight),
                    renderFun: (renderer ?? getReactRenderFunction()) as (
                        component: any,
                        target: Element | null,
                    ) => void,
                    unmountFun: unmount ?? getReactUnmountFunction(),
                };

                visualization.current = visFactory(constructorParams);
            }
        };

        const getVisualizationProps = (): IVisProps => {
            return {
                locale: props.locale,
                dateFormat: props.dateFormat,
                dimensions: {
                    width: props.width,
                    height: props.height,
                },
                custom: {
                    drillableItems: props.drillableItems,
                    totalsEditAllowed: props.totalsEditAllowed,
                    lastSavedVisClassUrl: props.lastSavedVisClassUrl,
                    sourceInsightId: props.sourceInsightId,
                    configurationPanelRenderers: props.configurationPanelRenderers,
                },
                messages: props.messages,
                config: props.config,
                theme: props.theme,
                referenceTheme: props.referenceTheme,
                executionConfig: props.executionConfig,
                supportsChartFill: props.supportsChartFill,
            };
        };

        const updateVisualization = () => {
            if (!visualization.current) {
                return;
            }

            visualization.current.update(
                getVisualizationProps(),
                props.insight,
                props.insightPropertiesMeta,
                executionFactory.current!,
            );
        };

        const triggerPlaceNewDerivedBucketItems = (
            triggerProps: IBaseVisualizationProps,
            newBucketItemsFromVisualization?: IBucketItem[],
        ) => {
            const {
                newDerivedBucketItems: triggerNewDerivedBucketItems,
                referencePoint: triggerReferencePoint,
                onNewDerivedBucketItemsPlaced: triggerOnNewDerivedBucketItemsPlaced,
            } = triggerProps;
            const newDerivedBucketItemsToPlace =
                newBucketItemsFromVisualization ?? triggerNewDerivedBucketItems;

            if (
                visualization.current &&
                triggerReferencePoint &&
                newDerivedBucketItemsToPlace &&
                triggerOnNewDerivedBucketItemsPlaced
            ) {
                void visualization.current
                    .addNewDerivedBucketItems(triggerReferencePoint, newDerivedBucketItemsToPlace)
                    .then(triggerOnNewDerivedBucketItemsPlaced);
            }
        };

        const triggerExtendedReferencePointChanged = (
            newProps: IBaseVisualizationProps,
            previousProps?: IBaseVisualizationProps,
        ) => {
            const {
                referencePoint: newReferencePoint,
                onExtendedReferencePointChanged: newOnExtendedReferencePointChanged,
            } = newProps;

            if (visualization.current && newReferencePoint && newOnExtendedReferencePointChanged) {
                void visualization.current
                    .getExtendedReferencePoint(newReferencePoint, previousProps?.referencePoint)
                    .then(async (extendedReferencePoint) => {
                        const sortConfig = await visualization.current!.getSortConfig(extendedReferencePoint);
                        let updatedExtendedReferencePoint =
                            cleanupKeyDriverAnalysisOnMetrics(extendedReferencePoint);
                        updatedExtendedReferencePoint = hideKeyDriverOnMetrics(updatedExtendedReferencePoint);
                        // new sort config needs to be sent together with new reference point to avoid double executions with old invalid sort until new one arrives by its own handler
                        newOnExtendedReferencePointChanged(updatedExtendedReferencePoint, sortConfig);
                    });
            }
        };

        const triggerPropertiesChanged = (
            newProps: IBaseVisualizationProps,
            previousProps?: IBaseVisualizationProps,
        ) => {
            const { referencePoint: newReferencePoint, onSortingChanged } = newProps;
            // Some of the properties eg. stacking of measures, dual axes influence sorting
            if (visualization.current && newReferencePoint && onSortingChanged) {
                void visualization.current
                    .getExtendedReferencePoint(newReferencePoint, previousProps?.referencePoint)
                    .then((extendedRefPoint) => {
                        void visualization.current!.getSortConfig(extendedRefPoint).then(onSortingChanged);
                    });
            }
        };

        const somePropertiesRelevantForReferencePointChanged = (
            currentReferencePoint: IReferencePoint,
            nextReferencePoint: IReferencePoint,
        ) => {
            if (visualization.current) {
                return visualization.current.haveSomePropertiesRelevantForReferencePointChanged(
                    currentReferencePoint,
                    nextReferencePoint,
                );
            }
            return false;
        };

        const getInsightWithDrillDownApplied = (
            sourceVisualization: IInsight,
            drillDownContext: IDrillDownContext,
        ): IInsight => {
            return visualization.current!.getInsightWithDrillDownApplied(
                sourceVisualization,
                drillDownContext,
                props.backend.capabilities.supportsElementUris ?? true,
            );
        };

        const getExecution = () => {
            if (!visualization.current) {
                setupVisualization(currentProps);
            }

            return visualization.current!.getExecution(
                getVisualizationProps(),
                props.insight,
                executionFactory.current!,
            );
        };

        const getExecutions = (): IPreparedExecution[] | undefined => {
            if (!visualization.current) {
                setupVisualization(currentProps);
            }

            return visualization.current?.getExecutions?.(
                getVisualizationProps(),
                props.insight,
                executionFactory.current!,
            );
        };

        useImperativeHandle(ref, () => ({
            getExecution,
            getExecutions,
            getInsightWithDrillDownApplied,
        }));

        const prevPropsRef = useRef(currentProps);
        const mountedRef = useRef(false);

        /**
         * Replacement of UNSAFE_componentWillReceiveProps. Runs before the mount & update effect below so
         * that the derived bucket items and the reference point are handled before the visualization is
         * updated, the same way the class did it in the pre-render phase.
         *
         * The effect intentionally has no dependency list - it has to see every single commit, exactly like
         * the class lifecycle did; the props diff below decides what actually happens. The visElementId is
         * regenerated only when the visualization class really changes, so there is no update loop.
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
        useLayoutEffect(() => {
            const previousProps = prevPropsRef.current;
            prevPropsRef.current = currentProps;

            if (previousProps === currentProps) {
                // the very first run, there is nothing to diff against yet
                return;
            }

            const newDerivedBucketItemsChanged =
                !isEmpty(currentProps.newDerivedBucketItems) &&
                !isEqual(currentProps.newDerivedBucketItems, previousProps.newDerivedBucketItems);

            if (newDerivedBucketItemsChanged) {
                triggerPlaceNewDerivedBucketItems(currentProps);
                return;
            }

            // buckets changed from within inner visualization logic
            const bucketsToUpdate = visualization.current?.getBucketsToUpdate(
                previousProps.referencePoint!,
                currentProps.referencePoint!,
            );

            if (bucketsToUpdate) {
                triggerPlaceNewDerivedBucketItems(currentProps, bucketsToUpdate);
                triggerExtendedReferencePointChanged(currentProps, previousProps);
                return;
            }

            const visualizationClassChanged = !isEqual(
                currentProps.visualizationClass,
                previousProps.visualizationClass,
            );
            const referencePointChanged = bucketReferencePointHasChanged(
                previousProps.referencePoint!,
                currentProps.referencePoint!,
            );

            const relevantPropertiesChanged = somePropertiesRelevantForReferencePointChanged(
                previousProps.referencePoint!,
                currentProps.referencePoint!,
            );

            const labelsChanged = !isEqual(
                previousProps.insight?.insight.attributeFilterConfigs,
                currentProps.insight?.insight.attributeFilterConfigs,
            );

            const propertiesControlsChanged = propertiesControlsHasChanged(
                previousProps.referencePoint!,
                currentProps.referencePoint!,
            );

            if (visualizationClassChanged) {
                const newVisElementId = uuidv4();
                visElementIdRef.current = newVisElementId;
                setVisElementId(newVisElementId);
                setupVisualization(currentProps, previousProps);
            }
            if (
                referencePointChanged ||
                relevantPropertiesChanged ||
                visualizationClassChanged ||
                labelsChanged
            ) {
                triggerExtendedReferencePointChanged(
                    currentProps,
                    // only pass current props if the visualization class is the same (see getExtendedReferencePoint JSDoc)
                    visualizationClassChanged ? undefined : previousProps,
                );
                // Some of the properties eg. stacking of measures, dual axes influence sorting
            } else if (propertiesControlsChanged) {
                triggerPropertiesChanged(currentProps, previousProps);
            }
        });

        /**
         * Replacement of componentDidMount and componentDidUpdate.
         */
        useLayoutEffect(() => {
            if (!mountedRef.current) {
                mountedRef.current = true;
                setupVisualization(currentProps);
                updateVisualization();
                triggerExtendedReferencePointChanged(currentProps);
                return;
            }

            if (visElementId !== visElementIdRef.current) {
                // the visualization class has just changed; the container div is about to be remounted
                // under the new key, so postpone the update until it is in the DOM
                return;
            }

            if (isMdObjectValid) {
                updateVisualization();
            }
        });

        /**
         * Replacement of componentWillUnmount.
         */
        useEffect(() => {
            const reactRoots = reactRootsMap.current;

            return () => {
                // a subsequent mount (React StrictMode remounts the tree in development) has to set the
                // visualization up again, exactly like componentDidMount did
                mountedRef.current = false;
                visualization.current?.unmount();
                // In order to avoid race conditions when mounting and unmounting synchronously,
                // we use timeout for React18.
                // https://github.com/facebook/react/issues/25675
                reactRoots.forEach((root: Root) => setTimeout(() => root.unmount(), 0));
            };
        }, []);

        return (
            <div
                aria-label="base-visualization"
                key={visElementId}
                style={{ height: "100%" }}
                className={getClassName()}
                ref={containerRef}
            />
        );
    },
);
