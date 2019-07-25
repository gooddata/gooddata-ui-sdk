// (C) 2019 GoodData Corporation
import * as React from "react";
import { render } from "react-dom";
import cloneDeep = require("lodash/cloneDeep");
import get = require("lodash/get");
import set = require("lodash/set");
import without = require("lodash/without");
import * as BucketNames from "../../../../constants/bucketNames";
import { configurePercent, configureOverTimeComparison } from "../../../utils/bucketConfig";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import {
    IReferencePoint,
    IExtendedReferencePoint,
    IVisConstruct,
    IBucketItem,
    IVisualizationProperties,
} from "../../../interfaces/Visualization";

import { METRIC, BUCKETS } from "../../../constants/bucket";

import {
    sanitizeUnusedFilters,
    getAllItemsByType,
    getBucketItemsByType,
    getAllAttributeItemsWithPreference,
    getBucketItemsWithExcludeByType,
    applyUiConfig,
    hasBucket,
    getFirstMasterWithDerived,
} from "../../../utils/bucketHelper";

import { setComboChartUiConfigDeprecated } from "../../../utils/uiConfigHelpers/comboChartUiConfigHelperDeprecated";
import { removeSort } from "../../../utils/sort";
import UnsupportedConfigurationPanel from "../../configurationPanels/UnsupportedConfigurationPanel";
import { COMBO_CHART_UICONFIG_DEPRECATED } from "../../../constants/uiConfig";
import { VisualizationTypes } from "../../../../constants/visualizationTypes";

export class PluggableComboChartDeprecated extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.COMBO;

        this.supportedPropertiesList = [];
        this.initializeProperties(props.visualizationProperties);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: cloneDeep(COMBO_CHART_UICONFIG_DEPRECATED),
        };

        const buckets = get(clonedReferencePoint, BUCKETS, []);

        const attributes = getAllAttributeItemsWithPreference(buckets, [
            BucketNames.TREND,
            BucketNames.VIEW,
        ]).slice(0, 1);

        let measures: IBucketItem[] = [];
        let secondaryMeasures: IBucketItem[] = [];

        // ref. point has both my buckets -> reuse them fully
        if (hasBucket(buckets, BucketNames.MEASURES) && hasBucket(buckets, BucketNames.SECONDARY_MEASURES)) {
            measures = getBucketItemsByType(buckets, BucketNames.MEASURES, [METRIC]);
            secondaryMeasures = getBucketItemsByType(buckets, BucketNames.SECONDARY_MEASURES, [METRIC]);
            const restMeasures = getBucketItemsWithExcludeByType(
                buckets,
                [BucketNames.MEASURES, BucketNames.SECONDARY_MEASURES],
                [METRIC],
            );
            secondaryMeasures = secondaryMeasures.concat(restMeasures);
        } else {
            // take all measures, first and its derived to primary, rest to secondary
            const allMeasures = getAllItemsByType(buckets, [METRIC]);
            measures = getFirstMasterWithDerived(allMeasures);
            secondaryMeasures = without(allMeasures, ...measures);
        }

        set(newReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: measures,
            },
            {
                localIdentifier: BucketNames.SECONDARY_MEASURES,
                items: secondaryMeasures,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: attributes,
            },
        ]);

        newReferencePoint = setComboChartUiConfigDeprecated(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(newReferencePoint);
        newReferencePoint = applyUiConfig(newReferencePoint);
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeUnusedFilters(newReferencePoint, clonedReferencePoint));
    }

    protected renderConfigurationPanel() {
        if (document.querySelector(this.configPanelElement)) {
            const properties: IVisualizationProperties = get(
                this.visualizationProperties,
                "properties",
                {},
            ) as IVisualizationProperties;

            render(
                <UnsupportedConfigurationPanel
                    locale={this.locale}
                    pushData={this.callbacks.pushData}
                    properties={properties}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }
}
