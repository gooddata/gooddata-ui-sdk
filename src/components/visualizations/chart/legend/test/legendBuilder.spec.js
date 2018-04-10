// (C) 2007-2018 GoodData Corporation
import { generateChartOptions } from '../../test/chartOptionsBuilder.spec';
import * as fixtures from '../../../stories/test_data/fixtures';
import getLegend, {
    shouldLegendBeEnabled,
    getLegendItems,
    DEFAULT_LEGEND_CONFIG
} from '../legendBuilder';

describe('shouldLegendBeEnabled', () => {
    it('should return false by default', () => {
        const chartOptions = generateChartOptions(fixtures.barChartWithViewByAttribute);
        expect(shouldLegendBeEnabled(chartOptions)).toBe(false);
    });

    it('should return true if chart has more than one series', () => {
        const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it('should return true if pie chart has more than one value', () => {
        const chartOptions = generateChartOptions(fixtures.pieChartWithMetricsOnly, { type: 'pie' });
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });

    it('should return true if the chart is stacked and has only one stack item', () => {
        const chartOptions = generateChartOptions(fixtures.barChartWithStackByAndOnlyOneStack, { type: 'bar' });
        expect(shouldLegendBeEnabled(chartOptions)).toBe(true);
    });
});

describe('getLegendItems', () => {
    it('should return correct legend items for regular charts', () => {
        const chartOptions = generateChartOptions(fixtures.barChartWithStackByAndViewByAttributes);
        expect(getLegendItems(chartOptions)).toEqual([
            {
                color: 'rgb(20,178,226)',
                legendIndex: 0,
                name: 'East Coast'
            },
            {
                color: 'rgb(0,193,141)',
                legendIndex: 1,
                name: 'West Coast'
            }
        ]);
    });

    it('should return correct legend items for pie charts', () => {
        const chartOptions = generateChartOptions(fixtures.pieChartWithMetricsOnly, { type: 'pie' });
        expect(getLegendItems(chartOptions)).toEqual([
            {
                color: 'rgb(20,178,226)',
                legendIndex: 0,
                name: 'Won'
            },
            {
                color: 'rgb(0,193,141)',
                legendIndex: 1,
                name: 'Lost'
            },
            {
                color: 'rgb(229,77,66)',
                legendIndex: 2,
                name: 'Expected'
            }
        ]);
    });
});

describe('getLegend', () => {
    const chartOptions = generateChartOptions(fixtures.barChartWith3MetricsAndViewByAttribute);
    const legend = getLegend({}, chartOptions);

    it('should assign enabled: false if disabled by config', () => {
        const disabledLegend = getLegend({ enabled: false }, chartOptions);
        expect(disabledLegend.enabled).toBe(false);
    });

    it('should assign enabled: true for multi metric graph', () => {
        expect(legend.enabled).toBe(true);
    });

    it('should assign default position', () => {
        expect(legend.position).toBe(DEFAULT_LEGEND_CONFIG.position);
    });

    it('should be able to override default position', () => {
        const legendWithCustomPosition = getLegend({ position: 'left' }, chartOptions);
        expect(legendWithCustomPosition.position).toBe('left');
    });

    it('should assign items', () => {
        const legendItems = getLegendItems(chartOptions);
        expect(legend.items).toEqual(legendItems);
    });
});
