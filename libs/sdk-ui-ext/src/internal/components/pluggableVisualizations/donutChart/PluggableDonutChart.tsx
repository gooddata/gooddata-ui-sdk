// (C) 2019-2025 GoodData Corporation
import { VisualizationTypes } from "@gooddata/sdk-ui";

import {
    type IExtendedReferencePoint,
    type IReferencePoint,
    type IVisConstruct,
} from "../../../interfaces/Visualization.js";
import { setDonutChartUiConfig } from "../../../utils/uiConfigHelpers/donutChartUiConfigHelper.js";
import { PluggablePieChart } from "../pieChart/PluggablePieChart.js";

/**
 * PluggableDonutChart
 *
 * ## Buckets
 *
 * | Name     | Id       | Accepts             |
 * |----------|----------|---------------------|
 * | Measures | measures | measures only       |
 * | ViewBy   | view     | attribute or date   |
 *
 * ### Bucket axioms
 *
 * - |ViewBy| ≤ 1
 * - |Measures| ≥ 1 ∧ ≤ 20
 * - |ViewBy| = 1 ⇒ |Measures| = 1
 * - |ViewBy| = 0 ⇒ |Measures| ≥ 1
 *
 * ## Dimensions
 *
 * The PluggableDonutChart always creates two dimensional execution.
 *
 * With measures only:
 * - [[], [MeasureGroupIdentifier]]
 * With viewBy:
 * - [[MeasureGroupIdentifier], [ViewBy]]
 *
 * ## Default sorts
 *
 * When Pie Chart is used with measures only, it's sorted by their order by default.
 * When Pie Chart chart is used with viewBy attribute or date, it's sorted by the values of the measure by default.
 *
 * Default sort behavior can be overriden by sortBy option.
 *
 */
export class PluggableDonutChart extends PluggablePieChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.DONUT;
    }

    public override getExtendedReferencePoint(
        referencePoint: IReferencePoint,
    ): Promise<IExtendedReferencePoint> {
        return super.getExtendedReferencePoint(referencePoint).then(setDonutChartUiConfig);
    }
}
