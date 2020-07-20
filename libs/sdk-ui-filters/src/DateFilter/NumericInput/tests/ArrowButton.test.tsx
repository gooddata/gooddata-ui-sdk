// (C) 2007-2019 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import noop from "lodash/noop";

import { ArrowButton } from "../ArrowButton";
import { childGetter, clickOn } from "../../tests/utils";

const getButton = childGetter("button");

describe("ArrowButton", () => {
    describe("when not disabled", () => {
        it("should not disable the button", () => {
            const rendered = shallow(<ArrowButton onClick={noop} arrowDirection="increment" />);

            expect(getButton(rendered).prop("disabled")).toBeFalsy();
        });

        it("should call the onClick handler when clicked", () => {
            const onClick = jest.fn();
            const rendered = shallow(<ArrowButton onClick={onClick} arrowDirection="increment" />);

            clickOn(getButton(rendered));

            expect(onClick).toBeCalled();
        });
    });

    describe("when disabled", () => {
        it("should disable the button", () => {
            const rendered = shallow(
                <ArrowButton onClick={noop} arrowDirection="increment" disabled={true} />,
            );

            expect(getButton(rendered).prop("disabled")).toBeTruthy();
        });

        it("should not call the onClick handler when clicked", () => {
            const onClick = jest.fn();
            const rendered = shallow(
                <ArrowButton onClick={onClick} arrowDirection="increment" disabled={true} />,
            );

            clickOn(getButton(rendered));

            expect(onClick).not.toBeCalled();
        });
    });
});
