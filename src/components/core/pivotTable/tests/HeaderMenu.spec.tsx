// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';

import HeaderMenu from '../HeaderMenu';

describe('HeaderMenu renderer', () => {
    it('should render hidden menu', () => {
        const component = shallow((
            <HeaderMenu
                isVisible={false}
                isOpen={false}
            />
        ));
        expect(component.hasClass('gd-pivot-table-header-menu--hide')).toEqual(true);
        expect(component.hasClass('gd-pivot-table-header-menu--show')).toEqual(false);
    });

    it('should render visible menu', () => {
        const component = shallow((
            <HeaderMenu
                isVisible={true}
                isOpen={false}
            />
        ));
        expect(component.hasClass('gd-pivot-table-header-menu--hide')).toEqual(false);
        expect(component.hasClass('gd-pivot-table-header-menu--show')).toEqual(true);
    });

    it('should render open menu', () => {
        const component = shallow((
            <HeaderMenu
                isVisible={false}
                isOpen={true}
            />
        ));
        expect(component.hasClass('gd-pivot-table-header-menu--hide')).toEqual(false);
        expect(component.hasClass('gd-pivot-table-header-menu--show')).toEqual(true);
    });
});
