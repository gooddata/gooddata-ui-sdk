// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import { formatTime } from "@gooddata/sdk-ui-kit";
import format from "date-fns/format/index.js";
import noop from "lodash/noop.js";
import { describe, it, expect } from "vitest";

import { DateTime, IDateTimeProps } from "../DateTime.js";

import { IntlWrapper } from "../../../../localization/IntlWrapper.js";

const date = new Date();
const dateFormat = "MM/dd/yyyy";

describe("DateTime", () => {
    function renderComponent(customProps: Partial<IDateTimeProps> = {}) {
        const defaultProps = {
            date,
            dateFormat,
            label: "",
            locale: "en-US",
            timezone: "",
            onDateChange: noop,
            onTimeChange: noop,
            ...customProps,
        };

        return render(
            <IntlWrapper>
                <DateTime {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render component", () => {
        renderComponent();
        const currentDate = format(date, dateFormat);
        expect(screen.getByDisplayValue(currentDate)).toBeInTheDocument();
    });

    it("should render label", () => {
        const label = "First occurrence";
        renderComponent({ label });
        expect(screen.getByText(label)).toBeInTheDocument();
    });

    it("should render date time picker", () => {
        const TIME_FORMAT: string = "hh:mm A";
        const currentTime = formatTime(date.getHours(), date.getMinutes(), TIME_FORMAT);
        renderComponent();
        expect(screen.getByText(currentTime)).toBeInTheDocument();
    });

    it("should render timezone", () => {
        const timezone = "UTC-07:00 Pacific Standard Time";
        renderComponent({ timezone });
        expect(screen.getByText(timezone)).toBeInTheDocument();
    });
});
