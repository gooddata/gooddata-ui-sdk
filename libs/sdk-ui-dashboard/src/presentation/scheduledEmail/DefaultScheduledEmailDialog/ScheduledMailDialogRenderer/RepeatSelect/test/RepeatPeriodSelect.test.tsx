// (C) 2019-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RepeatPeriodSelect, IRepeatPeriodSelectProps } from "../RepeatPeriodSelect";

import { IntlWrapper } from "../../../../../localization/IntlWrapper";

describe("RepeatPeriodSelect", () => {
    function renderComponent(customProps: Partial<IRepeatPeriodSelectProps> = {}) {
        const defaultProps = {
            repeatPeriod: 1,
            onChange: noop,
            ...customProps,
        };

        return render(
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
        renderComponent({
            repeatPeriod,
        });

        await userEvent.type(screen.getByDisplayValue(`${repeatPeriod}`), "test");
        await waitFor(() => {
            expect(screen.queryByDisplayValue("test")).not.toBeInTheDocument();
        });

        await userEvent.clear(screen.getByRole("textbox"));
        await userEvent.type(screen.getByRole("textbox"), "2");
        await waitFor(() => {
            expect(screen.queryByDisplayValue("2")).toBeInTheDocument();
        });
    });
});
