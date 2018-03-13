import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart, IChartProps } from '../base/BaseChart';
import { AreaChart } from '../AreaChart';
import { getComponentProps } from './helper';

describe('AreaChart', () => {
    function createComponent(props: IChartProps) {
        return shallow(<AreaChart {...props} />);
    }

    it('should render area chart', () => {
        const wrapper = createComponent(getComponentProps());
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
