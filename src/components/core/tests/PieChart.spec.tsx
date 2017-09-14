import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart, IChartProps } from '../base/BaseChart';
import { PieChart } from '../PieChart';
import { getComponentProps } from './helper';
import { VisualizationTypes } from '../../../constants/visualizationTypes';

describe('PieChart', () => {
    function createComponent(props: IChartProps) {
        return shallow(<PieChart {...props} />);
    }

    it('should render pie chart', () => {
        const wrapper = createComponent(getComponentProps(VisualizationTypes.PIE));
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
