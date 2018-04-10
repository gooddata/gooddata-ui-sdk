// (C) 2007-2018 GoodData Corporation
import { getCustomizedConfiguration } from '../customConfiguration';
import { VisualizationTypes } from '../../../../../constants/visualizationTypes';

const chartOptions = {
    type: VisualizationTypes.LINE,
    data: {
        series: [
            {
                color: 'rgb(0, 0, 0)',
                name: '<b>aaa</b>',
                data: [
                    {
                        name: '<b>bbb</b>'
                    },
                    null
                ]
            }
        ]
    }
};

describe('getCustomizedConfiguration', () => {
    it('should escape series names', () => {
        const result = getCustomizedConfiguration(chartOptions);
        expect(result.series[0].name).toEqual('&lt;b&gt;aaa&lt;/b&gt;');
    });

    it('should escape data items in series', () => {
        const result = getCustomizedConfiguration(chartOptions);
        expect(result.series[0].data[0].name).toEqual('&lt;b&gt;bbb&lt;/b&gt;');
    });
});
