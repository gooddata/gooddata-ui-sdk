// (C) 2019-2020 GoodData Corporation
import * as React from "react";
import { render } from "react-dom";
import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig";
import cloneDeep = require("lodash/cloneDeep");
import includes = require("lodash/includes");
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisConstruct,
    IBucketItem,
    IBucketOfFun,
} from "../../../interfaces/Visualization";

import {
    sanitizeFilters,
    getMeasures,
    getPreferredBucketItems,
    getAllAttributeItems,
    limitNumberOfMeasuresInBuckets,
    findDerivedBucketItem,
    isDerivedBucketItem,
    hasDerivedBucketItems,
} from "../../../utils/bucketHelper";

import { METRIC, BUCKETS } from "../../../constants/bucket";
import { removeSort } from "../../../utils/sort";
import { getBulletChartUiConfig } from "../../../utils/uiConfigHelpers/bulletChartUiConfigHelper";
import { DEFAULT_BULLET_CHART_CONFIG } from "../../../constants/uiConfig";
import { BULLET_CHART_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import BulletChartConfigurationPanel from "../../configurationPanels/BulletChartConfigurationPanel";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { VisualizationTypes, BucketNames } from "@gooddata/sdk-ui";
import { IInsightDefinition } from "@gooddata/sdk-model";

const getMeasuresBucketItems = (
    allMeasures: IBucketItem[],
    preferredMeasuresBucketItems: IBucketItem[],
    otherMeasuresBucketItems: IBucketItem[],
): IBucketItem[] =>
    preferredMeasuresBucketItems.length > 0
        ? preferredMeasuresBucketItems.slice(0, 1)
        : allMeasures.filter(measure => !includes(otherMeasuresBucketItems, measure)).slice(0, 1);

export class PluggableBulletChart extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);

        this.type = VisualizationTypes.BULLET;
        this.supportedPropertiesList = BULLET_CHART_SUPPORTED_PROPERTIES;

        this.initializeProperties(props.visualizationProperties);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: cloneDeep(DEFAULT_BULLET_CHART_CONFIG),
        };

        const buckets = limitNumberOfMeasuresInBuckets(clonedReferencePoint.buckets, 3, true);

        const originalPrimaryMeasuresBucketItems = getPreferredBucketItems(
            buckets,
            [BucketNames.MEASURES],
            [METRIC],
        );
        const originalSecondaryMeasuresBucketItems = getPreferredBucketItems(
            buckets,
            [BucketNames.SECONDARY_MEASURES],
            [METRIC],
        );
        const originalTertiaryMeasuresBucketItems = getPreferredBucketItems(
            buckets,
            [BucketNames.TERTIARY_MEASURES],
            [METRIC],
        );
        const allMeasures = getMeasures(buckets);

        const primaryMeasuresBucketItems = getMeasuresBucketItems(
            allMeasures,
            originalPrimaryMeasuresBucketItems,
            [...originalSecondaryMeasuresBucketItems, ...originalTertiaryMeasuresBucketItems],
        );

        const secondaryMeasuresBucketItems = getMeasuresBucketItems(
            allMeasures,
            originalSecondaryMeasuresBucketItems,
            [...primaryMeasuresBucketItems, ...originalTertiaryMeasuresBucketItems],
        );

        const tertiaryMeasuresBucketItems = getMeasuresBucketItems(
            allMeasures,
            originalTertiaryMeasuresBucketItems,
            [...primaryMeasuresBucketItems, ...secondaryMeasuresBucketItems],
        );

        newReferencePoint[BUCKETS] = [
            {
                localIdentifier: BucketNames.MEASURES,
                items: primaryMeasuresBucketItems,
            },
            {
                localIdentifier: BucketNames.SECONDARY_MEASURES,
                items: secondaryMeasuresBucketItems,
            },
            {
                localIdentifier: BucketNames.TERTIARY_MEASURES,
                items: tertiaryMeasuresBucketItems,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: getAllAttributeItems(buckets).slice(0, 2),
            },
        ];

        newReferencePoint = getBulletChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, true);
        newReferencePoint = configureOverTimeComparison(newReferencePoint);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);

        this.setPrimaryMeasureIsMissingError(
            primaryMeasuresBucketItems,
            secondaryMeasuresBucketItems,
            tertiaryMeasuresBucketItems,
        );

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    protected renderConfigurationPanel(insight: IInsightDefinition) {
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
                    isError={this.isError}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
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

    private setPrimaryMeasureIsMissingError(
        primaryMeasures: IBucketItem[],
        secondaryMeasures: IBucketItem[],
        tertiaryMeasures: IBucketItem[],
    ): void {
        this.isError =
            primaryMeasures.length === 0 && (secondaryMeasures.length > 0 || tertiaryMeasures.length > 0);
    }
}
