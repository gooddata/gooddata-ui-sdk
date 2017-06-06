import * as React from 'react';
import { shallow } from 'enzyme';
import { Afm } from '@gooddata/data-layer';

import { BaseChart } from '../base/BaseChart';
import { LineChart } from '../LineChart';

describe('LineChart', () => {
    function createComponent(props) {
        return shallow(<LineChart {...props} />);
    }

    it('should render line chart', () => {
        const afm: Afm.IAfm = {
            measures: [
                {
                    id: '1',
                    definition: {
                        baseObject: {
                            id: '/gd/md/m1'
                        }
                    }
                }
            ]
        };
        const wrapper = createComponent({
            projectId: 'myprojectid',
            afm
        });

        expect(wrapper.find(BaseChart).length).toBe(1);
    });
});
