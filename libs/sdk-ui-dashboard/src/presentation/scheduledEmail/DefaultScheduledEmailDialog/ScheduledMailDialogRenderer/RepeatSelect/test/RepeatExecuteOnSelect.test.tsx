// (C) 2019-2025 GoodData Corporation
import React from "react";
import { describe, it, expect } from "vitest";
import noop from "lodash/noop.js";
import { render, screen } from "@testing-library/react";

import { RepeatExecuteOnSelect, IRepeatExecuteOnSelectProps } from "../RepeatExecuteOnSelect.js";

import { REPEAT_EXECUTE_ON } from "../../../constants.js";
import { getDate } from "../../../utils/datetime.js";

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";

describe("RepeatExecuteOnSelect", () => {
    const now = new Date();
    const titleDayOfMonth = `on day ${getDate(now)}`;

    function renderComponent(customProps: Partial<IRepeatExecuteOnSelectProps> = {}) {
        const defaultProps = {
            repeatExecuteOn: REPEAT_EXECUTE_ON.DAY_OF_MONTH,
            startDate: now,
            onChange: noop,
            ...customProps,
        };

        return render(
            <IntlWrapper>
                <RepeatExecuteOnSelect {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render component", () => {
        renderComponent();

        expect(screen.getByText(titleDayOfMonth)).toBeInTheDocument();
    });

    it.each([[REPEAT_EXECUTE_ON.DAY_OF_MONTH, titleDayOfMonth]])(
        "should render correct title for %s",
        (repeatExecuteOn: string, expectedTitle: string) => {
            renderComponent({
                repeatExecuteOn,
            });
            expect(screen.getByText(expectedTitle)).toBeInTheDocument();
        },
    );
});
