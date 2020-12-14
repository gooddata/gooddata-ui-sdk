// (C) 2019-2020 GoodData Corporation
import React from "react";
import noop from "lodash/noop";
import { mount, ReactWrapper } from "enzyme";

import { REPEAT_EXECUTE_ON } from "../../../constants";
import { getDate, getDayName, getWeek } from "../../../utils/datetime";
import { RepeatExecuteOnSelect, IRepeatExecuteOnSelectProps } from "../RepeatExecuteOnSelect";
// TODO: RAIL-2760 Remove once moved to SDK8
import withIntlProvider from "../../../../Core/utils/testUtils/withIntlProvider";
import withRedux from "../../../../Core/utils/testUtils/withRedux";

import {
    getDropdownTitle,
    openDropdown,
    selectDropdownItem,
    REPEAT_EXECUTE_ON_INDEX,
    TEXT_INDEX,
} from "./testUtils";

describe("RepeatExecuteOnSelect", () => {
    const now = new Date();
    const titleDayOfMonth = `on day ${getDate(now)}`;
    const titleDayOfWeek = `on the ${TEXT_INDEX[getWeek(now)]} ${getDayName(now)}`;

    function renderComponent(customProps: Partial<IRepeatExecuteOnSelectProps> = {}): ReactWrapper {
        const defaultProps = {
            repeatExecuteOn: REPEAT_EXECUTE_ON.DAY_OF_MONTH,
            startDate: now,
            onChange: noop,
            ...customProps,
        };

        const Wrapped = withRedux(withIntlProvider(RepeatExecuteOnSelect));
        return mount(<Wrapped {...defaultProps} />);
    }

    it("should render component", () => {
        const component = renderComponent();
        expect(component).toExist();
    });

    it.each([
        [REPEAT_EXECUTE_ON.DAY_OF_WEEK, titleDayOfWeek],
        [REPEAT_EXECUTE_ON.DAY_OF_MONTH, titleDayOfMonth],
    ])("should render correct title for %s", (repeatExecuteOn: string, expectedTitle: string) => {
        const component = renderComponent({
            repeatExecuteOn,
        });
        expect(getDropdownTitle(component)).toBe(expectedTitle);
    });

    it("should trigger onChange", () => {
        const onChange = jest.fn();
        const component = renderComponent({ onChange });

        openDropdown(component);
        selectDropdownItem(component, REPEAT_EXECUTE_ON_INDEX[REPEAT_EXECUTE_ON.DAY_OF_WEEK]);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(REPEAT_EXECUTE_ON.DAY_OF_WEEK);
    });
});
