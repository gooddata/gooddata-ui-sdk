import * as React from 'react';
import { mount } from 'enzyme';
import { delay } from '../../../tests/utils';
import { Visualization, oneMeasureDataSource } from '../../../tests/mocks';
import { BaseChart, IBaseChartProps } from '../BaseChart';
import { VisualizationTypes } from '../../../../constants/visualizationTypes';

describe('BaseChart', () => {
    const createProps = (customProps = {}) => {
        const props: IBaseChartProps = {
            height: 200,
            dataSource: oneMeasureDataSource,
            locale: 'en-US',
            type: VisualizationTypes.LINE,
            visualizationComponent: Visualization,
            afterRender: jest.fn(),
            drillableItems: [],
            resultSpec: {},
            config: { colors: ['shiny'] },
            onDataTooLarge: jest.fn(),
            onFiredDrillEvent: jest.fn(),
            ...customProps
        };
        return props;
    };

    function createComponent(props: IBaseChartProps) {
        return mount(<BaseChart {...props}/>);
    }

    it('should render given visualization component', () => {
        const onLoadingChanged = jest.fn();
        const onError = jest.fn();
        const props = createProps({
            onError,
            onLoadingChanged
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            const visualization = wrapper.find(Visualization);

            expect(visualization.length).toBe(1);
            expect(visualization.props()).toMatchObject({
                executionRequest: {
                    afm: props.dataSource.getAfm(),
                    resultSpec: props.resultSpec
                },
                executionResponse: expect.any(Object),
                executionResult: expect.any(Object),
                afterRender: props.afterRender,
                drillableItems: props.drillableItems,

                height: props.height,
                config: { ...props.config, type: props.type },
                onFiredDrillEvent: props.onFiredDrillEvent,
                numericSymbols: expect.any(Object)
            });
        });
    });
});
