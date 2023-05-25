// (C) 2019-2022 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { RepeatFrequencySelect, IRepeatFrequencySelectProps } from "../RepeatFrequencySelect.js";
import { defaultImport } from "default-import";

import { REPEAT_FREQUENCIES } from "../../../constants.js";
import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

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
        const onChange = vi.fn();
        renderComponent({ onChange });

        await userEvent.click(screen.getByText(titleFrequencyDay));
        await userEvent.click(screen.getByText(titleFrequencyWeek));
        await waitFor(() => {
            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toBeCalledWith(expect.stringContaining(REPEAT_FREQUENCIES.WEEK));
        });
    });
});
