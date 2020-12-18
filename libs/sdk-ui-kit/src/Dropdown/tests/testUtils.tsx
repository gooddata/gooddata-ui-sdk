// (C) 2020 GoodData Corporation
import React from "react";
import { v4 as uuid } from "uuid";

export interface IComponentMock<T> {
    id: string;
    selector: string;
    component: (props: T) => JSX.Element;
    componentWithProps: (mapProps: (props: T) => JSX.IntrinsicElements["div"]) => (props: T) => JSX.Element;
}

/**
 * Creates a placeholder component & selector from the string.
 * Useful to avoid duplicity & hardcoded selectors in tests, when mocking components
 *
 * @param id - component id
 */
export function componentMock<T>(id = `s-component-${uuid()}`): IComponentMock<T> {
    return {
        id,
        selector: `#${id}`,
        component: function MockComponent() {
            return <div id={id} />;
        },
        componentWithProps: (mapProps: (props: T) => JSX.IntrinsicElements["div"]) => {
            return function MockComponent(props: T) {
                return <div id={id} {...mapProps(props)} />;
            };
        },
    };
}
