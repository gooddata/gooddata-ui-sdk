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
            dataSource: {
                getData: () => Promise.resolve({}),
                getAfm: () => ({}),
                getFingerprint: () => '{}'
            },
            metadataSource: {
                getVisualizationMetadata: () => Promise.resolve({})
            }
        });

        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
