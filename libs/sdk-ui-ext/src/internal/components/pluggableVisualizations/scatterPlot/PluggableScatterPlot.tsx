// (C) 2019-2025 GoodData Corporation

import { cloneDeep, set } from "lodash-es";

import { IInsightDefinition } from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";

import { transformBuckets } from "./bucketHelper.js";
import { BUCKETS } from "../../../constants/bucket.js";
import { SCATTERPLOT_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { DEFAULT_SCATTERPLOT_UICONFIG } from "../../../constants/uiConfig.js";
import {
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IVisProps,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    findBucket,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper.js";
import { removeSort } from "../../../utils/sort.js";
import { setScatterPlotUiConfig } from "../../../utils/uiConfigHelpers/scatterPlotUiConfigHelper.js";
import ScatterPlotConfigurationPanel from "../../configurationPanels/ScatterPlotConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";

/**
 * PluggableScatterPlot
 *
 * ## Buckets
 *
 * | Name             | Id                 | Accepts             |
 * |------------------|--------------------|---------------------|
 * | Measure (X-axis) | measures           | measures only       |
 * | Measure (Y-axis) | secondary_measures | measures only       |
 * | ViewBy           | attribute          | attributes or dates |
 * | SegmentBy        | attribute          | attributes or dates |
 *
 * ### Bucket axioms
 *
 * - |MeasureX| ≤ 1
 * - |MeasureY| ≤ 1
 * - |ViewBy| ≤ 1
 * - |SegmentBy| ≤ 1
 * - |MeasureX| + |MeasureY| ≥ 1
 *
 * ## Dimensions
 *
 * The PluggableScatterPlot always creates the same two dimensional execution.
 *
 * - ⊤ ⇒ [[...ViewBy, ...SegmentBy], [MeasureGroupIdentifier]]
 *
 * ## Sorts
 *
 * The PluggableScatterPlot does not use any sorts.
 */
export class PluggableScatterPlot extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.SCATTER;
        this.supportedPropertiesList = SCATTERPLOT_SUPPORTED_PROPERTIES;
        this.initializeProperties(props.visualizationProperties);
    }

    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: cloneDeep(DEFAULT_SCATTERPLOT_UICONFIG),
        };

        newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
        newReferencePoint = removeAllDerivedMeasures(newReferencePoint);

        newReferencePoint[BUCKETS] = transformBuckets(newReferencePoint.buckets);

        newReferencePoint = setScatterPlotUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, true);
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);
        newReferencePoint = sanitizeFilters(newReferencePoint);
        newReferencePoint = disableClusteringForMissingViewBy(newReferencePoint);
        newReferencePoint = disableClusteringIfFewerThanTwoMeasures(newReferencePoint);

        return Promise.resolve(newReferencePoint);
    }

    protected override renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): void {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            const panelConfig = {
                supportsAttributeHierarchies: this.backendCapabilities.supportsAttributeHierarchies,
            };

            this.renderFun(
                <ScatterPlotConfigurationPanel
                    locale={this.locale}
                    references={this.references}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    colors={this.colors}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                    panelConfig={panelConfig}
                    configurationPanelRenderers={options.custom?.configurationPanelRenderers}
                />,
                configPanelElement,
            );
        }
    }
}

function disableClusteringForMissingViewBy(referencePoint: IExtendedReferencePoint): IExtendedReferencePoint {
    let updatedReferencePoint = referencePoint;
    const viewByBucket = findBucket(referencePoint.buckets, BucketNames.ATTRIBUTE);
    const hasViewByItems = (viewByBucket?.items?.length ?? 0) > 0;
    if (!hasViewByItems) {
        updatedReferencePoint = set(referencePoint, "properties.controls.clustering.enabled", false);
    }
    return updatedReferencePoint;
}

function disableClusteringIfFewerThanTwoMeasures(
    referencePoint: IExtendedReferencePoint,
): IExtendedReferencePoint {
    let updatedReferencePoint = referencePoint;
    const measuresBucket = findBucket(referencePoint.buckets, BucketNames.MEASURES);
    const secondaryMeasuresBucket = findBucket(referencePoint.buckets, BucketNames.SECONDARY_MEASURES);
    const measuresBucketItemsCount = measuresBucket?.items?.length ?? 0;
    const secondaryMeasuresBucketItemsCount = secondaryMeasuresBucket?.items?.length ?? 0;
    const hasXAndYMeasures = measuresBucketItemsCount === 1 && secondaryMeasuresBucketItemsCount === 1;
    if (!hasXAndYMeasures) {
        updatedReferencePoint = set(referencePoint, "properties.controls.clustering.enabled", false);
    }
    return updatedReferencePoint;
}
