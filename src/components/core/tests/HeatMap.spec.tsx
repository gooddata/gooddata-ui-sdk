
import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart, IChartProps } from '../base/BaseChart';
import { HeatMap } from '../HeatMap';
import { getComponentProps } from './helper';

describe('HeatMap', () => {
    function createComponent(props: IChartProps) {
        return shallow(<HeatMap {...props} />);
    }

    it('should render heat chart', () => {
        const wrapper = createComponent(getComponentProps());
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
