// (C) 2020 GoodData Corporation
import React from "react";
import { withIntl } from "@gooddata/sdk-ui";
import { mount } from "enzyme";
import noop from "lodash/noop";
import { IRankingFilterProps, RankingFilter } from "../RankingFilter";

import * as Mock from "./mocks";

const DROPDOWN_BUTTON = ".s-rf-dropdown-button";
const DROPDOWN_BODY = ".s-rf-dropdown-body";

const renderComponent = (props?: Partial<IRankingFilterProps>) => {
    const defaultProps: IRankingFilterProps = {
        measureItems: Mock.measureItems,
        attributeItems: Mock.attributeItems,
        filter: Mock.defaultFilter,
        onApply: noop,
        onCancel: noop,
        buttonTitle: "Ranking Filter",
    };
    const Wrapped = withIntl(RankingFilter);
    return mount(<Wrapped {...defaultProps} {...props} />);
};

describe("RankingFilter", () => {
    it("should render a button with provided title", () => {
        const component = renderComponent({ buttonTitle: "My title" });

        expect(component.find(DROPDOWN_BUTTON).text()).toEqual("My title");
    });

    it("should open and close dropdown on button click", () => {
        const component = renderComponent();

        expect(component.find(DROPDOWN_BODY).exists()).toEqual(false);

        component.find(DROPDOWN_BUTTON).simulate("click");
        expect(component.find(DROPDOWN_BODY).exists()).toEqual(true);

        component.find(DROPDOWN_BUTTON).simulate("click");
        expect(component.find(DROPDOWN_BODY).exists()).toEqual(false);
    });
});
