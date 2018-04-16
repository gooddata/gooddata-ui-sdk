// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart, IChartProps } from '../base/BaseChart';
import { DonutChart } from '../DonutChart';
import { getComponentProps } from './helper';

describe('DonutChart', () => {
    function createComponent(props: IChartProps) {
        return shallow(<DonutChart {...props} />);
    }

    it('should render donut chart', () => {
        const wrapper = createComponent(getComponentProps());
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
