// (C) 2019-2022 GoodData Corporation
import { IAnalyticalBackend, IExecutionFactory, ISettings, ITheme } from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    IInsightDefinition,
    insightProperties,
    IVisualizationClass,
    visClassUrl,
    IExecutionConfig,
} from "@gooddata/sdk-model";
import React from "react";
import { render } from "react-dom";
import { v4 as uuidv4 } from "uuid";
import {
    ExplicitDrill,
    ILocale,
    OnError,
    OnExportReady,
    OnLoadingChanged,
    VisualizationEnvironment,
} from "@gooddata/sdk-ui";
import {
    ConfigPanelClassName,
    IBucketItem,
    IGdcConfig,
    IReferencePoint,
    IVisCallbacks,
    IVisConstruct,
    IVisualization,
    IDrillDownContext,
    IVisProps,
    IExtendedReferencePoint,
    ISortConfig,
} from "../interfaces/Visualization";
import { PluggableVisualizationFactory } from "../interfaces/VisualizationDescriptor";
import { FullVisualizationCatalog, IVisualizationCatalog } from "./VisualizationCatalog";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import noop from "lodash/noop";
import omit from "lodash/omit";

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
    dateFormat?: string;
    drillableItems?: ExplicitDrill[];
    totalsEditAllowed?: boolean;
    featureFlags?: ISettings;
    visualizationCatalog?: IVisualizationCatalog;
    newDerivedBucketItems?: IBucketItem[];
    referencePoint?: IReferencePoint;
    onError: OnError;
    onExportReady?: OnExportReady;
    onLoadingChanged: OnLoadingChanged;
    isMdObjectValid?: boolean;
    configPanelClassName?: string;
    theme?: ITheme;
    onExtendedReferencePointChanged?(referencePoint: IExtendedReferencePoint): void;
    onSortingChanged?(sortConfig: ISortConfig): void;
    onNewDerivedBucketItemsPlaced?(): void;

    renderer?(component: any, target: Element): void;
}

export class BaseVisualization extends React.PureComponent<IBaseVisualizationProps> {
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
        | "renderer"
    > = {
        visualizationCatalog: FullVisualizationCatalog,
        newDerivedBucketItems: [],
        referencePoint: null,
        onExtendedReferencePointChanged: noop,
        onNewDerivedBucketItemsPlaced: noop,
        isMdObjectValid: true,
        configPanelClassName: ConfigPanelClassName,
        featureFlags: {},
        renderer: render,
    };

    private visElementId: string;
    private visualization: IVisualization;
    private executionFactory: IExecutionFactory;

    constructor(props: IBaseVisualizationProps) {
        super(props);
        this.visElementId = uuidv4();
        this.executionFactory = props.backend.workspace(props.projectId).execution();
    }

    public componentWillUnmount(): void {
        this.visualization.unmount();
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IBaseVisualizationProps): void {
        const newDerivedBucketItemsChanged =
            !isEmpty(nextProps.newDerivedBucketItems) &&
            !isEqual(nextProps.newDerivedBucketItems, this.props.newDerivedBucketItems);

        if (newDerivedBucketItemsChanged) {
            this.triggerPlaceNewDerivedBucketItems(nextProps);
            return;
        }

        const visualizationClassChanged = !isEqual(
            nextProps.visualizationClass,
            this.props.visualizationClass,
        );
        const referencePointChanged = BaseVisualization.bucketReferencePointHasChanged(
            this.props.referencePoint,
            nextProps.referencePoint,
        );
        const propertiesChanged = BaseVisualization.propertiesHasChanged(
            this.props.referencePoint,
            nextProps.referencePoint,
        );

        if (visualizationClassChanged) {
            this.visElementId = uuidv4();
            this.setupVisualization(nextProps);
        }

        if (referencePointChanged || visualizationClassChanged) {
            this.triggerExtendedReferencePointChanged(
                nextProps,
                // only pass current props if the visualization class is the same (see getExtendedReferencePoint JSDoc)
                visualizationClassChanged ? undefined : this.props,
            );
        }
        if (propertiesChanged) {
            this.triggerPropertiesChanged(nextProps);
        }
    }

    public componentDidMount(): void {
        this.setupVisualization(this.props);
        this.updateVisualization();
        this.triggerExtendedReferencePointChanged(this.props);
    }

    public componentDidUpdate(): void {
        if (this.props.isMdObjectValid) {
            this.updateVisualization();
        }
    }

