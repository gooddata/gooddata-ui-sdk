// (C) 2019-2026 GoodData Corporation

import { PureComponent, type RefObject, createRef } from "react";

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

import { FullVisualizationCatalog, type IVisualizationCatalog } from "./VisualizationCatalog.js";
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

export class BaseVisualization extends PureComponent<IBaseVisualizationProps> {
    public static defaultProps: Pick<
        IBaseVisualizationProps,
        | "visualizationCatalog"
        | "newDerivedBucketItems"
        | "referencePoint"
        | "onExtendedReferencePointChanged"
        | "onNewDerivedBucketItemsPlaced"
        | "isMdObjectValid"
        | "configPanelClassName"
        | "featureFlags"
    > = {
        visualizationCatalog: FullVisualizationCatalog,
        newDerivedBucketItems: [],
        referencePoint: undefined,
        onExtendedReferencePointChanged: () => {},
        onNewDerivedBucketItemsPlaced: () => {},
        isMdObjectValid: true,
        configPanelClassName: ConfigPanelClassName,
        featureFlags: {},
    };

    private visElementId: string;
    private visualization: IVisualization | undefined;
    private executionFactory: IExecutionFactory;
    private containerRef: RefObject<HTMLDivElement | null>;

    /**
     * The component may render both visualization and config panel. In React18 we therefore need two
     * roots with their respective render methods. This Map holds the roots for both and provides
     * render and unmount methods whenever needed.
     */
    private reactRootsMap: Map<HTMLElement, Root> = new Map();

    constructor(props: IBaseVisualizationProps) {
        super(props);
        const { insight } = props;
        let visualizationId;
        if (isInsight(insight)) {
            visualizationId = insight.insight.identifier;
        } else {
            visualizationId = "__new_visualization__";
        }

        this.visElementId = uuidv4();
        this.executionFactory = props.backend
            .withCorrelation({ visualizationId })
            .workspace(props.projectId)
            .execution();
        this.containerRef = createRef();
    }

    public override componentWillUnmount(): void {
        if (this.visualization) {
            this.visualization.unmount();
        }
        // In order to avoid race conditions when mounting and unmounting synchronously,
        // we use timeout for React18.
        // https://github.com/facebook/react/issues/25675
        this.reactRootsMap.forEach((root: Root) => setTimeout(() => root.unmount(), 0));
    }

    public override UNSAFE_componentWillReceiveProps(nextProps: IBaseVisualizationProps): void {
        const newDerivedBucketItemsChanged =
            !isEmpty(nextProps.newDerivedBucketItems) &&
            !isEqual(nextProps.newDerivedBucketItems, this.props.newDerivedBucketItems);

        if (newDerivedBucketItemsChanged) {
            this.triggerPlaceNewDerivedBucketItems(nextProps);
            return;
        }

        // buckets changed from within inner visualization logic
        const bucketsToUpdate = this.visualization?.getBucketsToUpdate(
            this.props.referencePoint!,
            nextProps.referencePoint!,
        );

        if (bucketsToUpdate) {
            this.triggerPlaceNewDerivedBucketItems(nextProps, bucketsToUpdate);
            this.triggerExtendedReferencePointChanged(nextProps, this.props);
            return;
        }

        const visualizationClassChanged = !isEqual(
            nextProps.visualizationClass,
            this.props.visualizationClass,
        );
        const referencePointChanged = BaseVisualization.bucketReferencePointHasChanged(
            this.props.referencePoint!,
            nextProps.referencePoint!,
        );

        const relevantPropertiesChanged = this.somePropertiesRelevantForReferencePointChanged(
            this.props.referencePoint!,
            nextProps.referencePoint!,
        );

        const labelsChanged = !isEqual(
            this.props.insight?.insight.attributeFilterConfigs,
            nextProps.insight?.insight.attributeFilterConfigs,
        );

        const propertiesControlsChanged = BaseVisualization.propertiesControlsHasChanged(
            this.props.referencePoint!,
            nextProps.referencePoint!,
        );

        if (visualizationClassChanged) {
            this.visElementId = uuidv4();
            this.setupVisualization(nextProps);
        }
        if (
            referencePointChanged ||
            relevantPropertiesChanged ||
            visualizationClassChanged ||
            labelsChanged
        ) {
            this.triggerExtendedReferencePointChanged(
                nextProps,
                // only pass current props if the visualization class is the same (see getExtendedReferencePoint JSDoc)
                visualizationClassChanged ? undefined : this.props,
            );
            // Some of the properties eg. stacking of measures, dual axes influence sorting
        } else if (propertiesControlsChanged) {
            this.triggerPropertiesChanged(nextProps, this.props);
        }
    }

