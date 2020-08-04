// (C) 2007-2020 GoodData Corporation
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function applyPointHaloOptions(Highcharts: any): void {
    Highcharts.wrap(Highcharts.Point.prototype, "setState", function setState(proceed: any, ...args: any[]) {
        const tmp = this.series.options.states.hover.halo;
        this.series.options.states.hover.halo = this.halo || this.series.options.states.hover.halo;

        proceed.apply(this, args);

        this.series.options.states.hover.halo = tmp;
    });
}
