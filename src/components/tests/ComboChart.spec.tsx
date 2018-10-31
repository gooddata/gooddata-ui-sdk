// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';
import { factory } from '@gooddata/gooddata-js';

import { ComboChart as AfmComboChart } from '../afm/ComboChart';
import { ComboChart } from '../ComboChart';
import { M1 } from './fixtures/buckets';

describe('ComboChart', () => {
    it('should render with custom SDK', () => {
        const wrapper = shallow(
            <ComboChart
                projectId="foo"
                columnMeasures={[M1]}
                sdk={factory({ domain: 'example.com' })}
            />
        );
        expect(wrapper.find(AfmComboChart)).toHaveLength(1);
    });
});
