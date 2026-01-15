// (C) 2019-2026 GoodData Corporation

import { cloneDeep, isEmpty, set, tail } from "lodash-es";

import { type IInsight, type IInsightDefinition, newAttributeSort } from "@gooddata/sdk-model";
import {
    BucketNames,
    type IDrillEvent,
    VisualizationTypes,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";

import { ATTRIBUTE, BUCKETS, DATE } from "../../../constants/bucket.js";
import { HEATMAP_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { DEFAULT_HEATMAP_UICONFIG } from "../../../constants/uiConfig.js";
import { type ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig.js";
import {
    type IBucketItem,
    type IDrillDownContext,
    type IDrillDownDefinition,
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IVisConstruct,
    type IVisProps,
} from "../../../interfaces/Visualization.js";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    getAllAttributeItemsWithPreference,
    getBucketItems,
    getMeasureItems,
    getPreferredBucketItems,
    limitNumberOfMeasuresInBuckets,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper.js";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper.js";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper.js";
import { getCustomSortDisabledExplanation } from "../../../utils/sort.js";
import { setHeatmapUiConfig } from "../../../utils/uiConfigHelpers/heatmapUiConfigHelper.js";
import { HeatMapConfigurationPanel } from "../../configurationPanels/HeatMapConfigurationPanel.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil.js";

/**
 * PluggableHeatmap
 *
 * ## Buckets
 *
 * | Name    | Id       | Accepts             |
 * |---------|----------|---------------------|
 * | Measure | measures | measures only       |
 * | Rows    | view     | attributes or dates |
 * | Columns | stack    | attributes or dates |
 *
 * ### Bucket axioms
 *
 * - |Measure| = 1
 * - |Rows| ≤ 1
 * - |Columns| ≤ 1
 *
 * ## Dimensions
 *
 * The PluggableHeatmap always creates the same two dimensional execution.
 *
 * - ⊤ ⇒ [[...Rows], [...Columns, MeasureGroupIdentifier]]
 *
 * ## Sorts
 *
 * Unless the user specifies otherwise, the sorts used by default are:
 *
 * - |Rows| ≥ 1 ⇒ [attributeAreaSort(Rows[0])]
 */
export class PluggableHeatmap extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.HEATMAP;

        this.supportedPropertiesList = HEATMAP_SUPPORTED_PROPERTIES;
        this.backendCapabilities = props.backend.capabilities;
        this.initializeProperties(props.visualizationProperties);
    }

    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        const uiConfig = cloneDeep(DEFAULT_HEATMAP_UICONFIG);
        this.addMetricToFiltersIfEnabled(uiConfig);

        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig,
        };

        newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
        newReferencePoint = removeAllDerivedMeasures(newReferencePoint);

        const buckets = limitNumberOfMeasuresInBuckets(clonedReferencePoint.buckets, 1);
        const allAttributes = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.VIEW,
            BucketNames.TREND,
            BucketNames.LOCATION,
            BucketNames.STACK,
            BucketNames.SEGMENT,
        ]);
        const stackItems = getPreferredBucketItems(
            buckets,
            [BucketNames.STACK, BucketNames.SEGMENT],
            [ATTRIBUTE, DATE],
        );

        const measures = getMeasureItems(buckets);
        const rowItems = allAttributes.filter((attribute) => {
            return !stackItems.includes(attribute);
        });
        const columnItems = rowItems.length > 1 ? tail(rowItems) : stackItems;

        set(newReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: measures,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: rowItems.slice(0, 1),
            },
            {
                localIdentifier: BucketNames.STACK,
                items: columnItems.slice(0, 1),
            },
        ]);

        newReferencePoint = setHeatmapUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, true);
        newReferencePoint = configureOverTimeComparison(newReferencePoint);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );

        return Promise.resolve(
            sanitizeFilters(newReferencePoint, this.featureFlags?.enableImprovedAdFilters, referencePoint),
        );
    }

    private addFilters(
        source: IInsight,
        drillConfig: IDrillDownDefinition,
        event: IDrillEvent,
        backendSupportsElementUris: boolean,
    ) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);
        const cutIntersection = (event.drillContext.intersection || []).filter(
            (i) =>
                isDrillIntersectionAttributeItem(i.header) &&
                i.header.attributeHeader.localIdentifier === clicked,
        );
        return addIntersectionFiltersToInsight(source, cutIntersection, backendSupportsElementUris);
    }

    public override getInsightWithDrillDownApplied(
        source: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
    ): IInsight {
        const withFilters = this.addFilters(
            source,
            drillDownContext.drillDefinition,
            drillDownContext.event,
            backendSupportsElementUris,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    protected getDefaultAndAvailableSort(
        measures: IBucketItem[],
        viewBy: IBucketItem[],
        stackBy: IBucketItem[],
    ): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        if (!isEmpty(viewBy) && !isEmpty(stackBy) && !isEmpty(measures)) {
            return {
                defaultSort: [
                    newAttributeSort(viewBy[0].localIdentifier, "desc"),
                    newAttributeSort(stackBy[0].localIdentifier, "asc"),
                ],
                availableSorts: [
                    newAvailableSortsGroup(viewBy[0].localIdentifier),
                    newAvailableSortsGroup(stackBy[0].localIdentifier),
                ],
            };
        }
        if (!isEmpty(measures) && !isEmpty(viewBy)) {
            return {
                defaultSort: [newAttributeSort(viewBy[0].localIdentifier, "desc")],
                availableSorts: [
                    newAvailableSortsGroup(
                        viewBy[0].localIdentifier,
                        [measures[0].localIdentifier],
                        true,
                        false,
                    ),
                ],
            };
        }
        if (!isEmpty(measures) && !isEmpty(stackBy)) {
            return {
                defaultSort: [newAttributeSort(stackBy[0].localIdentifier, "asc")],
                availableSorts: [newAvailableSortsGroup(stackBy[0].localIdentifier)],
            };
        }

        return {
            defaultSort: [],
            availableSorts: [],
        };
    }

    private isSortDisabled(referencePoint: IReferencePoint, availableSorts: ISortConfig["availableSorts"]) {
        const { buckets } = referencePoint;
        const measures = getMeasureItems(buckets);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const stackBy = getBucketItems(buckets, BucketNames.STACK);
        const disabled =
            (viewBy.length < 1 && stackBy.length < 1) || measures.length < 1 || availableSorts.length === 0;
        const disabledExplanation = getCustomSortDisabledExplanation(
            measures,
            [...viewBy, ...stackBy],
            this.intl,
        );
        return {
            disabled,
            disabledExplanation,
        };
    }

    public override getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { buckets, properties, availableSorts: previousAvailableSorts } = referencePoint;
        const measures = getMeasureItems(buckets);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const stackBy = getBucketItems(buckets, BucketNames.STACK);
        const { defaultSort, availableSorts } = this.getDefaultAndAvailableSort(measures, viewBy, stackBy);

        const { disabled, disabledExplanation } = this.isSortDisabled(referencePoint, availableSorts);

        return Promise.resolve({
            supported: true,
            disabled,
            appliedSort: super.reuseCurrentSort(
                previousAvailableSorts,
                properties,
                availableSorts,
                defaultSort,
            ),
            defaultSort,
            availableSorts,
            ...(disabledExplanation && { disabledExplanation }),
        });
    }

    protected override renderConfigurationPanel(insight: IInsightDefinition, options: IVisProps): null {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            const panelConfig = {
                supportsAttributeHierarchies: this.backendCapabilities.supportsAttributeHierarchies,
                supportsChartFill: options.supportsChartFill,
            };

            this.renderFun(
                <HeatMapConfigurationPanel
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
        return null;
    }
}
