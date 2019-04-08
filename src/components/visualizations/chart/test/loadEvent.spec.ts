// (C) 2007-2018 GoodData Corporation
import handleChartLoad from '../events/load';

const buildChart = (
    axisGroupAddClass: () => {},
    labelGroupAddClass: () => {},
    isDualAxisChart: boolean,
    opposite: boolean
) => {
    const getAxis = (opposite: boolean) => ({
        axisGroup: {
            addClass: axisGroupAddClass
        },
        labelGroup: {
            addClass: labelGroupAddClass
        },
        opposite
    });

    const yAxis = [
        getAxis(opposite)
    ];

    if (isDualAxisChart) {
        yAxis.push(getAxis(true));
    }

    return { yAxis };
};

const executeTest = (isDualAxisChart: boolean, opposite = false) => {
    const axisGroupAddClass = jest.fn();
    const labelGroupAddClass = jest.fn();

    const chart = buildChart(axisGroupAddClass, labelGroupAddClass, isDualAxisChart, opposite);

    const boundHandleChartLoad = handleChartLoad.bind(chart);
    boundHandleChartLoad();

    return {
        axisGroupAddClass,
        labelGroupAddClass
    };
};

describe('handleChartLoad()', () => {
    // tslint:disable-next-line:max-line-length
    it('should call addClass() axis methods with classname saying it\'s primary axis if \'opposite\' property is falsy', () => {
        const { axisGroupAddClass, labelGroupAddClass } = executeTest(false, false);

        expect(axisGroupAddClass).toBeCalledWith('s-highcharts-primary-yaxis');
        expect(labelGroupAddClass).toBeCalledWith('s-highcharts-primary-yaxis-labels');
    });

    // tslint:disable-next-line:max-line-length
    it('should call addClass() axis methods with classname saying it\'s secondary axis if \'opposite\' property is truthy', () => {
        const { axisGroupAddClass, labelGroupAddClass } = executeTest(false, true);

        expect(axisGroupAddClass).toBeCalledWith('s-highcharts-secondary-yaxis');
        expect(labelGroupAddClass).toBeCalledWith('s-highcharts-secondary-yaxis-labels');
    });

    it('should call addClass() axis methods with classname on dual axes chart', () => {
        const { axisGroupAddClass, labelGroupAddClass } = executeTest(true);

        expect(axisGroupAddClass).toHaveBeenCalledTimes(2);
        expect(axisGroupAddClass).toHaveBeenNthCalledWith(1, 's-highcharts-primary-yaxis'); // assume 1st time
        expect(axisGroupAddClass).toHaveBeenNthCalledWith(2, 's-highcharts-secondary-yaxis');

        expect(labelGroupAddClass).toHaveBeenCalledTimes(2);
        expect(labelGroupAddClass).toHaveBeenNthCalledWith(1, 's-highcharts-primary-yaxis-labels'); // assume 1st time
        expect(labelGroupAddClass).toHaveBeenNthCalledWith(2, 's-highcharts-secondary-yaxis-labels');
    });
});
