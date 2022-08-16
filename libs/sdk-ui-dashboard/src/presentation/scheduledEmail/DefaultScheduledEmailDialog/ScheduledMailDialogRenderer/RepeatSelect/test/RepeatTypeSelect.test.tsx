// (C) 2019-2022 GoodData Corporation
import React from "react";
import { IntlShape } from "react-intl";
import { waitFor, screen } from "@testing-library/react";
import noop from "lodash/noop";

import { RepeatTypeSelect, IRepeatTypeSelectProps } from "../RepeatTypeSelect";

import { getIntlDayName, getWeek } from "../../../utils/datetime";
import { REPEAT_TYPES } from "../../../constants";
import { IntlWrapper } from "../../../../../localization/IntlWrapper";
import { createInternalIntl } from "../../../../../localization/createInternalIntl";
import { setupComponent } from "../../../../../../tests/testHelper";

import { TEXT_INDEX } from "./testUtils";

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

        return setupComponent(
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
        const onChange = jest.fn();
        const { user } = renderComponent({ onChange });

        await user.click(screen.getByText(titleTypeDaily));

        await user.click(screen.getByText(titleTypeWeekly));

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toBeCalledWith(expect.stringContaining(REPEAT_TYPES.WEEKLY));
        });
    });
});
