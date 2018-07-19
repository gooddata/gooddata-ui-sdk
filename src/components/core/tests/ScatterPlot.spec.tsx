// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';

import { ScatterPlot } from '../ScatterPlot';
import { BaseChart } from '../base/BaseChart';
import { emptyDataSource } from '../../tests/mocks';

describe('ScatterPlot', () => {
    it('should render BaseChart', () => {
        const wrapper = shallow(<ScatterPlot dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
