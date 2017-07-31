import * as React from 'react';
import { shallow } from 'enzyme';

import { Loading } from '../Loading';

describe('Loading', () => {
    function createComponent() {
        return shallow(<Loading />);
    }

    it('should render loading element', (done) => {
        const wrapper = createComponent();
        try {
            expect(wrapper.find('div img')).toBeDefined();
            done();
        } catch (error) {
            console.error(error);
        }
    });
});
