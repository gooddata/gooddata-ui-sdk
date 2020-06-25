// (C) 2019 GoodData Corporation
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";
import * as React from "react";
import { render } from "react-dom";

import { ATTRIBUTE, BUCKETS, DATE } from "../../../constants/bucket";
import { HEATMAP_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { DEFAULT_HEATMAP_UICONFIG } from "../../../constants/uiConfig";
import { IExtendedReferencePoint, IReferencePoint, IVisConstruct } from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    getAllAttributeItemsWithPreference,
    getMeasureItems,
    getPreferredBucketItems,
    limitNumberOfMeasuresInBuckets,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { removeSort } from "../../../utils/sort";

import { setHeatmapUiConfig } from "../../../utils/uiConfigHelpers/heatmapUiConfigHelper";
import HeatMapConfigurationPanel from "../../configurationPanels/HeatMapConfigurationPanel";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import cloneDeep = require("lodash/cloneDeep");
import includes = require("lodash/includes");
import set = require("lodash/set");
import tail = require("lodash/tail");
import { IInsightDefinition } from "@gooddata/sdk-model";

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
            !!this.featureFlags.enableWeekFilters,
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    protected renderConfigurationPanel(insight: IInsightDefinition) {
        if (document.querySelector(this.configPanelElement)) {
            render(
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
                document.querySelector(this.configPanelElement),
            );
        }
    }
}
