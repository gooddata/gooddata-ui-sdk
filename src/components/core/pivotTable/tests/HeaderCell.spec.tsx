// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow, mount } from 'enzyme';

import HeaderCell from '../HeaderCell';
import HeaderMenu from '../HeaderMenu';

describe('HeaderCell renderer', () => {
    it('should render text for the cell', () => {
        const component = shallow(<HeaderCell displayText="Header" />);
        expect(component.text()).toEqual('Header');
    });

    describe('Menu in HeaderCell', () => {
        it('should render menu', () => {
            const component = mount(
                <HeaderCell
                    displayText="Header"
                    enableMenu={true}
                />);
            expect(component.find(HeaderMenu)).toHaveLength(1);
            expect(component.state('isMenuVisible')).toBeFalsy();

            component.simulate('mouseEnter', {
                preventDefault: (): null => null
            });
            expect(component.state('isMenuVisible')).toBeTruthy();
            component.find(HeaderMenu).simulate('click');
            expect(component.state('isMenuOpen')).toBeTruthy();
            component.find(HeaderMenu).simulate('click');
            expect(component.state('isMenuOpen')).toBeFalsy();
        });
    });

    describe('Sorting in HeaderCell', () => {
        it('should render default sorting', () => {
            const component = mount(
                <HeaderCell
                    displayText="Header"
                    enableMenu={false}
                    enableSorting={true}
                    defaultSortDirection={'asc'}
                />);
            const cellLabel = component.find('.s-header-cell-label');
            expect(cellLabel).toHaveLength(1);

            component.simulate('mouseEnter');
            expect(component.state('currentSortDirection')).toEqual('asc');
            expect(component.find('.s-sort-direction-arrow')).toHaveLength(1);
            expect(component.find('.s-sorted-asc')).toHaveLength(1);
        });

        it('should call onSortChaged when clicked on label', () => {
            const onSortClick = jest.fn();
            const component = mount(
                <HeaderCell
                    displayText="Header"
                    enableMenu={false}
                    enableSorting={true}
                    defaultSortDirection={'asc'}
                    onSortClick={onSortClick}
                />);
            const cellLabel = component.find('.s-header-cell-label');

            cellLabel.simulate('click');
            expect(onSortClick).toHaveBeenCalledWith('asc');
        });

        it('should call onSortChaged with next sort direction', () => {
            const onSortClick = jest.fn();
            const component = mount(
                <HeaderCell
                    displayText="Header"
                    enableMenu={false}
                    enableSorting={true}
                    sortDirection={'asc'}
                    onSortClick={onSortClick}
                />);
            const cellLabel = component.find('.s-header-cell-label');

            cellLabel.simulate('click');
            expect(onSortClick).toHaveBeenCalledWith('desc');
        });
    });
});
