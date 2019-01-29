// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { mount } from 'enzyme';
import MenuState from '../MenuState';

describe('Menu state', () => {
    it('opened set to false by default', () => {
        const wrapper = mount(<MenuState>{() => null}</MenuState>);
        expect(wrapper.state('opened')).toBe(false);
    });

    it('opened set to true when opened is set to true', () => {
        const wrapper = mount(<MenuState opened={true}>{() => null}</MenuState>);
        expect(wrapper.state('opened')).toBe(true);
    });

    it('opened set to true when defaultOpened is set to true', () => {
        const wrapper = mount(<MenuState defaultOpened={true}>{() => null}</MenuState>);
        expect(wrapper.state('opened')).toBe(true);
    });

    it('opened state is propagated with uncontrolled component', () => {
        const fnOnOpenedChangeProp = jest.fn();

        let fnOnOpenedChange: (opened: boolean) => void;
        const fnMenuStateChildren = jest.fn(({ onOpenedChange }) => {
            fnOnOpenedChange = jest.fn(onOpenedChange);
            return null;
        });

        const wrapper = mount(<MenuState onOpenedChange={fnOnOpenedChangeProp}>{fnMenuStateChildren}</MenuState>);

        expect(wrapper.state('opened')).toBe(false);
        expect(fnOnOpenedChangeProp).toHaveBeenCalledTimes(0);
        expect(fnMenuStateChildren).toHaveBeenCalledTimes(1);
        expect(fnMenuStateChildren).toHaveBeenCalledWith({ opened: false, onOpenedChange: expect.any(Function) });

        fnOnOpenedChange(true);

        expect(fnMenuStateChildren).toHaveBeenCalledTimes(2);
        expect(fnMenuStateChildren).toHaveBeenCalledWith({ opened: true, onOpenedChange: expect.any(Function) });
        expect(fnOnOpenedChangeProp).toHaveBeenCalledTimes(1);
        expect(fnOnOpenedChangeProp).toHaveBeenCalledWith(true);

        fnOnOpenedChange(false);

        expect(fnMenuStateChildren).toHaveBeenCalledTimes(3);
        expect(fnMenuStateChildren).toHaveBeenCalledWith({ opened: false, onOpenedChange: expect.any(Function) });
        expect(fnOnOpenedChangeProp).toHaveBeenCalledTimes(2);
        expect(fnOnOpenedChangeProp).toHaveBeenCalledWith(false);
    });

    it('opened state is propagated with controlled component', () => {
        const fnOnOpenedChangeProp = jest.fn();

        let fnOnOpenedChange: (opened: boolean) => void;
        const fnMenuStateChildren = jest.fn(({ onOpenedChange }) => {
            fnOnOpenedChange = jest.fn(onOpenedChange);
            return null;
        });

        const wrapper = mount(
            <MenuState opened={false} onOpenedChange={fnOnOpenedChangeProp}>
                {fnMenuStateChildren}
            </MenuState>
        );

        expect(wrapper.state('opened')).toBe(false);
        expect(fnMenuStateChildren).toHaveBeenCalledTimes(1);
        expect(fnMenuStateChildren).toHaveBeenCalledWith({ opened: false, onOpenedChange: expect.any(Function) });
        expect(fnOnOpenedChangeProp).toHaveBeenCalledTimes(0);

        wrapper.setProps({ opened: true });

        expect(fnMenuStateChildren).toHaveBeenCalledTimes(2);
        expect(fnMenuStateChildren).toHaveBeenCalledWith({ opened: true, onOpenedChange: expect.any(Function) });
        expect(fnOnOpenedChangeProp).toHaveBeenCalledTimes(0);

        fnOnOpenedChange(false);

        expect(fnOnOpenedChangeProp).toHaveBeenCalledTimes(1);
        expect(fnOnOpenedChangeProp).toHaveBeenCalledWith(false);
    });
});
