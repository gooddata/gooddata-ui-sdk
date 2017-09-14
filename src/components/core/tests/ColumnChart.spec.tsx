import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart, IChartProps } from '../base/BaseChart';
import { ColumnChart } from '../ColumnChart';
import { getComponentProps } from './helper';
import { VisualizationTypes } from '../../../constants/visualizationTypes';

describe('ColumnChart', () => {
    function createComponent(props: IChartProps) {
        return shallow(<ColumnChart {...props} />);
    }

    it('should render column chart', () => {
        const wrapper = createComponent(getComponentProps(VisualizationTypes.COLUMN));
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
