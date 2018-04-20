// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart, IChartProps } from '../base/BaseChart';
import { FunnelChart } from '../FunnelChart';
import { getComponentProps } from './helper';

describe('FunnelChart', () => {
    function createComponent(props: IChartProps) {
        return shallow(<FunnelChart {...props} />);
    }

    it('should render funnel chart', () => {
        const wrapper = createComponent(getComponentProps());
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
