// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';

import { PieChart } from '../PieChart';
import { BaseChart } from '../base/BaseChart';
import { emptyDataSource } from '../../tests/mocks';

describe('PieChart', () => {
    it('should render BaseChart', () => {
        const wrapper = shallow(<PieChart dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
