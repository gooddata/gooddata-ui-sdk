// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';

import { ComboChart } from '../ComboChart';
import { BaseChart } from '../base/BaseChart';
import { emptyDataSource } from '../../tests/mocks';

describe('ComboChart', () => {
    it('should render BaseChart', () => {
        const wrapper = shallow(<ComboChart dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