    public render(): React.ReactNode {
        return <div key={this.visElementId} style={{ height: "100%" }} className={this.getClassName()} />;
    }

    private getVisElementClassName(): string {
        return `gd-vis-${this.visElementId}`;
    }

    private getClassName(): string {
        return `gd-base-visualization ${this.getVisElementClassName()}`;
    }

    private setupVisualization(props: IBaseVisualizationProps) {
        const {
            visualizationClass,
            environment,
            locale,
            featureFlags,
            projectId,
            configPanelClassName,
            renderer,
        } = props;

        if (this.visualization) {
            this.visualization.unmount();
        }

        const visUri = visClassUrl(visualizationClass);
        let visFactory: PluggableVisualizationFactory | undefined;

        try {
            visFactory = this.props.visualizationCatalog.forUri(visUri).getFactory();
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(`Error: unsupported visualization type - ${visUri}`);
        }

        if (visFactory) {
            const constructorParams: IVisConstruct = {
                projectId,
                locale,
                environment,
                backend: props.backend,
                element: `.${this.getVisElementClassName()}`,
                configPanelElement: `.${configPanelClassName}`,
                callbacks: {
                    afterRender: props.afterRender,
                    onLoadingChanged: props.onLoadingChanged,
                    onError: props.onError,
                    onExportReady: props.onExportReady,
                    pushData: props.pushData,
                    onDrill: props.onDrill,
                },
                featureFlags,
                visualizationProperties: insightProperties(props.insight),
                renderFun: renderer,
            };

            this.visualization = visFactory(constructorParams);
        }
    }

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

    private triggerPlaceNewDerivedBucketItems(props: IBaseVisualizationProps) {
        const { newDerivedBucketItems, referencePoint, onNewDerivedBucketItemsPlaced } = props;

        if (this.visualization && referencePoint && newDerivedBucketItems && onNewDerivedBucketItemsPlaced) {
            this.visualization
                .addNewDerivedBucketItems(referencePoint, newDerivedBucketItems)
                .then(onNewDerivedBucketItemsPlaced);
        }
    }

    private triggerExtendedReferencePointChanged(
        newProps: IBaseVisualizationProps,
        currentProps?: IBaseVisualizationProps,
    ) {
        const {
            referencePoint: newReferencePoint,
            onExtendedReferencePointChanged,
            onSortingChanged,
        } = newProps;

        if (this.visualization && newReferencePoint && onExtendedReferencePointChanged) {
            this.visualization
                .getExtendedReferencePoint(newReferencePoint, currentProps && currentProps.referencePoint)
                .then(async (extendedReferencePoint) => {
                    onExtendedReferencePointChanged(extendedReferencePoint);
                    const sortConfig = await this.visualization.getSortConfig(extendedReferencePoint);
                    return onSortingChanged && onSortingChanged(sortConfig);
                });
        }
    }

    private triggerPropertiesChanged(newProps: IBaseVisualizationProps) {
        const { referencePoint: newReferencePoint, onSortingChanged } = newProps;
        // Some of the properties eg. stacking of measures, dual axes influence sorting
        if (this.visualization && newReferencePoint && onSortingChanged) {
            this.visualization.getSortConfig(newReferencePoint).then(onSortingChanged);
        }
    }

    private static bucketReferencePointHasChanged(
        currentReferencePoint: IReferencePoint,
        nextReferencePoint: IReferencePoint,
    ) {
        return !isEqual(omit(currentReferencePoint, "properties"), omit(nextReferencePoint, "properties"));
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
            },
            config: this.props.config,
            theme: this.props.theme,
            executionConfig: this.props.executionConfig,
        };
    }

    private static propertiesHasChanged(
        currentReferencePoint: IReferencePoint,
        nextReferencePoint: IReferencePoint,
    ) {
        return !isEqual(currentReferencePoint.properties, nextReferencePoint.properties);
    }

    public getInsightWithDrillDownApplied(
        sourceVisualization: IInsight,
        drillDownContext: IDrillDownContext,
    ): IInsight {
        return this.visualization.getInsightWithDrillDownApplied(sourceVisualization, drillDownContext);
    }

    public getExecution() {
        if (!this.visualization) {
            this.setupVisualization(this.props);
        }

        return this.visualization.getExecution(
            this.getVisualizationProps(),
            this.props.insight,
            this.executionFactory,
        );
    }
}
