// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { type Mock, describe, expect, it, vi } from "vitest";

import { getIsoDate } from "../../utils/timers.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { type IMeasureDateRangePickerProps, MeasureDateRangePicker } from "./MeasureDateRangePicker.js";

describe("MeasureDateRangePicker", () => {
    const Wrapped = withRedux(withIntl(MeasureDateRangePicker));

    const defaultProps: IMeasureDateRangePickerProps = {
        dateFormat: "MM/dd/yyyy",
        onApply: () => {},
        onCancel: () => {},
        start: null,
        end: null,
    };

    function renderComponent(props: Partial<IMeasureDateRangePickerProps> = {}) {
        return render(<Wrapped {...defaultProps} {...props} />);
    }

    describe("initial state", () => {
        it("should render with className", () => {
            renderComponent({
                className: "testClass",
            });
            const pickerMainClass = document.querySelector("section.testClass");
            expect(pickerMainClass).toBeInTheDocument();
        });

        it("should render without className", () => {
            renderComponent();
            const pickerMainClass = document.querySelector(".testClass");
            expect(pickerMainClass).not.toBeInTheDocument();
        });
    });

    describe("onCancel", () => {
        it("should be called on click", () => {
            const onCancel = vi.fn();
            renderComponent({
                onCancel,
            });
            const button = document.querySelector("button.s-date-range-cancel");
            fireEvent.click(button);

            expect(onCancel).toHaveBeenCalledTimes(1);
        });
    });

    describe("onApply", () => {
        let onApply: Mock<IMeasureDateRangePickerProps["onApply"]> = null;

        function prepareComponent(otherProps = {}) {
            onApply = vi.fn();

            const rerender = renderComponent({
                onApply,
                ...otherProps,
            });
            fireEvent.click(document.querySelector("button.s-date-range-apply"));

            return rerender;
        }

        it("should NOT be called when dates are null", () => {
            prepareComponent();
            expect(onApply).toHaveBeenCalledTimes(0);
        });

        it("should NOT be called when dates START date is null", () => {
            prepareComponent({
                end: new Date(),
            });
            expect(onApply).toHaveBeenCalledTimes(0);
        });

        it("should NOT be called when dates END date is null", () => {
            prepareComponent({
                start: new Date(),
            });
            expect(onApply).toHaveBeenCalledTimes(0);
        });

        it("should be called when dates are valid", () => {
            prepareComponent({
                start: new Date(),
                end: new Date(),
            });
            expect(onApply).toHaveBeenCalledTimes(1);
        });

        it("should be called when one date is changed to valid", () => {
            prepareComponent();

            expect(onApply).toHaveBeenCalledTimes(0);

            fireEvent.change(document.querySelector(".s-interval-from input.input-text"), {
                target: {
                    value: "01/01/2015",
                },
            });
            fireEvent.change(document.querySelector(".s-interval-to input.input-text"), {
                target: {
                    value: "02/01/2015",
                },
            });
            fireEvent.click(document.querySelector("button.s-date-range-apply"));

            expect(onApply).toHaveBeenCalledTimes(1);
            const [start, end] = onApply.mock.calls[0];
            expect(getIsoDate(start)).toEqual("2015-01-01");
            expect(getIsoDate(end)).toEqual("2015-02-01");
        });

        it("should NOT be called when one date is changed to invalid", () => {
            prepareComponent({
                start: new Date(),
                end: new Date(),
            });

            expect(onApply).toHaveBeenCalledTimes(1);

            const inputFrom = document.querySelector(".s-interval-from input.input-text");
            fireEvent.change(inputFrom, {
                target: {
                    value: "01/01/2015",
                },
            });
            fireEvent.blur(inputFrom);

            const inputTo = document.querySelector(".s-interval-to input.input-text");
            fireEvent.change(inputTo, {
                target: {
                    value: "invalid",
                },
            });
            fireEvent.blur(inputTo);

            fireEvent.click(document.querySelector("button.s-date-range-apply"));

            expect(onApply).toHaveBeenCalledTimes(1);
        });

        it("should be called once invalid date is fixed", () => {
            prepareComponent();

            fireEvent.change(document.querySelector(".s-interval-from input.input-text"), {
                target: {
                    value: "invalid",
                },
            });
            fireEvent.change(document.querySelector(".s-interval-to input.input-text"), {
                target: {
                    value: "02/01/2015",
                },
            });

            fireEvent.click(document.querySelector("button.s-date-range-apply"));
            expect(onApply).toHaveBeenCalledTimes(0);

            fireEvent.change(document.querySelector(".s-interval-from input.input-text"), {
                target: {
                    value: "01/01/2015",
                },
            });

            fireEvent.click(document.querySelector("button.s-date-range-apply"));
            expect(onApply).toHaveBeenCalledTimes(1);
            const [start, end] = onApply.mock.calls[0];
            expect(getIsoDate(start)).toEqual("2015-01-01");
            expect(getIsoDate(end)).toEqual("2015-02-01");
        });
    });
});
