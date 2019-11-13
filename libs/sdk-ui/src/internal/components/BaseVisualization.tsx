// (C) 2019 GoodData Corporation
import * as React from "react";
import * as uuid from "uuid";
import { IDrillableItem } from "../../base/interfaces/DrillEvents";
import * as VisEvents from "../../base/interfaces/Events";
import { VisualizationEnvironment } from "../../base/constants/visualizationTypes";
import {
    IBucketItem,
    IFeatureFlags,
    IGdcConfig,
    IReferencePoint,
    IVisCallbacks,
    IVisConstruct,
    IVisualization,
} from "../interfaces/Visualization";
import { PluggableBarChart } from "./pluggableVisualizations/barChart/PluggableBarChart";
import { PluggableColumnChart } from "./pluggableVisualizations/columnChart/PluggableColumnChart";
import { PluggableHeatmap } from "./pluggableVisualizations/heatMap/PluggableHeatmap";
import { PluggableLineChart } from "./pluggableVisualizations/lineChart/PluggableLineChart";
import { PluggableAreaChart } from "./pluggableVisualizations/areaChart/PluggableAreaChart";
import { PluggablePieChart } from "./pluggableVisualizations/pieChart/PluggablePieChart";
import { PluggableDonutChart } from "./pluggableVisualizations/donutChart/PluggableDonutChart";
// import { PluggablePivotTable } from "../../_defunct/internal/components/pluggableVisualizations/pivotTable/PluggablePivotTable";
import { PluggableHeadline } from "./pluggableVisualizations/headline/PluggableHeadline";
import { PluggableScatterPlot } from "./pluggableVisualizations/scatterPlot/PluggableScatterPlot";
import { PluggableComboChartDeprecated } from "./pluggableVisualizations/comboChart/PluggableComboChartDeprecated";
import { PluggableComboChart } from "./pluggableVisualizations/comboChart/PluggableComboChart";
import { PluggableTreemap } from "./pluggableVisualizations/treeMap/PluggableTreemap";
import { PluggableFunnelChart } from "./pluggableVisualizations/funnelChart/PluggableFunnelChart";
import { PluggableBubbleChart } from "./pluggableVisualizations/bubbleChart/PluggableBubbleChart";
import { IInsight, insightProperties, IVisualizationClass, visClassUrl } from "@gooddata/sdk-model";
import { IAnalyticalBackend, IExecutionFactory } from "@gooddata/sdk-backend-spi";
import isEqual = require("lodash/isEqual");
import isEmpty = require("lodash/isEmpty");
import noop = require("lodash/noop");
import omit = require("lodash/omit");
import { ILocale } from "../../base/interfaces/Locale";

// visualization catalogue - add your new visualization here
const VisualizationsCatalog = {
    bar: PluggableBarChart,
    column: PluggableColumnChart,
    line: PluggableLineChart,
    area: PluggableAreaChart,
    pie: PluggablePieChart,
    donut: PluggableDonutChart,
    // table: PluggablePivotTable,
    headline: PluggableHeadline,
    scatter: PluggableScatterPlot,
    bubble: PluggableBubbleChart,
    heatmap: PluggableHeatmap,
    combo: PluggableComboChartDeprecated, // old combo chart
    combo2: PluggableComboChart, // new combo chart
    treemap: PluggableTreemap,
    funnel: PluggableFunnelChart,
};

export interface IBaseVisualizationProps extends IVisCallbacks {
    projectId: string;
    insight: IInsight;
    config?: IGdcConfig;
    visualizationClass: IVisualizationClass;
    environment?: VisualizationEnvironment;
    stickyHeaderOffset?: number;
    height?: number;
    locale?: ILocale;
    drillableItems: IDrillableItem[];
    totalsEditAllowed?: boolean;
    featureFlags?: IFeatureFlags;
    visualizationsCatalog?: object;
    newDerivedBucketItems?: IBucketItem[];
    referencePoint?: IReferencePoint;
    onError: VisEvents.OnError;
    onExportReady: VisEvents.OnExportReady;
    onLoadingChanged: VisEvents.OnLoadingChanged;
    isMdObjectValid?: boolean;
    backend: IAnalyticalBackend;
    onExtendedReferencePointChanged?(): void;
    onNewDerivedBucketItemsPlaced?(): void;
}

