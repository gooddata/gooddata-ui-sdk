import * as React from 'react';
import { shallow } from 'enzyme';

import { BarChart } from '../BarChart';
import { BaseChart } from '../base/BaseChart';

describe('BarChart', () => {
    function createComponent(props) {
        return shallow(<BarChart {...props} />);
    }

    it('should render bar chart', () => {
        const wrapper = createComponent({
            dataSource: {},
            metadataSource: {}
        });

        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
