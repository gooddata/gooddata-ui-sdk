// (C) 2007-2018 GoodData Corporation
export function linearTickPositions(Highcharts: any) {
    const wrap = Highcharts.wrap;
    const YAXIS = 'yAxis';
    const HEATMAP = 'heatmap';

    wrap(Highcharts.Axis.prototype, 'getLinearTickPositions', function(proceed: Function) {
        const args = Array.prototype.slice.call(arguments);
        args.shift();
        const { categories, coll, chart: { options: { chart: type } } } = this;
        const isYAxis = coll === YAXIS;
        const isHeatmap = type === HEATMAP;
        const tickPositions = proceed.apply(this, args);
        const noTicks = tickPositions.length;
        const lastIndex = noTicks > 0 ? tickPositions[noTicks - 1] : 0;

        // on Yaxis of heatmap, if lastIndex is out of category indcies
        // remove the last tick to remove the empty space on top of heatmap
        if (isHeatmap && isYAxis && categories && lastIndex >= categories.length) {
            tickPositions.pop();
        }
        return tickPositions;
    });
}
