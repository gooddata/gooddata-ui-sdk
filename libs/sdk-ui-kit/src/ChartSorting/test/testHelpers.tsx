// (C) 2022 GoodData Corporation
import { ReactWrapper } from "enzyme";
import { stringUtils } from "@gooddata/util";

export const buildAttributeButtonSelector = (index: number) => {
    return `.s-sort-type-attribute-button-${index}`;
};

export const clickAttributeDropdown = (wrapper: ReactWrapper, index: number): void => {
    wrapper.find(`.s-sort-type-attribute-button-${index}`).hostNodes().simulate("click");
    wrapper.update();
};

export const clickMeasureDropdown = (wrapper: ReactWrapper): void => {
    wrapper.find(".s-sort-type-measure-button").hostNodes().simulate("click");
    wrapper.update();
};

export const findSelector = (wrapper: ReactWrapper, selector: string): boolean => {
    return wrapper
        .find(`.s-${stringUtils.simplifyText(selector)}`)
        .hostNodes()
        .exists();
};

export const changeDropdownValue = (wrapper: ReactWrapper, selector: string): void => {
    wrapper
        .find(`.s-${stringUtils.simplifyText(selector)}`)
        .hostNodes()
        .simulate("click");
    wrapper.update();
};

export const changeMeasureDropdownValue = (wrapper: ReactWrapper, selector: string): void => {
    wrapper
        .find(`.s-sorting-measure-${stringUtils.simplifyText(selector)}`)
        .hostNodes()
        .simulate("click");
    wrapper.update();
};

export const getTextValue = (wrapper: ReactWrapper, selector: string): string => {
    return wrapper.find(selector).hostNodes().text();
};
