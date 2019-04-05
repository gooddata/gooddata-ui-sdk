// (C) 2007-2018 GoodData Corporation
export function applyPointHaloOptions(Highcharts: any) {
    Highcharts.wrap(Highcharts.Point.prototype, "setState", function setState(proceed: any, ...args: any[]) {
        const tmp = this.series.options.states.hover.halo;
        this.series.options.states.hover.halo = this.halo || this.series.options.states.hover.halo;

        proceed.apply(this, args);

        this.series.options.states.hover.halo = tmp;
    });
}
