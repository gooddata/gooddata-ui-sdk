import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart, IChartProps } from '../base/BaseChart';
import { LineChart } from '../LineChart';
import { getComponentProps } from './helper';

describe('LineChart', () => {
    function createComponent(props: IChartProps) {
        return shallow(<LineChart {...props} />);
    }

    it('should render line chart', () => {
        const wrapper = createComponent(getComponentProps());
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
