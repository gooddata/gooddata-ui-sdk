import * as React from 'react';
import { shallow } from 'enzyme';

import { BarChart } from '../BarChart';
import { BaseChart, IChartProps } from '../base/BaseChart';
import { getComponentProps } from './helper';

describe('BarChart', () => {
    function createComponent(props: IChartProps) {
        return shallow(<BarChart {...props} />);
    }

    it('should render bar chart', () => {
        const wrapper = createComponent(getComponentProps());

        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
