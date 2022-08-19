// (C) 2019-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RepeatFrequencySelect, IRepeatFrequencySelectProps } from "../RepeatFrequencySelect";

import { REPEAT_FREQUENCIES } from "../../../constants";
import { IntlWrapper } from "../../../../../localization/IntlWrapper";

describe("RepeatFrequencySelect", () => {
    const titleFrequencyDay = "day";
    const titleFrequencyWeek = "week";
    const titleFrequencyMonth = "month";

    function renderComponent(customProps: Partial<IRepeatFrequencySelectProps> = {}) {
        const defaultProps = {
            repeatFrequency: REPEAT_FREQUENCIES.DAY,
            repeatPeriod: 1,
            onChange: noop,
            ...customProps,
        };

        return render(
            <IntlWrapper>
                <RepeatFrequencySelect {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render component", () => {
        renderComponent();
        expect(screen.getByText(titleFrequencyDay)).toBeInTheDocument();
    });

    it.each([
        [REPEAT_FREQUENCIES.DAY, titleFrequencyDay],
        [REPEAT_FREQUENCIES.WEEK, titleFrequencyWeek],
        [REPEAT_FREQUENCIES.MONTH, titleFrequencyMonth],
    ])("should render correct title for %s", (repeatFrequency: string, expectedTitle: string) => {
        renderComponent({
            repeatFrequency,
        });
        expect(screen.getByText(expectedTitle)).toBeInTheDocument();
    });

    it.each([
        [REPEAT_FREQUENCIES.DAY, "days"],
        [REPEAT_FREQUENCIES.WEEK, "weeks"],
        [REPEAT_FREQUENCIES.MONTH, "months"],
    ])("should render title in plural for %s", (repeatFrequency: string, expectedTitle: string) => {
        renderComponent({
            repeatFrequency,
            repeatPeriod: 2,
        });
        expect(screen.getByText(expectedTitle)).toBeInTheDocument();
    });

    it("should trigger onChange", async () => {
        const onChange = jest.fn();
        renderComponent({ onChange });

        await userEvent.click(screen.getByText(titleFrequencyDay));
        await userEvent.click(screen.getByText(titleFrequencyWeek));
        await waitFor(() => {
            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toBeCalledWith(expect.stringContaining(REPEAT_FREQUENCIES.WEEK));
        });
    });
});