    public override componentDidMount(): void {
        this.setupVisualization(this.props);
        this.updateVisualization();
        this.triggerExtendedReferencePointChanged(this.props);
    }

    public override componentDidUpdate(): void {
        if (this.props.isMdObjectValid) {
            this.updateVisualization();
        }
    }

    public override render() {
        return (
            <div
                aria-label="base-visualization"
                key={this.visElementId}
                style={{ height: "100%" }}
                className={this.getClassName()}
                ref={this.containerRef}
            />
        );
    }

    private getVisElementClassName(): string {
        return `gd-vis-${this.visElementId}`;
    }

    private getClassName(): string {
        return `gd-base-visualization ${this.getVisElementClassName()}`;
    }

    private setupVisualization(props: IBaseVisualizationProps) {
        const {
            insight,
            visualizationClass,
            environment,
            locale,
            featureFlags,
            permissions,
            projectId,
            configPanelClassName,
            renderer,
            unmount,
        } = props;

        if (this.visualization) {
            this.visualization.unmount();
        }

        const visUri = visClassUrl(visualizationClass);
        let visFactory: PluggableVisualizationFactory | undefined;

        try {
            visFactory = this.props
                .visualizationCatalog!.forUri(
                    visUri,
                    featureFlags?.enableNewPivotTable ?? true,
                    featureFlags?.enableNewGeoPushpin ?? false,
                )
                .getFactory();
        } catch {
            console.error(`Error: unsupported visualization type - ${visUri}`);
        }

        let visualizationId: string;
        if (isInsight(insight)) {
            visualizationId = insight.insight.identifier;
        } else {
            visualizationId = "__new_visualization__";
        }

        if (visFactory) {
            const constructorParams: IVisConstruct = {
                projectId,
                locale,
                messages: this.props.messages,
                environment,
                backend: props.backend.withCorrelation({ visualizationId }),
                element: () => {
                    const rootNode =
                        (this.containerRef.current?.getRootNode() as Document | ShadowRoot) ?? document;

                    return rootNode.querySelector(`.${this.getVisElementClassName()}`);
                },
                configPanelElement: () => {
                    const rootNode =
                        (this.containerRef.current?.getRootNode() as Document | ShadowRoot) ?? document;

                    return rootNode.querySelector(`.${configPanelClassName}`);
                },
                callbacks: {
                    afterRender: props.afterRender,
                    onLoadingChanged: props.onLoadingChanged,
                    onError: props.onError,
                    onExportReady: props.onExportReady,
                    pushData: props.pushData,
                    onDrill: props.onDrill,
                    onDataView: props.onDataView,
                },
                featureFlags,
                permissions,
                visualizationProperties: insightProperties(props.insight),
                renderFun: (renderer ?? this.getReactRenderFunction()) as (
                    component: any,
                    target: Element | null,
                ) => void,
                unmountFun: unmount ?? this.getReactUnmountFunction(),
            };

            this.visualization = visFactory(constructorParams);
        }
    }

    private getReactRenderFunction = () => {
        return (children: any, element: HTMLElement | null) => {
            if (!element) {
                return;
            }
            if (!this.reactRootsMap.get(element)) {
                this.reactRootsMap.set(element, createRoot(element));
            }
            this.reactRootsMap.get(element)!.render(children);
        };
    };

    private getReactUnmountFunction = () => {
        return () => this.reactRootsMap.forEach((root) => root.render(null));
    };

    private updateVisualization() {
        if (!this.visualization) {
            return;
        }

        this.visualization.update(
            this.getVisualizationProps(),
            this.props.insight,
            this.props.insightPropertiesMeta,
            this.executionFactory,
        );
    }

    private triggerPlaceNewDerivedBucketItems(
        props: IBaseVisualizationProps,
        newBucketItemsFromVisualization?: IBucketItem[],
    ) {
        const { newDerivedBucketItems, referencePoint, onNewDerivedBucketItemsPlaced } = props;
        const newDerivedBucketItemsToPlace = newBucketItemsFromVisualization ?? newDerivedBucketItems;

        if (
            this.visualization &&
            referencePoint &&
            newDerivedBucketItemsToPlace &&
            onNewDerivedBucketItemsPlaced
        ) {
            void this.visualization
                .addNewDerivedBucketItems(referencePoint, newDerivedBucketItemsToPlace)
                .then(onNewDerivedBucketItemsPlaced);
        }
    }

