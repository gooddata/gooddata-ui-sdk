import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart, IChartProps } from '../base/BaseChart';
import { LineChart } from '../LineChart';
import { getComponentProps } from './helper';
import { VisualizationTypes } from '../../../constants/visualizationTypes';

describe('LineChart', () => {
    function createComponent(props: IChartProps) {
        return shallow(<LineChart {...props} />);
    }

    it('should render line chart', () => {
        const wrapper = createComponent(getComponentProps(VisualizationTypes.LINE));
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
