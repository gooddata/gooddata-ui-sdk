import * as React from 'react';
import { mount } from 'enzyme';

import { Kpi, IKpiProps } from '../Kpi';
import { delay } from '../../tests/utils';
import { oneMeasureResponse } from '../../../execution/fixtures/ExecuteAfm.fixtures';

class DummyExecute extends React.Component<any, null> {
    public render() {
        return this.props.children({ result: oneMeasureResponse });
    }
}

describe('Kpi', () => {
    function createComponent(props: IKpiProps) {
        return mount(<Kpi {...props} />);
    }

    it('should format kpi result', () => {
        const wrapper = createComponent({
            projectId: 'myprojectid',
            measure: '/gdc/md/myprojectid/obj/123',
            format: '$0,0.00',
            ExecuteComponent: DummyExecute
        });

        return delay().then(() => {
            expect(wrapper.find('.gdc-kpi').text()).toEqual('$42,470,571.16');
        });
    });
});