export class BaseVisualization extends React.PureComponent<IBaseVisualizationProps, null> {
    public static defaultProps: Partial<IBaseVisualizationProps> = {
        visualizationsCatalog: VisualizationsCatalog,
        newDerivedBucketItems: [],
        referencePoint: null,
        onExtendedReferencePointChanged: noop,
        onNewDerivedBucketItemsPlaced: noop,
        isMdObjectValid: true,
        featureFlags: {},
    };

    private componentId: string;
    private visualization: IVisualization;
    private executionFactory: IExecutionFactory;

    constructor(props: IBaseVisualizationProps) {
        super(props);
        this.componentId = uuid.v4();
        this.executionFactory = props.backend.workspace(props.projectId).execution();
    }

    public componentWillUnmount() {
        this.visualization.unmount();
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IBaseVisualizationProps) {
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
        const referencePointChanged = this.bucketReferencePointHasChanged(
            this.props.referencePoint,
            nextProps.referencePoint,
        );

        if (visualizationClassChanged) {
            this.componentId = uuid.v4();
            this.setupVisualization(nextProps);
        }

        if (referencePointChanged || visualizationClassChanged) {
            this.triggerExtendedReferencePointChanged(
                nextProps,
                // only pass current props if the visualization class is the same (see getExtendedReferencePoint JSDoc)
                visualizationClassChanged ? undefined : this.props,
            );
        }
    }

    public componentDidMount() {
        this.setupVisualization(this.props);
        this.updateVisualization();
        this.triggerExtendedReferencePointChanged(this.props);
    }

    public componentDidUpdate() {
        if (this.props.isMdObjectValid) {
            this.updateVisualization();
        }
    }

    public render() {
        return <div key={this.componentId} style={{ height: "100%" }} className={this.getClassName()} />;
    }

    private getVisualizationClassName(): string {
        return `gd-vis-${this.componentId}`;
    }

    private getConfigPanelClassName(): string {
        return "gd-configuration-panel-content";
    }

    private getClassName(): string {
        return `gd-base-visualization ${this.getVisualizationClassName()}`;
    }

    private setupVisualization(props: IBaseVisualizationProps) {
        const { visualizationClass, environment, locale, featureFlags, projectId } = props;

        if (this.visualization) {
            this.visualization.unmount();
        }

        const type = visClassUrl(visualizationClass).split(":")[1];

        const visConstructor = this.props.visualizationsCatalog[type];

        if (visConstructor) {
            const constInput: IVisConstruct = {
                projectId,
                locale,
                environment,
                backend: props.backend,
                element: `.${this.getVisualizationClassName()}`,
                configPanelElement: `.${this.getConfigPanelClassName()}`,
                callbacks: {
                    afterRender: props.afterRender,
                    onLoadingChanged: props.onLoadingChanged,
                    onError: props.onError,
                    onExportReady: props.onExportReady,
                    pushData: props.pushData,
                },
                featureFlags,
                visualizationProperties: insightProperties(props.insight),
            };

            this.visualization = new visConstructor(constInput);
        } else {
            console.error(`Error: unsupported visualization type - ${type}`); // tslint:disable-line
        }
    }

    private updateVisualization() {
        if (this.visualization) {
            this.visualization.update(
                {
                    locale: this.props.locale,
                    dimensions: {
                        height: this.props.height,
                    },
                    custom: {
                        stickyHeaderOffset: this.props.stickyHeaderOffset,
                        drillableItems: this.props.drillableItems,
                        totalsEditAllowed: this.props.totalsEditAllowed,
                    },
                    config: this.props.config,
                },
                this.props.insight,
                this.executionFactory,
            );
        }
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
        const { referencePoint: newReferencePoint, onExtendedReferencePointChanged } = newProps;

        if (this.visualization && newReferencePoint && onExtendedReferencePointChanged) {
            this.visualization
                .getExtendedReferencePoint(newReferencePoint, currentProps && currentProps.referencePoint)
                .then(onExtendedReferencePointChanged);
        }
    }

    private bucketReferencePointHasChanged(
        currentReferencePoint: IReferencePoint,
        nextReferencePoint: IReferencePoint,
    ) {
        return !isEqual(omit(currentReferencePoint, "properties"), omit(nextReferencePoint, "properties"));
    }
}
