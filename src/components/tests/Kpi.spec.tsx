jest.mock('gooddata');

import * as React from 'react';
import { mount } from 'enzyme';

import { Kpi, IKpiProps } from '../Kpi';

describe('Kpi', () => {
    function createComponent(props: IKpiProps) {
        return mount(<Kpi {...props} />);
    }

    it('should format kpi result', (done) => {
        const onLoadingChanged = jest.fn();
        const wrapper = createComponent({
            projectId: 'myprojectid',
            measure: '/gdc/md/myprojectid/obj/123',
            format: '$0,0.00',
            onLoadingChanged
        });

        expect(onLoadingChanged.mock.calls[0]).toEqual([{ isLoading: true }]);
        setTimeout(() => {
            try {
                expect(onLoadingChanged.mock.calls[1]).toEqual([{ isLoading: false }]);
                expect(wrapper.find('.gdc-kpi').text()).toEqual('$32,016.00');
                done();
            } catch (error) {
                console.error(error);
            }
        }, 1);
    });
});
