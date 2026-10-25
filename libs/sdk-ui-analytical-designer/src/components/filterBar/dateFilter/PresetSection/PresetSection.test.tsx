// (C) 2022-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type DateFilterOption, type IUiRelativeDateFilterForm } from "@gooddata/sdk-ui-filters";

import {
    dateDataset3,
    dateDatasetRefsWithGranularities,
} from "../../../../tests/DateDatasetWithGranularities.test.helpers.js";
import { withIntl } from "../../../../utils/with_intl.js";
import {
    ALL_TIME_FILTER_OPTION,
    RELATIVE_PERIOD_FILTER_OPTION,
    STATIC_PERIOD_FILTER_OPTION,
} from "../defaultFilterOptions.js";
import { RELATIVE_DATE_FILTER_PRESETS } from "../presets.js";

import { type IPresetsSectionProps, PresetsSection } from "./PresetsSection.js";

const defaultProps: IPresetsSectionProps = {
    dateDataset: dateDataset3,
    dateDatasetRefsWithGranularities: dateDatasetRefsWithGranularities,
    relativeDateFilterPresets: RELATIVE_DATE_FILTER_PRESETS,
    dateFormat: "MM/dd/yyyy",
    filter: {
        filterOption: ALL_TIME_FILTER_OPTION,
        excludeCurrentPeriod: false,
    },
    onChange: vi.fn(),
    isTimeForAbsoluteRangeEnabled: false,
    submitForm: vi.fn(),
    activeCalendars: undefined,
};

const renderPresetSection = (customProps: Partial<IPresetsSectionProps> = {}) => {
    const LocalizedPresetsSection = withIntl(PresetsSection);
    return render(<LocalizedPresetsSection {...defaultProps} {...customProps} />);
};

const buildSelectedFilter = (filterOption: DateFilterOption, excludeCurrentPeriod = false) => ({
    filterOption,
    excludeCurrentPeriod,
});

const changeEvent = (value: string) => ({
    target: {
        value,
    },
});

const getStringToday = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const year = now.getFullYear();
    return `${month}/${date}/${year}`;
};

