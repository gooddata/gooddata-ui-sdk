// (C) 2019 GoodData Corporation
import { bucketsItems, IInsightDefinition, insightBuckets } from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import * as React from "react";
import { render } from "react-dom";

import { BUCKETS } from "../../../constants/bucket";
import {
    AREA_CHART_SUPPORTED_PROPERTIES,
    OPTIONAL_STACKING_PROPERTIES,
} from "../../../constants/supportedProperties";
import { DEFAULT_AREA_UICONFIG, MAX_STACKS_COUNT, MAX_VIEW_COUNT } from "../../../constants/uiConfig";
import {
    IBucketItem,
    IBucketOfFun,
    IExtendedReferencePoint,
    IReferencePoint,
    IUiConfig,
    IVisConstruct,
    IVisProps,
} from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    getAllAttributeItemsWithPreference,
    getAllCategoriesAttributeItems,
    getDateItems,
    getFilteredMeasuresForStackedCharts,
    getStackItems,
    isDateBucketItem,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper";
import {
    getReferencePointWithSupportedProperties,
    removeImmutableOptionalStackingProperties,
} from "../../../utils/propertiesHelper";
import { removeSort } from "../../../utils/sort";

import { setAreaChartUiConfig } from "../../../utils/uiConfigHelpers/areaChartUiConfigHelper";
import LineChartBasedConfigurationPanel from "../../configurationPanels/LineChartBasedConfigurationPanel";

import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import negate = require("lodash/negate");
import set = require("lodash/set");
import { SettingCatalog } from "@gooddata/sdk-backend-spi";

export class PluggableAreaChart extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.AREA;
        this.defaultControlsProperties = {
            stackMeasures: true,
        };
        this.initializeProperties(props.visualizationProperties);
    }

    public getUiConfig(): IUiConfig {
        return cloneDeep(DEFAULT_AREA_UICONFIG);
    }

    protected updateInstanceProperties(
        options: IVisProps,
        insight: IInsightDefinition,
        insightPropertiesMeta: any,
    ) {
        super.updateInstanceProperties(options, insight, insightPropertiesMeta);

        this.updateCustomSupportedProperties(insight);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: this.getUiConfig(),
        };
        newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
        newReferencePoint = removeAllDerivedMeasures(newReferencePoint);

        this.configureBuckets(newReferencePoint);

        newReferencePoint = setAreaChartUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags[SettingCatalog.enableWeekFilters],
        );

        this.supportedPropertiesList = removeImmutableOptionalStackingProperties(
            newReferencePoint,
            this.getSupportedPropertiesList(),
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);
        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    protected configureBuckets(extendedReferencePoint: IExtendedReferencePoint): void {
        const { measures, views, stacks } = this.getBucketItems(extendedReferencePoint);

        set(extendedReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: measures,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: views,
            },
            {
                localIdentifier: BucketNames.STACK,
                items: stacks,
            },
        ]);
    }

    protected getSupportedPropertiesList() {
        return AREA_CHART_SUPPORTED_PROPERTIES;
    }

    protected renderConfigurationPanel(insight: IInsightDefinition) {
        if (document.querySelector(this.configPanelElement)) {
            render(
                <LineChartBasedConfigurationPanel
                    locale={this.locale}
                    colors={this.colors}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    references={this.references}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }

    private updateCustomSupportedProperties(insight: IInsightDefinition): void {
        if (bucketsItems(insightBuckets(insight, BucketNames.VIEW)).length > 1) {
            this.addSupportedProperties(OPTIONAL_STACKING_PROPERTIES);
            this.setCustomControlsProperties({
                stackMeasures: false,
                stackMeasuresToPercent: false,
            });
        } else {
            this.setCustomControlsProperties({});
        }
    }

    private addSupportedProperties(properties: string[]) {
        const supportedPropertiesList = this.supportedPropertiesList;
        (properties || []).forEach((property: string) => {
            if (!supportedPropertiesList.some((supportedProperty) => supportedProperty === property)) {
                supportedPropertiesList.push(property);
            }
        });
    }

    private getAllAttributes(buckets: IBucketOfFun[]): IBucketItem[] {
        return getAllAttributeItemsWithPreference(buckets, [
            BucketNames.TREND,
            BucketNames.VIEW,
            BucketNames.SEGMENT,
            BucketNames.STACK,
        ]);
    }

    private getAllAttributesWithoutDate(buckets: IBucketOfFun[]): IBucketItem[] {
        return this.getAllAttributes(buckets).filter(negate(isDateBucketItem));
    }

    private filterStackItems(bucketItems: IBucketItem[]): IBucketItem[] {
        return bucketItems.filter(negate(isDateBucketItem)).slice(0, MAX_STACKS_COUNT);
    }

    private getBucketItems(referencePoint: IReferencePoint) {
        const buckets = get(referencePoint, BUCKETS, []);
        const measures = getFilteredMeasuresForStackedCharts(buckets);
        const dateItems = getDateItems(buckets);

        let stacks: IBucketItem[] = this.filterStackItems(getStackItems(buckets));
        const isAllowMoreThanOneViewByAttribute = !stacks.length && measures.length <= 1;
        const numOfAttributes = isAllowMoreThanOneViewByAttribute ? MAX_VIEW_COUNT : 1;
        let views: IBucketItem[] = getAllCategoriesAttributeItems(buckets).slice(0, numOfAttributes);
        const hasDateItemInViewByBucket = views.some(isDateBucketItem);

        if (dateItems.length && !hasDateItemInViewByBucket) {
            const firstDateItem = dateItems[0];
            const allAttributes = this.getAllAttributesWithoutDate(buckets);
            const extraViewItems = allAttributes.slice(0, numOfAttributes - 1);
            views = numOfAttributes > 1 ? [firstDateItem, ...extraViewItems] : [firstDateItem];
            if (!isAllowMoreThanOneViewByAttribute && measures.length <= 1) {
                stacks = allAttributes.slice(0, MAX_STACKS_COUNT);
            }
        }

        return {
            measures,
            views,
            stacks,
        };
    }
}
