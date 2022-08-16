// (C) 2019-2022 GoodData Corporation
import React from "react";
import { IntlShape } from "react-intl";
import noop from "lodash/noop";
import { waitFor, screen } from "@testing-library/react";

import { TEXT_INDEX } from "./testUtils";
import { RepeatExecuteOnSelect, IRepeatExecuteOnSelectProps } from "../RepeatExecuteOnSelect";

import { REPEAT_EXECUTE_ON } from "../../../constants";
import { getDate, getIntlDayName, getWeek } from "../../../utils/datetime";

import { IntlWrapper } from "../../../../../localization/IntlWrapper";
import { createInternalIntl } from "../../../../../localization/createInternalIntl";
import { setupComponent } from "../../../../../../tests/testHelper";

describe("RepeatExecuteOnSelect", () => {
    const intl: IntlShape = createInternalIntl();
    const now = new Date();
    const titleDayOfMonth = `on day ${getDate(now)}`;
    const titleDayOfWeek = `on the ${TEXT_INDEX[getWeek(now)]} ${getIntlDayName(intl, now)}`;

    function renderComponent(customProps: Partial<IRepeatExecuteOnSelectProps> = {}) {
        const defaultProps = {
            repeatExecuteOn: REPEAT_EXECUTE_ON.DAY_OF_MONTH,
            startDate: now,
            onChange: noop,
            ...customProps,
        };

        return setupComponent(
            <IntlWrapper>
                <RepeatExecuteOnSelect {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render component", () => {
        renderComponent();

        expect(screen.getByText(titleDayOfMonth)).toBeInTheDocument();
    });

    it.each([
        [REPEAT_EXECUTE_ON.DAY_OF_WEEK, titleDayOfWeek],
        [REPEAT_EXECUTE_ON.DAY_OF_MONTH, titleDayOfMonth],
    ])("should render correct title for %s", (repeatExecuteOn: string, expectedTitle: string) => {
        renderComponent({
            repeatExecuteOn,
        });
        expect(screen.getByText(expectedTitle)).toBeInTheDocument();
    });

    it("should trigger onChange", async () => {
        const onChange = jest.fn();
        const { user } = renderComponent({ onChange });
        await user.click(screen.getByText(titleDayOfMonth));
        await user.click(screen.getByText(titleDayOfWeek));
        await waitFor(() => {
            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toBeCalledWith(expect.stringContaining(REPEAT_EXECUTE_ON.DAY_OF_WEEK));
        });
    });
});
