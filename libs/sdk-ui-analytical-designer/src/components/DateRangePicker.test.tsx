// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { withIntl } from "../utils/with_intl.js";

import { DateRangePicker } from "./DateRangePicker.js";

describe("DateRangePicker", () => {
    const Wrapped = withIntl(DateRangePicker);

    function renderComponent(props = {}) {
        const defaultProps = { dateFormat: "MM/dd/yyyy", ...props };
        return render(<Wrapped {...defaultProps} />);
    }

    describe("initial state", () => {
        it("should render with className", () => {
            const { container } = renderComponent({
                className: "testClass",
            });
            const pickerMainClass = container.querySelectorAll("div.testClass");
            expect(pickerMainClass).toHaveLength(1);
        });

        it("should render without className", () => {
            const { container } = renderComponent();
            const pickerMainClass = container.querySelectorAll(".testClass");
            expect(pickerMainClass).toHaveLength(0);
        });
    });
});
