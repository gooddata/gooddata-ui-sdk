// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';
import { factory } from '@gooddata/gooddata-js';

import { AreaChart as AfmAreaChart } from '../afm/AreaChart';
import { AreaChart } from '../AreaChart';
import { M1 } from './fixtures/buckets';

describe('AreaChart', () => {
    it('should render with custom SDK', () => {
        const wrapper = shallow(
            <AreaChart
                projectId="foo"
                measures={[M1]}
                sdk={factory({ domain: 'example.com' })}
            />
        );
        expect(wrapper.find(AfmAreaChart)).toHaveLength(1);
    });
});
