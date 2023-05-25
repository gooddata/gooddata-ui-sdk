// (C) 2019-2022 GoodData Corporation
import React from "react";
import isEmpty from "lodash/isEmpty.js";
import cloneDeep from "lodash/cloneDeep.js";
import includes from "lodash/includes.js";
import set from "lodash/set.js";
import tail from "lodash/tail.js";
import {
    BucketNames,
    IDrillEvent,
    isDrillIntersectionAttributeItem,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import { IInsight, IInsightDefinition, newAttributeSort } from "@gooddata/sdk-model";

import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil.js";

import HeatMapConfigurationPanel from "../../configurationPanels/HeatMapConfigurationPanel.js";

import { ATTRIBUTE, BUCKETS, DATE } from "../../../constants/bucket.js";
import { HEATMAP_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import { DEFAULT_HEATMAP_UICONFIG } from "../../../constants/uiConfig.js";

import {
    IDrillDownContext,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IDrillDownDefinition,
    IBucketItem,
} from "../../../interfaces/Visualization.js";
import { ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig.js";

import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig.js";
import {
    getAllAttributeItemsWithPreference,
    getMeasureItems,
    getPreferredBucketItems,
    limitNumberOfMeasuresInBuckets,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
    getBucketItems,
} from "../../../utils/bucketHelper.js";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper.js";
import { removeSort, getCustomSortDisabledExplanation } from "../../../utils/sort.js";
import { setHeatmapUiConfig } from "../../../utils/uiConfigHelpers/heatmapUiConfigHelper.js";

import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper.js";

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
        this.initializeProperties(props.visualizationProperties);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: cloneDeep(DEFAULT_HEATMAP_UICONFIG),
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
            return !includes(stackItems, attribute);
        });
        const columnItems = allAttributes.length > 1 ? tail(allAttributes) : stackItems;

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
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        if (!this.featureFlags.enableChartsSorting) {
            newReferencePoint = removeSort(newReferencePoint);
        }

        return Promise.resolve(sanitizeFilters(newReferencePoint));
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

    public getInsightWithDrillDownApplied(
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

    public getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
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

    protected renderConfigurationPanel(insight: IInsightDefinition): React.ReactNode {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
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
                />,
                configPanelElement,
            );
        }
        return null;
    }
}
