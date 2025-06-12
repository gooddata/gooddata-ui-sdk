// (C) 2007-2020 GoodData Corporation

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
}
