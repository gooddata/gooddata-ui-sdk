// (C) 2023 GoodData Corporation
import { VisualizationTypes } from "@gooddata/sdk-ui";
import {
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
} from "../../../interfaces/Visualization.js";
import { PluggableSankeyChart } from "../sankeyChart/PluggableSankeyChart.js";
import { configDependencyWheelUiConfig } from "../../../utils/uiConfigHelpers/dependencyWheelChartUiConfigHelper.js";

/**
 * PluggableDependencyWheelChart
 *
 * ## Buckets
 *
 * | Name              | Id             | Accepts             |
 * |-------------------|----------------|---------------------|
 * | Measure           | measure        | measures only       |
 * | Attribute ( From )| attribute_from | attribute or date |
 * | Attribute ( To )  | attribute_to   | attribute or date |
 *
 * ### Bucket axioms
 *
 * - |Measure           | = 1
 * - |Attribute ( From )| ≤ 1
 * - |Attribute ( To )  | ≤ 1
 *
 * ## Dimensions
 *
 * The PluggableDependencyWheelChart always creates the same two dimensional execution.
 *
 * - ⊤ ⇒ [[MeasureGroupIdentifier], compact([attributeFrom, attributeTo])]
 *
 * ## Sorts
 *
 * The PluggableDependencyWheelChart does not use any sorts.
 */
export class PluggableDependencyWheelChart extends PluggableSankeyChart {
    constructor(params: IVisConstruct) {
        super(params);
        this.type = VisualizationTypes.DEPENDENCY_WHEEL;
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        return super.getExtendedReferencePoint(referencePoint).then(configDependencyWheelUiConfig);
    }
}
