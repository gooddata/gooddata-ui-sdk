// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart, IChartProps } from '../base/BaseChart';
import { ComboChart } from '../ComboChart';
import { getComponentProps } from './helper';

describe('ComboChart', () => {
    function createComponent(props: IChartProps) {
        return shallow(<ComboChart {...props} />);
    }

    it('should render Combo chart', () => {
        const wrapper = createComponent(getComponentProps());
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
