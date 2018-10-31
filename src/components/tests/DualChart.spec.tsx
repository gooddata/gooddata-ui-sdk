// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';
import { factory } from '@gooddata/gooddata-js';

import { DualChart as AfmDualChart } from '../afm/DualChart';
import { DualChart } from '../DualChart';
import { M1, M2 } from './fixtures/buckets';

describe('DualChart', () => {
    it('should render with custom SDK', () => {
        const wrapper = shallow(
            <DualChart
                projectId="foo"
                leftAxisMeasure={M1}
                rightAxisMeasure={M2}
                sdk={factory({ domain: 'example.com' })}
            />
        );
        expect(wrapper.find(AfmDualChart)).toHaveLength(1);
    });
});
