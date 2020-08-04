// (C) 2007-2020 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { isInvertedChartType } from "../../../utils/common";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function groupCategoriesWrapper(Highcharts: any): void {
    const wrap = Highcharts.wrap;

    function hideGridInXAxis() {
        if (this.labelsGrid) {
            // hide the grid (or border) that covers X axis
            this.labelsGrid.hide();
        }
    }

    wrap(Highcharts.Axis.prototype, "render", function (proceed: any) {
        // default behaviour
        // eslint-disable-next-line prefer-rest-params
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        hideGridInXAxis.call(this);
    });

    wrap(Highcharts.Tick.prototype, "getPosition", function (
        proceed: any,
        horiz: boolean,
        tickPos: number,
        tickmarkOffset: number,
        old: boolean,
    ) {
        const {
            axis: {
                categories,
                isXAxis,
                height,
                chart: {
                    options: {
                        chart: { type },
                    },
                },
            },
            parent,
        } = this;

        const hasParent = !isEmpty(parent);
        const hasOneICategory = categories.length === 1;
        const shouldAlignMiddle =
            isInvertedChartType(type) && isXAxis && hasParent && this.isNewLabel && hasOneICategory;

        // for xAxis of bar chart, must update vertical align in the middle
        // of datalabel for parent category when filtering one value
        if (shouldAlignMiddle) {
            parent.labelOffsets.y = height / 2;
        }

        const pos = proceed.call(this, horiz, tickPos, tickmarkOffset, old);
        proceed.apply(this, pos);

        return pos;
    });
}
