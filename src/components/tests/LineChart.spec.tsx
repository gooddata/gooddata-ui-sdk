import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart } from '../base/BaseChart';
import { LineChart } from '../LineChart';

describe('LineChart', () => {
    function createComponent(props) {
        return shallow(<LineChart {...props} />);
    }

    it('should render line chart', () => {
        const wrapper = createComponent({
            dataSource: {},
            metadataSource: {}
        });

        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
