// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';

import { ColumnChart } from '../ColumnChart';
import { BaseChart } from '../base/BaseChart';
import { emptyDataSource } from '../../tests/mocks';

describe('ColumnChart', () => {
    it('should render BaseChart', () => {
        const wrapper = shallow(<ColumnChart dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
