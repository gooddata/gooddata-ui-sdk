// (C) 2019-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import { waitFor, screen } from "@testing-library/react";

import { RepeatPeriodSelect, IRepeatPeriodSelectProps } from "../RepeatPeriodSelect";

import { IntlWrapper } from "../../../../../localization/IntlWrapper";
import { setupComponent } from "../../../../../../tests/testHelper";

describe("RepeatPeriodSelect", () => {
    function renderComponent(customProps: Partial<IRepeatPeriodSelectProps> = {}) {
        const defaultProps = {
            repeatPeriod: 1,
            onChange: noop,
            ...customProps,
        };

        return setupComponent(
            <IntlWrapper>
                <RepeatPeriodSelect {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render component", () => {
        renderComponent();

        expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    });

    it("should render correct period", () => {
        const repeatPeriod = 5;
        renderComponent({
            repeatPeriod,
        });
        expect(screen.getByDisplayValue(`${repeatPeriod}`)).toBeInTheDocument();
    });

    it("should change input value when valid value is provided", async () => {
        const repeatPeriod = 5;
        const { user } = renderComponent({
            repeatPeriod,
        });

        await user.type(screen.getByDisplayValue(`${repeatPeriod}`), "test");
        await waitFor(() => {
            expect(screen.queryByDisplayValue("test")).not.toBeInTheDocument();
        });

        await user.clear(screen.getByRole("textbox"));
        await user.type(screen.getByRole("textbox"), "2");
        await waitFor(() => {
            expect(screen.queryByDisplayValue("2")).toBeInTheDocument();
        });
    });
});
