// (C) 2019 GoodData Corporation
import React = require("react");
import { render } from "react-dom";
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import tail = require("lodash/tail");
import isEmpty = require("lodash/isEmpty");

import * as BucketNames from "../../../../constants/bucketNames";
import { IReferencePoint, IExtendedReferencePoint, IVisConstruct } from "../../../interfaces/Visualization";
import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import TreeMapConfigurationPanel from "../../configurationPanels/TreeMapConfigurationPanel";
import { BUCKETS } from "../../../constants/bucket";
import { TREEMAP_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";

import {
    DEFAULT_TREEMAP_UICONFIG,
    TREEMAP_UICONFIG_WITH_MULTIPLE_MEASURES,
    TREEMAP_UICONFIG_WITH_ONE_MEASURE,
    UICONFIG,
} from "../../../constants/uiConfig";

import {
    sanitizeUnusedFilters,
    getMeasureItems,
    removeAllDerivedMeasures,
    removeAllArithmeticMeasuresFromDerived,
    getStackItems,
    getAttributeItemsWithoutStacks,
    isDate,
    limitNumberOfMeasuresInBuckets,
} from "../../../utils/bucketHelper";

import { setTreemapUiConfig } from "../../../utils/uiConfigHelpers/treemapUiConfigHelper";
import { removeSort } from "../../../utils/sort";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";

export class PluggableTreemap extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.TREEMAP;
        this.supportedPropertiesList = TREEMAP_SUPPORTED_PROPERTIES;
        this.initializeProperties(props.visualizationProperties);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: cloneDeep(DEFAULT_TREEMAP_UICONFIG),
        };

        newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
        newReferencePoint = removeAllDerivedMeasures(newReferencePoint);

        const buckets = get(clonedReferencePoint, BUCKETS, []);

        let measures = getMeasureItems(buckets);

        let stacks = getStackItems(buckets);
        const nonStackAttributes = getAttributeItemsWithoutStacks(buckets);
        const view = nonStackAttributes.slice(0, 1);

        if (nonStackAttributes.length > 0) {
            set(newReferencePoint, UICONFIG, cloneDeep(TREEMAP_UICONFIG_WITH_ONE_MEASURE));
            measures = getMeasureItems(limitNumberOfMeasuresInBuckets(buckets, 1));
        } else if (measures.length > 1) {
            set(newReferencePoint, UICONFIG, cloneDeep(TREEMAP_UICONFIG_WITH_MULTIPLE_MEASURES));
        }
        if (nonStackAttributes.length > 1 && isEmpty(stacks)) {
            // first attribute is taken, find next available non-date attribute
            const attributesWithoutFirst = tail(nonStackAttributes);
            const nonDate = attributesWithoutFirst.filter(attribute => !isDate(attribute));
            stacks = nonDate.slice(0, 1);
        }

        set(newReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: measures,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: view,
            },
            {
                localIdentifier: BucketNames.SEGMENT,
                items: stacks,
            },
        ]);

        newReferencePoint = setTreemapUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(newReferencePoint);
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeUnusedFilters(newReferencePoint, clonedReferencePoint));
    }

    protected renderConfigurationPanel() {
        if (document.querySelector(this.configPanelElement)) {
            render(
                <TreeMapConfigurationPanel
                    locale={this.locale}
                    references={this.references}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    mdObject={this.mdObject}
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
}
