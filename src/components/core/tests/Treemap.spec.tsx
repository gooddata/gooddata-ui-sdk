// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart, IChartProps } from '../base/BaseChart';
import { Treemap } from '../Treemap';
import { getComponentProps } from './helper';

describe('Treemap', () => {
    function createComponent(props: IChartProps) {
        return shallow(<Treemap {...props} />);
    }

    it('should render Treemap', () => {
        const wrapper = createComponent(getComponentProps());
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
