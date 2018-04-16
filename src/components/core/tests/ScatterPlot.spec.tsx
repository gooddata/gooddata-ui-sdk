// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart, IChartProps } from '../base/BaseChart';
import { ScatterPlot } from '../ScatterPlot';
import { getComponentProps } from './helper';

describe('ScatterPlot', () => {
    function createComponent(props: IChartProps) {
        return shallow(<ScatterPlot {...props} />);
    }

    it('should render scatter plot', () => {
        const wrapper = createComponent(getComponentProps());
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
