// (C) 2019-2022 GoodData Corporation
import React from "react";
import { IntlShape } from "react-intl";
import { render, screen, waitFor } from "@testing-library/react";
import defaultUserEvent from "@testing-library/user-event";
import noop from "lodash/noop.js";
import { describe, it, expect, vi } from "vitest";
import { defaultImport } from "default-import";

import { RepeatTypeSelect, IRepeatTypeSelectProps } from "../RepeatTypeSelect.js";

import { getIntlDayName, getWeek } from "../../../utils/datetime.js";
import { REPEAT_TYPES } from "../../../constants.js";
import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";
import { createInternalIntl } from "../../../../../localization/createInternalIntl.js";

import { TEXT_INDEX } from "./testUtils.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const userEvent = defaultImport(defaultUserEvent);

describe("RepeatTypeSelect", () => {
    const intl: IntlShape = createInternalIntl();
    const now = new Date();

    const titleTypeDaily = "Daily";
    const titleTypeWeekly = `Weekly on ${getIntlDayName(intl, now)}`;
    const titleTypeMonthly = `Monthly on the ${TEXT_INDEX[getWeek(now)]} ${getIntlDayName(intl, now)}`;
    const titleTypeCustom = "Custom";

    function renderComponent(customProps: Partial<IRepeatTypeSelectProps> = {}) {
        const defaultProps = {
            repeatType: REPEAT_TYPES.DAILY,
            startDate: now,
            onChange: noop,
            ...customProps,
        };

        return render(
            <IntlWrapper>
                <RepeatTypeSelect {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render component", () => {
        renderComponent();
        expect(screen.getByText(titleTypeDaily)).toBeInTheDocument();
    });

    it.each([
        [REPEAT_TYPES.DAILY, titleTypeDaily],
        [REPEAT_TYPES.WEEKLY, titleTypeWeekly],
        [REPEAT_TYPES.MONTHLY, titleTypeMonthly],
        [REPEAT_TYPES.CUSTOM, titleTypeCustom],
    ])("should render correct title for %s", (repeatType: string, expectedTitle: string) => {
        renderComponent({
            repeatType,
        });

        expect(screen.getByText(expectedTitle)).toBeInTheDocument();
    });

    it("should trigger onChange", async () => {
        const onChange = vi.fn();
        renderComponent({ onChange });

        await userEvent.click(screen.getByText(titleTypeDaily));

        await userEvent.click(screen.getByText(titleTypeWeekly));

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toBeCalledWith(expect.stringContaining(REPEAT_TYPES.WEEKLY));
        });
    });
});
