// (C) 2019-2022 GoodData Corporation
import {
    BucketNames,
    IDrillEvent,
    isDrillIntersectionAttributeItem,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import React from "react";
import { render } from "react-dom";

import { ATTRIBUTE, BUCKETS, DATE } from "../../../constants/bucket";
import { HEATMAP_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";
import { DEFAULT_HEATMAP_UICONFIG } from "../../../constants/uiConfig";
import {
    IDrillDownContext,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IDrillDownDefinition,
} from "../../../interfaces/Visualization";
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
import cloneDeep from "lodash/cloneDeep";
import includes from "lodash/includes";
import set from "lodash/set";
import tail from "lodash/tail";
import { IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import { drillDownFromAttributeLocalId } from "../../../utils/ImplicitDrillDownHelper";
import { addIntersectionFiltersToInsight, modifyBucketsAttributesForDrillDown } from "../drillDownUtil";

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
 * ## Default sorts
 *
 * - |Rows| ≥ 1 ⇒ [attributeAreaSort(Rows[0])]
 * - |Rows| = 0 ⇒ []
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
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    private addFilters(source: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const clicked = drillDownFromAttributeLocalId(drillConfig);
        const cutIntersection = (event.drillContext.intersection || []).filter(
            (i) =>
                isDrillIntersectionAttributeItem(i.header) &&
                i.header.attributeHeader.localIdentifier === clicked,
        );
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }

    public getInsightWithDrillDownApplied(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFilters(source, drillDownContext.drillDefinition, drillDownContext.event);
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    protected renderConfigurationPanel(insight: IInsightDefinition): React.ReactNode {
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
        return null;
    }
}
