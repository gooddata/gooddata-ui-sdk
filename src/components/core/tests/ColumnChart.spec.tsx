import * as React from 'react';
import { shallow } from 'enzyme';

import { BaseChart } from '../base/BaseChart';
import { ColumnChart } from '../ColumnChart';

describe('ColumnChart', () => {
    function createComponent(props) {
        return shallow(<ColumnChart {...props} />);
    }

    it('should render column chart', () => {
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