    private triggerExtendedReferencePointChanged(
        newProps: IBaseVisualizationProps,
        currentProps?: IBaseVisualizationProps,
    ) {
        const { referencePoint: newReferencePoint, onExtendedReferencePointChanged } = newProps;

        if (this.visualization && newReferencePoint && onExtendedReferencePointChanged) {
            void this.visualization
                .getExtendedReferencePoint(newReferencePoint, currentProps?.referencePoint)
                .then(async (extendedReferencePoint) => {
                    const sortConfig = await this.visualization!.getSortConfig(extendedReferencePoint);
                    // new sort config needs to be sent together with new reference point to avoid double executions with old invalid sort until new one arrives by its own handler
                    onExtendedReferencePointChanged(extendedReferencePoint, sortConfig);
                });
        }
    }

    private triggerPropertiesChanged(
        newProps: IBaseVisualizationProps,
        currentProps?: IBaseVisualizationProps,
    ) {
        const { referencePoint: newReferencePoint, onSortingChanged } = newProps;
        // Some of the properties eg. stacking of measures, dual axes influence sorting
        if (this.visualization && newReferencePoint && onSortingChanged) {
            void this.visualization
                .getExtendedReferencePoint(newReferencePoint, currentProps?.referencePoint)
                .then((extendedRefPoint) => {
                    void this.visualization!.getSortConfig(extendedRefPoint).then(onSortingChanged);
                });
        }
    }

    private static bucketReferencePointHasChanged(
        currentReferencePoint: IReferencePoint,
        nextReferencePoint: IReferencePoint,
    ) {
        return !isEqual(
            omit(currentReferencePoint, ["properties", "availableSorts"]),
            omit(nextReferencePoint, ["properties", "availableSorts"]),
        );
    }

    private static propertiesControlsHasChanged(
        currentReferencePoint: IReferencePoint,
        nextReferencePoint: IReferencePoint,
    ) {
        return !isEqual(
            currentReferencePoint?.properties?.controls,
            nextReferencePoint?.properties?.controls,
        );
    }

    private somePropertiesRelevantForReferencePointChanged(
        currentReferencePoint: IReferencePoint,
        nextReferencePoint: IReferencePoint,
    ) {
        if (this.visualization) {
            return this.visualization.haveSomePropertiesRelevantForReferencePointChanged(
                currentReferencePoint,
                nextReferencePoint,
            );
        }
        return false;
    }

    private getVisualizationProps(): IVisProps {
        return {
            locale: this.props.locale,
            dateFormat: this.props.dateFormat,
            dimensions: {
                width: this.props.width,
                height: this.props.height,
            },
            custom: {
                drillableItems: this.props.drillableItems,
                totalsEditAllowed: this.props.totalsEditAllowed,
                lastSavedVisClassUrl: this.props.lastSavedVisClassUrl,
                sourceInsightId: this.props.sourceInsightId,
                configurationPanelRenderers: this.props.configurationPanelRenderers,
            },
            messages: this.props.messages,
            config: this.props.config,
            theme: this.props.theme,
            executionConfig: this.props.executionConfig,
            supportsChartFill: this.props.supportsChartFill,
        };
    }

    public getInsightWithDrillDownApplied(
        sourceVisualization: IInsight,
        drillDownContext: IDrillDownContext,
    ): IInsight {
        return this.visualization!.getInsightWithDrillDownApplied(
            sourceVisualization,
            drillDownContext,
            this.props.backend.capabilities.supportsElementUris ?? true,
        );
    }

    public getExecution() {
        if (!this.visualization) {
            this.setupVisualization(this.props);
        }

        return this.visualization!.getExecution(
            this.getVisualizationProps(),
            this.props.insight,
            this.executionFactory,
        );
    }

    public getExecutions(): IPreparedExecution[] | undefined {
        if (!this.visualization) {
            this.setupVisualization(this.props);
        }

        return this.visualization?.getExecutions?.(
            this.getVisualizationProps(),
            this.props.insight,
            this.executionFactory,
        );
    }
}
