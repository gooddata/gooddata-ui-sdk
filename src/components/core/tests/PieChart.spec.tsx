import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart, IChartProps } from '../base/BaseChart';
import { PieChart } from '../PieChart';
import { getComponentProps } from './helper';

describe('PieChart', () => {
    function createComponent(props: IChartProps) {
        return shallow(<PieChart {...props} />);
    }

    it('should render pie chart', () => {
        const wrapper = createComponent(getComponentProps());
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
