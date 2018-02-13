import * as React from 'react';
import { mount } from 'enzyme';
import { AttributeFilter } from '../AttributeFilter';
import { createMetadataMock } from './utils';

describe('AttributeFilter', () => {
    function renderComponent(customProps = {}) {
        const props = {
            projectId: 'storybook',
            onApply: () => ({}),
            sdk: {
                md: createMetadataMock()
            },
            ...customProps
        };
        return mount(<AttributeFilter {...props as any} />);
    }

    it('should render loading button after mount', () => {
        const wrapper = renderComponent({ uri: '/gdc/md/projectId/obj/123' });
        expect(wrapper.find('.s-button-loading')).toHaveLength(1);
    });
});
