// (C) 2007-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CommonWrapper, ShallowWrapper, ReactWrapper } from "enzyme";

export const childGetter = (selector: any) => (component: ShallowWrapper | ReactWrapper) =>
    component.find(selector);

export const clickOn = (component: CommonWrapper) => component.simulate("click");

export const pressButtonOn = (keyCode: number, component: CommonWrapper) =>
    component.simulate("keyDown", { keyCode });

export const writeTo = (value: string, component: CommonWrapper) =>
    component.simulate("change", { target: { value } });
