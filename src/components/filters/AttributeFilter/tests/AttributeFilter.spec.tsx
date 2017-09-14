import * as React from 'react';
import { mount } from 'enzyme';
import { AttributeFilter } from '../AttributeFilter';
import { createMetadataMock } from './utils';

describe('AttributeFilter', () => {
    function renderComponent(props: any = {}) {
        const {
            projectId = 'storybook',
            onApply = (f: Function) => f,
            metadata = createMetadataMock()
        } = props;
        return mount(<AttributeFilter {...{ ...props, projectId, onApply, metadata }} />);
    }

    it('should render loading button after mount', () => {
        const wrapper = renderComponent({ uri: '/gdc/md/projectId/obj/123' });
        expect(wrapper.find('.s-button-loading')).toHaveLength(1);
    });
});
