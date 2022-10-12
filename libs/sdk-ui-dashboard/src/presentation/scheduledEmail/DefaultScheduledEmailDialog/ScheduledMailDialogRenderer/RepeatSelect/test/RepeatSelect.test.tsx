// (C) 2019-2022 GoodData Corporation
import React from "react";
import { IntlShape } from "react-intl";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import noop from "lodash/noop";

import { TEXT_INDEX } from "./testUtils";
import { RepeatSelect, IRepeatSelectData, IRepeatSelectProps } from "../RepeatSelect";

import { REPEAT_EXECUTE_ON, REPEAT_FREQUENCIES, REPEAT_TYPES } from "../../../constants";
import { getDate, getIntlDayName, getWeek } from "../../../utils/datetime";
import { IntlWrapper } from "../../../../../localization/IntlWrapper";
import { createInternalIntl } from "../../../../../localization/createInternalIntl";

describe("RepeatSelect", () => {
    const now = new Date();
    const intl: IntlShape = createInternalIntl();
    const titleDayOfMonth = `on day ${getDate(now)}`;
    const DEFAULT_REPEAT_DATA: IRepeatSelectData = {
        repeatExecuteOn: REPEAT_EXECUTE_ON.DAY_OF_MONTH,
        repeatFrequency: REPEAT_FREQUENCIES.DAY,
        repeatPeriod: 1,
        repeatType: REPEAT_TYPES.DAILY,
    };

    function renderComponent(customProps: Partial<IRepeatSelectProps> = {}) {
        const defaultProps = {
            label: "Repeats:",
            startDate: now,
            onChange: noop,
            ...DEFAULT_REPEAT_DATA,
            ...customProps,
        };

        return render(
            <IntlWrapper>
                <RepeatSelect {...defaultProps} />
            </IntlWrapper>,
        );
    }

    it("should render component", () => {
        renderComponent();

        expect(screen.getByText("Repeats:")).toBeInTheDocument();
        expect(screen.getByText("Daily")).toBeInTheDocument();
    });

    describe("Toggle components", () => {
        it.each([
            ["not show", REPEAT_TYPES.DAILY, false],
            ["not show", REPEAT_TYPES.WEEKLY, false],
            ["not show", REPEAT_TYPES.MONTHLY, false],
            ["show", REPEAT_TYPES.CUSTOM, true],
        ])(
            "should %s repeat options when repeat type is %s",
            (_expectedAction: string, repeatType: string, expectedExists: boolean) => {
                renderComponent({
                    repeatType,
                });

                if (expectedExists) {
                    expect(screen.queryByRole("textbox")).toBeInTheDocument();
                    expect(screen.queryByText("day")).toBeInTheDocument();
                } else {
                    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
                    expect(screen.queryByText("day")).not.toBeInTheDocument();
                }
            },
        );

        it.each([
            ["not show", REPEAT_FREQUENCIES.DAY, false],
            ["not show", REPEAT_FREQUENCIES.WEEK, false],
            ["show", REPEAT_FREQUENCIES.MONTH, true],
        ])(
            "should %s repeat execute dropdown when repeat frequency is %s",
            (_expectedAction: string, repeatFrequency: string, expectedExists: boolean) => {
                renderComponent({
                    repeatFrequency,
                    repeatType: REPEAT_TYPES.CUSTOM,
                });

                if (expectedExists) {
                    expect(screen.queryByText(titleDayOfMonth)).toBeInTheDocument();
                } else {
                    expect(screen.queryByText(titleDayOfMonth)).not.toBeInTheDocument();
                }
            },
        );
    });

    describe("onChange event", () => {
        const titleTypeDaily = "Daily";
        const titleTypeWeekly = `Weekly on ${getIntlDayName(intl, now)}`;
        const titleTypeMonthly = `Monthly on the ${TEXT_INDEX[getWeek(now)]} ${getIntlDayName(intl, now)}`;
        const titleTypeCustom = "Custom";

        it.each([
            [REPEAT_TYPES.DAILY, REPEAT_TYPES.WEEKLY, titleTypeDaily],
            [REPEAT_TYPES.WEEKLY, REPEAT_TYPES.DAILY, titleTypeWeekly],
            [REPEAT_TYPES.MONTHLY, REPEAT_TYPES.DAILY, titleTypeMonthly],
            [REPEAT_TYPES.CUSTOM, REPEAT_TYPES.DAILY, titleTypeCustom],
        ])(
            "should trigger onChange with selected repeat type is %s",
            async (selected: string, current: string, title: string) => {
                const onChange = jest.fn();
                renderComponent({ repeatType: current, onChange });
                await userEvent.click(screen.getByRole("button"));
                await userEvent.click(screen.getByText(title));

                await waitFor(() => {
                    expect(onChange).toBeCalledWith(
                        expect.objectContaining({
                            ...DEFAULT_REPEAT_DATA,
                            repeatType: selected,
                        }),
                    );
                });
            },
        );

        it("should trigger onChange with selected repeat period", async () => {
            const onChange = jest.fn();
            renderComponent({
                repeatType: REPEAT_TYPES.CUSTOM,
                onChange,
            });

            await userEvent.clear(screen.getByRole("textbox"));
            await userEvent.type(screen.getByRole("textbox"), "10");
            expect(screen.getByDisplayValue("10")).toBeInTheDocument();

            await waitFor(() => {
                expect(onChange).toBeCalledWith(
                    expect.objectContaining({
                        ...DEFAULT_REPEAT_DATA,
                        repeatPeriod: 10,
                        repeatType: REPEAT_TYPES.CUSTOM,
                    }),
                );
            });
        });

        it.each([
            [REPEAT_FREQUENCIES.DAY, REPEAT_FREQUENCIES.WEEK],
            [REPEAT_FREQUENCIES.WEEK, REPEAT_FREQUENCIES.DAY],
            [REPEAT_FREQUENCIES.MONTH, REPEAT_FREQUENCIES.DAY],
        ])(
            "should trigger onChange with selected repeat frequency is %s",
            async (selected: string, current: string) => {
                const onChange = jest.fn();
                renderComponent({
                    repeatFrequency: current,
                    repeatType: REPEAT_TYPES.CUSTOM,
                    onChange,
                });
                await userEvent.click(screen.getByText(current));
                await userEvent.click(screen.getByText(selected));
                await waitFor(() => {
                    expect(onChange).toBeCalledWith(
                        expect.objectContaining({
                            ...DEFAULT_REPEAT_DATA,
                            repeatFrequency: selected,
                            repeatType: REPEAT_TYPES.CUSTOM,
                        }),
                    );
                });
            },
        );

        it("should reset repeatData when repeatType is changed", async () => {
            const onChange = jest.fn();
            renderComponent({
                repeatExecuteOn: REPEAT_EXECUTE_ON.DAY_OF_WEEK,
                repeatFrequency: REPEAT_FREQUENCIES.MONTH,
                repeatPeriod: 10,
                repeatType: REPEAT_TYPES.CUSTOM,
                onChange,
            });
            await userEvent.click(screen.getByText("Custom"));
            await userEvent.click(screen.getByText("Daily"));

            await waitFor(() => {
                expect(onChange).toBeCalledWith(expect.objectContaining(DEFAULT_REPEAT_DATA));
            });
        });
    });
});