describe("PresetSection", () => {
    describe("Subsections visibility", () => {
        it("should not render any subsection when All time is selected", () => {
            const { queryByText, queryByDisplayValue } = renderPresetSection();
            expect(queryByText("Months")).not.toBeInTheDocument(); // relative period tab
            expect(queryByDisplayValue(getStringToday())).not.toBeInTheDocument();
        });

        it("should render static date range section when Static period option is selected", () => {
            const { queryByText, queryByDisplayValue } = renderPresetSection({
                filter: buildSelectedFilter(STATIC_PERIOD_FILTER_OPTION),
            });
            expect(queryByText("Months")).not.toBeInTheDocument(); // relative period tab
            expect(queryByDisplayValue(getStringToday())).toBeInTheDocument();
        });

        it("should render relative date range section when Relative period option is selected", () => {
            const { queryByText, queryByDisplayValue } = renderPresetSection({
                filter: buildSelectedFilter(RELATIVE_PERIOD_FILTER_OPTION),
            });
            expect(queryByText("Months")).toBeInTheDocument(); // relative period tab
            expect(queryByDisplayValue(getStringToday())).not.toBeInTheDocument();
        });

        it("should render exclude current period section when supported preset is selected", () => {
            const { queryByLabelText } = renderPresetSection({
                filter: buildSelectedFilter(RELATIVE_DATE_FILTER_PRESETS["GDC.time.quarter"][0]),
            });
            expect(queryByLabelText("Exclude this quarter")).not.toBeInTheDocument();
        });

        it("should not render exclude current period section when unsupported preset is selected", () => {
            const { queryByLabelText } = renderPresetSection({
                filter: buildSelectedFilter(
                    RELATIVE_DATE_FILTER_PRESETS["GDC.time.quarter"].find(
                        (p) => p.localIdentifier === "LAST_4_QUARTERS",
                    ),
                ),
            });
            expect(queryByLabelText("Exclude this quarter")).toBeInTheDocument();
        });
    });

    describe("All time option", () => {
        it("is offered by default", () => {
            const { getByLabelText, queryByText } = renderPresetSection({
                filter: buildSelectedFilter(STATIC_PERIOD_FILTER_OPTION),
            });
            fireEvent.click(getByLabelText("Period"));

            expect(queryByText("All time")).toBeInTheDocument();
        });
    });

    describe("Invalid presets selection handling", () => {
        it.each([
            ["All time", ALL_TIME_FILTER_OPTION],
            ["Absolute form", STATIC_PERIOD_FILTER_OPTION],
            ["supported relative preset", RELATIVE_DATE_FILTER_PRESETS["GDC.time.month"][0]],
            [
                "supported relative period granularity ",
                {
                    ...RELATIVE_PERIOD_FILTER_OPTION,
                    granularity: "GDC.time.month",
                } as IUiRelativeDateFilterForm,
            ],
        ])(
            "should not call onChange to reset currently selected option when %s is selected",
            (_selectedOption: string, dateFilter: DateFilterOption) => {
                const onChange = vi.fn();
                renderPresetSection({
                    filter: buildSelectedFilter(dateFilter),
                    onChange,
                });
                expect(onChange).not.toBeCalled();
            },
        );

        it("should call onChange with All time preset when unsupported relative preset is selected", () => {
            const onChange = vi.fn();
            renderPresetSection({
                // year presets are not in Date3 mock dataset
                filter: buildSelectedFilter(RELATIVE_DATE_FILTER_PRESETS["GDC.time.year"][0]),
                onChange,
            });

            expect(onChange).toBeCalledWith(
                expect.objectContaining({
                    filterOption: expect.objectContaining({
                        type: "allTime",
                    }),
                }),
            );
        });

        it("should call onChange with default relative form granularity and reset from/to range when one with unsupported granularity is selected", () => {
            const onChange = vi.fn();
            renderPresetSection({
                // year presets are not in Date3 mock dataset
                filter: buildSelectedFilter({
                    localIdentifier: "RELATIVE_FORM",
                    type: "relativeForm",
                    granularity: "GDC.time.year",
                    from: 1,
                    to: -1,
                    name: "",
                    visible: true,
                }),
                onChange,
            });

            expect(onChange).toBeCalledWith(
                expect.objectContaining({
                    filterOption: expect.objectContaining({
                        type: "relativeForm",
                        granularity: "GDC.time.month",
                        from: undefined,
                        to: undefined,
                    }),
                }),
            );
        });
    });

    describe("Valid presets selection handling", () => {
        it("should call onChange when new type of preset is selected", () => {
            const onChange = vi.fn();
            const { getByText } = renderPresetSection({ onChange });

            fireEvent.click(getByText("All time"));
            fireEvent.click(getByText("Static period"));

            expect(onChange).toBeCalledWith(
                expect.objectContaining({
                    filterOption: expect.objectContaining({
                        type: "absoluteForm",
                    }),
                }),
            );
        });

        it("should not call onChange when the same type of preset is selected", () => {
            const onChange = vi.fn();
            const { getByText } = renderPresetSection({
                filter: buildSelectedFilter(STATIC_PERIOD_FILTER_OPTION),
                onChange,
            });

            fireEvent.click(getByText("Static period"));
            fireEvent.click(
                getByText((content, element) => {
                    // testing library hack: select option from dropdown, not dropdown "button" with the same text
                    const isPresetOption = element.className.includes("s-preset-absolute-form");
                    return isPresetOption && content.startsWith("Static period");
                }),
            );

            expect(onChange).not.toBeCalled();
        });

        it("should call onChange when selected static period filter is modified", () => {
            const onChange = vi.fn();
            const { getByLabelText, getByText } = renderPresetSection({
                filter: buildSelectedFilter({
                    ...STATIC_PERIOD_FILTER_OPTION,
                    from: "2021-04-22",
                    to: "2021-04-26",
                }),
                onChange,
            });

            fireEvent.click(getByLabelText("Start date"));
            fireEvent.click(getByText("24"));

            expect(onChange).toBeCalledWith(
                expect.objectContaining({
                    filterOption: expect.objectContaining({
                        type: "absoluteForm",
                        from: "2021-04-24",
                        to: "2021-04-26",
                    }),
                }),
            );
        });

        it("should call onChange when selected relative period filter is modified", () => {
            const onChange = vi.fn();
            const { getByText, getAllByPlaceholderText } = renderPresetSection({
                filter: buildSelectedFilter(RELATIVE_PERIOD_FILTER_OPTION),
                onChange,
            });

            fireEvent.change(getAllByPlaceholderText("Type or select")[0], changeEvent("2"));
            fireEvent.click(getByText("2 months ago"));

            expect(onChange).toBeCalledWith(
                expect.objectContaining({
                    filterOption: expect.objectContaining({
                        type: "relativeForm",
                        from: -2,
                        to: undefined,
                    }),
                }),
            );
        });
    });

    describe("onEdit", () => {
        it("is called when the user picks another period", () => {
            const onEdit = vi.fn();
            const { getByText } = renderPresetSection({ onEdit });

            fireEvent.click(getByText("All time"));
            fireEvent.click(getByText("Static period"));

            expect(onEdit).toHaveBeenCalledTimes(1);
        });

        it("is not called when an unsupported period resets itself", () => {
            const onChange = vi.fn();
            const onEdit = vi.fn();
            renderPresetSection({
                // year presets are not in Date3 mock dataset
                filter: buildSelectedFilter(RELATIVE_DATE_FILTER_PRESETS["GDC.time.year"][0]),
                onChange,
                onEdit,
            });

            expect(onChange).toHaveBeenCalled();
            expect(onEdit).not.toHaveBeenCalled();
        });
    });

    describe("Exclude current period", () => {
        it("should send preset as is with current period not excluded when checkbox is not clicked", () => {
            const onChange = vi.fn();
            const { getByText } = renderPresetSection({ onChange });

            fireEvent.click(getByText("All time"));
            fireEvent.click(getByText("Last 4 quarters"));

            expect(onChange).toBeCalledWith({
                filterOption: expect.objectContaining({
                    type: "relativePreset",
                    from: -3,
                    to: 0,
                }),
                excludeCurrentPeriod: false,
            });
        });

        it("should send preset with current period excluded when checkbox is clicked", () => {
            const onChange = vi.fn();
            const { queryByLabelText } = renderPresetSection({
                filter: buildSelectedFilter(
                    RELATIVE_DATE_FILTER_PRESETS["GDC.time.quarter"].find(
                        (p) => p.localIdentifier === "LAST_4_QUARTERS",
                    ),
                ),
                onChange,
            });

            fireEvent.click(queryByLabelText("Exclude this quarter"));

            expect(onChange).toBeCalledWith({
                filterOption: expect.objectContaining({
                    type: "relativePreset",
                    from: -3,
                    to: 0,
                }),
                excludeCurrentPeriod: true,
            });
        });
    });
});
