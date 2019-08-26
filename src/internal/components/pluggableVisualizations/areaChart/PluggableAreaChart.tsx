// (C) 2019 GoodData Corporation
import * as React from "react";
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import negate = require("lodash/negate");
import { render } from "react-dom";
import * as BucketNames from "../../../../constants/bucketNames";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";
import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig";

import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisConstruct,
    IBucketItem,
    IUiConfig,
    IBucket,
    IVisProps,
    IVisualizationProperties,
    IReferences,
} from "../../../interfaces/Visualization";
import { DEFAULT_AREA_UICONFIG, MAX_STACKS_COUNT, MAX_VIEW_COUNT } from "../../../constants/uiConfig";

import { BUCKETS } from "../../../constants/bucket";

import {
    sanitizeUnusedFilters,
    getStackItems,
    getDateItems,
    getAllAttributeItemsWithPreference,
    isDate,
    removeAllDerivedMeasures,
    removeAllArithmeticMeasuresFromDerived,
    getFilteredMeasuresForStackedCharts,
    getAllCategoriesAttributeItems,
} from "../../../utils/bucketHelper";

import { setAreaChartUiConfig } from "../../../utils/uiConfigHelpers/areaChartUiConfigHelper";
import { removeSort } from "../../../utils/sort";
import LineChartBasedConfigurationPanel from "../../configurationPanels/LineChartBasedConfigurationPanel";
import {
    getReferencePointWithSupportedProperties,
    removeImmutableOptionalStackingProperties,
} from "../../../utils/propertiesHelper";
import {
    AREA_CHART_SUPPORTED_PROPERTIES,
    OPTIONAL_STACKING_PROPERTIES,
} from "../../../constants/supportedProperties";
import { VisualizationObject } from "@gooddata/typings";
import { haveManyViewItems } from "../../../utils/mdObjectHelper";

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

    public update(
        options: IVisProps,
        visualizationProperties: IVisualizationProperties,
        mdObject: VisualizationObject.IVisualizationObjectContent,
        references: IReferences,
    ): void {
        this.updateCustomSupportedProperties(mdObject);
        super.update(options, visualizationProperties, mdObject, references);
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
        newReferencePoint = configureOverTimeComparison(newReferencePoint);

        this.supportedPropertiesList = removeImmutableOptionalStackingProperties(
            newReferencePoint,
            this.getSupportedPropertiesList(),
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);
        return Promise.resolve(sanitizeUnusedFilters(newReferencePoint, clonedReferencePoint));
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

    protected renderConfigurationPanel() {
        if (document.querySelector(this.configPanelElement)) {
            render(
                <LineChartBasedConfigurationPanel
                    locale={this.locale}
                    colors={this.colors}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    mdObject={this.mdObject}
                    references={this.references}
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

    private updateCustomSupportedProperties(mdObject: VisualizationObject.IVisualizationObjectContent): void {
        if (haveManyViewItems(mdObject)) {
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
            if (!supportedPropertiesList.some(supportedProperty => supportedProperty === property)) {
                supportedPropertiesList.push(property);
            }
        });
    }

    private getAllAttributes(buckets: IBucket[]): IBucketItem[] {
        return getAllAttributeItemsWithPreference(buckets, [
            BucketNames.TREND,
            BucketNames.VIEW,
            BucketNames.SEGMENT,
            BucketNames.STACK,
        ]);
    }

    private getAllAttributesWithoutDate(buckets: IBucket[]): IBucketItem[] {
        return this.getAllAttributes(buckets).filter(negate(isDate));
    }

    private filterStackItems(bucketItems: IBucketItem[]): IBucketItem[] {
        return bucketItems.filter(negate(isDate)).slice(0, MAX_STACKS_COUNT);
    }

    private getBucketItems(referencePoint: IReferencePoint) {
        const buckets = get(referencePoint, BUCKETS, []);
        const measures = getFilteredMeasuresForStackedCharts(buckets);
        const dateItems = getDateItems(buckets);

        let stacks: IBucketItem[] = this.filterStackItems(getStackItems(buckets));
        const isAllowMoreThanOneViewByAttribute = !stacks.length && measures.length <= 1;
        const numOfAttributes = isAllowMoreThanOneViewByAttribute ? MAX_VIEW_COUNT : 1;
        let views: IBucketItem[] = getAllCategoriesAttributeItems(buckets).slice(0, numOfAttributes);
        const hasDateItemInViewByBucket = views.some(isDate);

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
