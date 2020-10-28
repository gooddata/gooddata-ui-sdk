// (C) 2007-2020 GoodData Corporation

/**
 * TODO: this is a workaround function to display the data label in Highcharts when zooming the charts or resizing the browsers.
 * It should be remove when we upgrade new version of Highcharts.
 */
export function customAfterDrawDataLabels(Highcharts: any): void {
    Highcharts.addEvent(Highcharts.Series, "afterDrawDataLabels", (e: any) => {
        const points = e.target.points;
        points.forEach((point: any) => {
            if (!point && !point.dataLabels) {
                return;
            }
            point.dataLabels.forEach((label: any) => {
                label.hide = () => {
                    label.placed = false;
                };
            });
        });
    });
}
