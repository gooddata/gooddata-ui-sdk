import * as React from 'react';
import { shallow } from 'enzyme';
import { Afm } from '@gooddata/data-layer';

import { BarChart } from '../BarChart';
import { BaseChart } from '../base/BaseChart';

describe('BarChart', () => {
    function createComponent(props) {
        return shallow(<BarChart {...props} />);
    }

    it('should render bar chart', () => {
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
