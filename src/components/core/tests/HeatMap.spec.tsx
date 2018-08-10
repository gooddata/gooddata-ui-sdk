
import * as React from 'react';
import { shallow } from 'enzyme';

import { HeatMap } from '../HeatMap';
import { BaseChart } from '../base/BaseChart';
import { emptyDataSource } from '../../tests/mocks';

describe('HeatMap', () => {
    it('should render BaseChart', () => {
        const wrapper = shallow(<HeatMap dataSource={emptyDataSource} />);
        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
