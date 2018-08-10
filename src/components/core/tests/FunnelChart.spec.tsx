// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';

import { FunnelChart } from '../FunnelChart';
import { BaseChart } from '../base/BaseChart';
import { emptyDataSource } from '../../tests/mocks';

describe('FunnelChart', () => {
    it('should render BaseChart', () => {
        const wrapper = shallow(<FunnelChart dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
