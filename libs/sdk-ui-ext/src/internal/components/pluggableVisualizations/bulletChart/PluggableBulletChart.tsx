// (C) 2019-2022 GoodData Corporation
import React from "react";
import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig.js";
import cloneDeep from "lodash/cloneDeep.js";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart.js";
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisConstruct,
    IBucketItem,
    IBucketOfFun,
    IDrillDownContext,
    InvalidBucketsSdkError,
    IUiConfig,
    IDrillDownDefinition,
} from "../../../interfaces/Visualization.js";

import {
    sanitizeFilters,
    findDerivedBucketItem,
    isDerivedBucketItem,
    hasDerivedBucketItems,
    isComparisonAvailable,
    removeAllDerivedMeasures,
    getBucketItems,
    getAllItemsByType,
} from "../../../utils/bucketHelper.js";

import { BUCKETS, METRIC } from "../../../constants/bucket.js";
import { removeSort, getCustomSortDisabledExplanation } from "../../../utils/sort.js";
import { getBulletChartUiConfig } from "../../../utils/uiConfigHelpers/bulletChartUiConfigHelper.js";
import {
    BULLET_CHART_CONFIG_MULTIPLE_DATES,
    DEFAULT_BULLET_CHART_CONFIG,
} from "../../../constants/uiConfig.js";
import { BULLET_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties.js";
import BulletChartConfigurationPanel from "../../configurationPanels/BulletChartConfigurationPanel.js";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper.js";
import { VisualizationTypes, IDrillEvent, getIntersectionPartAfter, BucketNames } from "@gooddata/sdk-ui";
import {
    bucketIsEmpty,
    IInsight,
    IInsightDefinition,
    insightBucket,
    newAttributeSort,
} from "@gooddata/sdk-model";
import { transformBuckets } from "./bucketHelper.js";
import { modifyBucketsAttributesForDrillDown, addIntersectionFiltersToInsight } from "../drillDownUtil.js";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper.js";
import { ISortConfig, newAvailableSortsGroup } from "../../../interfaces/SortConfig.js";

/**
 * PluggableBulletChart
 *
 * ## Buckets
 *
 * | Name                  | Id                 | Accepts             |
 * |-----------------------|--------------------|---------------------|
 * | Measure (Primary)     | measures           | measures only       |
 * | Measure (Target)      | secondary_measures | measures only       |
 * | Measure (Comparative) | tertiary_measures  | measures only       |
 * | ViewBy                | view               | attributes or dates |
 *
 * ### Bucket axioms
 *
 * - |MeasurePrimary| = 1
 * - |MeasureTarget| ≤ 1
 * - |MeasureComparative| ≤ 1
 * - |ViewBy| ≤ 1
 *
 * ## Dimensions
 *
 * The PluggableBulletChart always creates the same two dimensional execution.
 *
 * - ⊤ ⇒ [[MeasureGroupIdentifier], [...ViewBy]]
 *
 * ## Sorts
 *
 * The PluggableBulletChart does not use any sorts.
 */
export class PluggableBulletChart extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);

        this.type = VisualizationTypes.BULLET;
        this.supportedPropertiesList = BULLET_CHART_SUPPORTED_PROPERTIES;

        this.initializeProperties(props.visualizationProperties);
    }

    public getUiConfig(): IUiConfig {
        return cloneDeep(
            this.isMultipleDatesEnabled() ? BULLET_CHART_CONFIG_MULTIPLE_DATES : DEFAULT_BULLET_CHART_CONFIG,
        );
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);

        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: this.getUiConfig(),
        };

        let buckets = transformBuckets(newReferencePoint.buckets);

        if (!isComparisonAvailable(buckets, newReferencePoint.filters)) {
            // When in first measure bucket after transformBuckets is just one PoP measure and DataFilter is not related
            // than in configureOverTimeComparison method this measure is removed and chart stay in inconstant state
            // after 1st transformBuckets we have to check if comparison is not available and than remove all derived measures
            // from original reference point and than transform buckets again
            newReferencePoint = removeAllDerivedMeasures(newReferencePoint);
            buckets = transformBuckets(newReferencePoint.buckets);
        }

        newReferencePoint[BUCKETS] = buckets;

        newReferencePoint = getBulletChartUiConfig(newReferencePoint, this.intl, this.type);
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

    private addFiltersForBullet(
        source: IInsight,
        drillConfig: IDrillDownDefinition,
        event: IDrillEvent,
        backendSupportsElementUris: boolean,
    ) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);

        const cutIntersection = getIntersectionPartAfter(event.drillContext.intersection, clicked);
        return addIntersectionFiltersToInsight(source, cutIntersection, backendSupportsElementUris);
    }

    public getInsightWithDrillDownApplied(
        source: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
    ): IInsight {
        const withFilters = this.addFiltersForBullet(
            source,
            drillDownContext.drillDefinition,
            drillDownContext.event,
            backendSupportsElementUris,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    protected renderConfigurationPanel(insight: IInsightDefinition): React.ReactNode {
        const configPanelElement = this.getConfigPanelElement();

        if (configPanelElement) {
            this.renderFun(
                <BulletChartConfigurationPanel
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

    protected mergeDerivedBucketItems(
        referencePoint: IReferencePoint,
        bucket: IBucketOfFun,
        newDerivedBucketItems: IBucketItem[],
    ): IBucketItem[] {
        return bucket.items.reduce((resultItems: IBucketItem[], bucketItem: IBucketItem) => {
            resultItems.push(bucketItem);

            const newDerivedBucketItem = findDerivedBucketItem(bucketItem, newDerivedBucketItems);
            const shouldAddItem =
                newDerivedBucketItem &&
                !isDerivedBucketItem(bucketItem) &&
                !hasDerivedBucketItems(bucketItem, referencePoint.buckets);

            if (shouldAddItem) {
                resultItems.push(newDerivedBucketItem);
            }

            return resultItems;
        }, []);
    }

    protected checkBeforeRender(insight: IInsightDefinition): boolean {
        super.checkBeforeRender(insight);

        const measureBucket = insightBucket(insight, BucketNames.MEASURES);
        if (!measureBucket || bucketIsEmpty(measureBucket)) {
            // unmount on error, AD cant recover in some scenarios
            this.unmount();

            throw new InvalidBucketsSdkError();
        }

        return true;
    }

    private isSortDisabled(referencePoint: IReferencePoint) {
        const { buckets } = referencePoint;
        const primaryMeasures = getBucketItems(buckets, BucketNames.MEASURES);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        const disabledExplanation = getCustomSortDisabledExplanation(primaryMeasures, viewBy, this.intl);
        return {
            disabled: viewBy.length < 1 || primaryMeasures.length < 1,
            disabledExplanation,
        };
    }

    private getDefaultAndAvailableSort(referencePoint: IReferencePoint): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        if (this.isSortDisabled(referencePoint).disabled) {
            return {
                defaultSort: [],
                availableSorts: [],
            };
        }
        const { buckets } = referencePoint;
        const measures = getAllItemsByType(buckets, [METRIC]);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);

        const defaultSort = viewBy.map((vb) => newAttributeSort(vb.localIdentifier, "asc"));

        if (viewBy.length >= 2) {
            return {
                defaultSort,
                availableSorts: [
                    newAvailableSortsGroup(viewBy[0].localIdentifier),
                    newAvailableSortsGroup(
                        viewBy[1].localIdentifier,
                        measures.map((m) => m.localIdentifier),
                        true,
                        measures.length > 1,
                    ),
                ],
            };
        }
        if (viewBy.length === 1) {
            return {
                defaultSort,
                availableSorts: [
                    newAvailableSortsGroup(
                        viewBy[0].localIdentifier,
                        measures.map((m) => m.localIdentifier),
                        true,
                        measures.length > 1,
                    ),
                ],
            };
        }
        return {
            defaultSort: [],
            availableSorts: [],
        };
    }

    public getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig> {
        const { defaultSort, availableSorts } = this.getDefaultAndAvailableSort(referencePoint);
        const { disabled, disabledExplanation } = this.isSortDisabled(referencePoint);
        const { properties, availableSorts: previousAvailableSorts } = referencePoint;
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
}
