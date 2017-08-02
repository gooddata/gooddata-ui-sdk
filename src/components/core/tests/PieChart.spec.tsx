import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart } from '../base/BaseChart';
import { PieChart } from '../PieChart';

describe('PieChart', () => {
    function createComponent(props) {
        return shallow(<PieChart {...props} />);
    }

    it('should render pie chart', () => {
        const wrapper = createComponent({
            dataSource: {
                getData: () => Promise.resolve({}),
                getAfm: () => ({}),
                getFingerprint: () => '{}'
            },
            metadataSource: {
                getVisualizationMetadata: () => Promise.resolve({}),
                getFingerprint: () => '{}'
            }
        });

        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
