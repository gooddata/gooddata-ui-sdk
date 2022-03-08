// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render } from "react-dom";
import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig";
import cloneDeep from "lodash/cloneDeep";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
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
} from "../../../interfaces/Visualization";

import {
    sanitizeFilters,
    findDerivedBucketItem,
    isDerivedBucketItem,
    hasDerivedBucketItems,
    isComparisonAvailable,
    removeAllDerivedMeasures,
    getBucketItems,
    getAllItemsByType,
} from "../../../utils/bucketHelper";

import { BUCKETS, METRIC } from "../../../constants/bucket";
import { removeSort } from "../../../utils/sort";
import { getBulletChartUiConfig } from "../../../utils/uiConfigHelpers/bulletChartUiConfigHelper";
import { BULLET_CHART_CONFIG_MULTIPLE_DATES, DEFAULT_BULLET_CHART_CONFIG } from "../../../constants/uiConfig";
import { BULLET_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import BulletChartConfigurationPanel from "../../configurationPanels/BulletChartConfigurationPanel";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { VisualizationTypes, IDrillEvent, getIntersectionPartAfter, BucketNames } from "@gooddata/sdk-ui";
import {
    bucketIsEmpty,
    IInsight,
    IInsightDefinition,
    insightBucket,
    localIdRef,
    newAttributeSort,
} from "@gooddata/sdk-model";
import { transformBuckets } from "./bucketHelper";
import { modifyBucketsAttributesForDrillDown, addIntersectionFiltersToInsight } from "../drillDownUtil";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper";
import { ISortConfig, newMeasureSortSuggestion } from "../../../interfaces/SortConfig";

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

    private addFiltersForBullet(source: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);

        const cutIntersection = getIntersectionPartAfter(event.drillContext.intersection, clicked);
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }

    public getInsightWithDrillDownApplied(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFiltersForBullet(
            source,
            drillDownContext.drillDefinition,
            drillDownContext.event,
        );
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    protected renderConfigurationPanel(insight: IInsightDefinition): React.ReactNode {
        if (document.querySelector(this.configPanelElement)) {
            render(
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
                document.querySelector(this.configPanelElement),
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

    private isSortDisabled(referencePoint: IReferencePoint, availableSorts: ISortConfig["availableSorts"]) {
        const { buckets } = referencePoint;
        const primaryMeasures = getBucketItems(buckets, BucketNames.MEASURES);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);
        return viewBy.length < 1 || primaryMeasures.length < 1 || availableSorts.length === 0;
    }

    private getDefaultAndAvailableSort(referencePoint: IReferencePoint): {
        defaultSort: ISortConfig["defaultSort"];
        availableSorts: ISortConfig["availableSorts"];
    } {
        const { buckets } = referencePoint;
        const measures = getAllItemsByType(buckets, [METRIC]);
        const viewBy = getBucketItems(buckets, BucketNames.VIEW);

        const defaultSort = viewBy.map((vb) => newAttributeSort(vb.localIdentifier, "asc"));

        if (viewBy.length >= 2) {
            return {
                defaultSort,
                availableSorts: [
                    {
                        itemId: localIdRef(viewBy[0].localIdentifier),
                        attributeSort: {
                            normalSortEnabled: true,
                            areaSortEnabled: true,
                        },
                    },
                    {
                        itemId: localIdRef(viewBy[1].localIdentifier),
                        attributeSort: {
                            normalSortEnabled: true,
                            areaSortEnabled: measures.length > 1,
                        },
                        metricSorts: measures.map((m) => newMeasureSortSuggestion(m.localIdentifier)),
                    },
                ],
            };
        }
        if (viewBy.length === 1) {
            return {
                defaultSort,
                availableSorts: [
                    {
                        itemId: localIdRef(viewBy[0].localIdentifier),
                        attributeSort: {
                            normalSortEnabled: true,
                            areaSortEnabled: measures.length > 1,
                        },
                        metricSorts: measures.map((m) => newMeasureSortSuggestion(m.localIdentifier)),
                    },
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
        const disabled = this.isSortDisabled(referencePoint, availableSorts);
        return Promise.resolve({
            supported: true,
            disabled,
            defaultSort,
            availableSorts,
        });
    }
}
