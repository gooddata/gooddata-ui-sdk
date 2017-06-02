import * as React from 'react';
import { shallow } from 'enzyme';
import { Afm } from '@gooddata/data-layer';

import { BaseChart } from '../base/BaseChart';
import { PieChart } from '../PieChart';

describe('PieChart', () => {
    function createComponent(props) {
        return shallow(<PieChart {...props} />);
    }

    it('should render pie chart', () => {
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
