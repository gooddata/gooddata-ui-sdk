// (C) 2019-2026 GoodData Corporation

import { useState } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IAllTimeDateFilterOption, type WeekStart } from "@gooddata/sdk-model";
import { withIntlForTest } from "@gooddata/sdk-ui";

import { DEFAULT_DATE_FORMAT } from "../constants/Platform.js";
import {
    DateFilterButtonLocalized,
    type IDateFilterButtonLocalizedProps,
} from "../DateFilterButtonLocalized/DateFilterButtonLocalized.js";
import { type IUiAbsoluteDateFilterForm, type IUiRelativeDateFilterForm } from "../interfaces/index.js";

import { DateFilterBody, type IDateFilterBodyProps } from "./DateFilterBody.js";

describe("ExtendedDateFilterBody", () => {
    const allTime: IAllTimeDateFilterOption = {
        type: "allTime",
        localIdentifier: "ALL_TIME",
        name: "",
        visible: true,
    };

    const createDateFilterButton = (props?: Partial<IDateFilterButtonLocalizedProps>) => {
        const defaultProps: IDateFilterButtonLocalizedProps = {
            isMobile: false,
            dateFilterOption: allTime,
            dateFormat: DEFAULT_DATE_FORMAT,
        };
        return <DateFilterButtonLocalized {...defaultProps} {...props} />;
    };

    const last7Days = {
        from: -6,
        to: 0,
        granularity: "GDC.time.date",
        localIdentifier: "LAST_7_DAYS",
        type: "relativePreset",
        visible: true,
        name: "",
    } satisfies IDateFilterBodyProps["selectedFilterOption"];

    const renderDateFilterBody = (props?: Partial<IDateFilterBodyProps>) => {
        const mockProps: IDateFilterBodyProps = {
            filterOptions: {},
            dateFilterButton: createDateFilterButton(),
            dateFormat: DEFAULT_DATE_FORMAT,
            selectedFilterOption: allTime,
            onSelectedFilterOptionChange: vi.fn(),

            excludeCurrentPeriod: false,
            hideDisabledExclude: false,
            isExcludeCurrentPeriodEnabled: false,
            onExcludeCurrentPeriodChange: vi.fn(),

            availableGranularities: [],
            isEditMode: false,
            isMobile: false,
            isTimeForAbsoluteRangeEnabled: true,

            onApplyClick: vi.fn(),
            onCancelClick: vi.fn(),
            closeDropdown: vi.fn(),
        } as unknown as IDateFilterBodyProps;
        const Wrapped = withIntlForTest(DateFilterBody);
        return render(<Wrapped {...mockProps} {...props} />);
    };

    /**
     * Unlike `renderDateFilterBody`, wires `onSelectedFilterOptionChange` back into real state so a
     * granularity-tab click actually re-renders `AbsoluteDateFilterForm` with the new `selectedFilterOption` -
     * needed to exercise `PeriodRangePicker`'s `key={selectedGranularity}` remount.
     */
    const renderStatefulDateFilterBody = (
        props: Partial<IDateFilterBodyProps> & {
            selectedFilterOption: IDateFilterBodyProps["selectedFilterOption"];
        },
    ) => {
        function StatefulDateFilterBody() {
            const [selectedFilterOption, setSelectedFilterOption] = useState(props.selectedFilterOption);
            const mockProps: IDateFilterBodyProps = {
                filterOptions: {},
                dateFilterButton: createDateFilterButton(),
                dateFormat: DEFAULT_DATE_FORMAT,
                onSelectedFilterOptionChange: setSelectedFilterOption,

                excludeCurrentPeriod: false,
                hideDisabledExclude: false,
                isExcludeCurrentPeriodEnabled: false,
                onExcludeCurrentPeriodChange: vi.fn(),

                availableGranularities: [],
                isEditMode: false,
                isMobile: false,
                isTimeForAbsoluteRangeEnabled: true,

                onApplyClick: vi.fn(),
                onCancelClick: vi.fn(),
                closeDropdown: vi.fn(),
            } as unknown as IDateFilterBodyProps;
            return <DateFilterBody {...mockProps} {...props} selectedFilterOption={selectedFilterOption} />;
        }
        const Wrapped = withIntlForTest(StatefulDateFilterBody);
        return render(<Wrapped />);
    };

    it("should render the Exclude checkbox when enabled", () => {
        renderDateFilterBody({ selectedFilterOption: last7Days, isExcludeCurrentPeriodEnabled: true });
        expect(screen.getByRole("checkbox", { name: /Exclude/ })).not.toBeDisabled();
    });

    it("should render the Exclude checkbox as disabled when isExcludeCurrentPeriodEnabled=false", () => {
        renderDateFilterBody({ selectedFilterOption: last7Days, isExcludeCurrentPeriodEnabled: false });
        expect(screen.getByRole("checkbox", { name: /Exclude/ })).toBeDisabled();
    });

    it("should not render the Exclude checkbox when hideDisabledExclude=true and isExcludeCurrentPeriodEnabled=false", () => {
        renderDateFilterBody({
            selectedFilterOption: last7Days,
            hideDisabledExclude: true,
            isExcludeCurrentPeriodEnabled: false,
        });
        expect(screen.queryByRole("checkbox", { name: /Exclude/ })).toBeNull();
    });

    it("should not render the Exclude checkbox on mobile when it is disabled (backwards compatible)", () => {
        renderDateFilterBody({
            selectedFilterOption: last7Days,
            isMobile: true,
            isExcludeCurrentPeriodEnabled: false,
        });
        expect(screen.queryByRole("checkbox", { name: /Exclude/ })).toBeNull();
    });

    it("should display edit mode message in edit mode", () => {
        renderDateFilterBody({ isEditMode: true });
        expect(screen.queryByText("Set default date filter for viewers:")).toBeInTheDocument();
    });

    it("should not display edit mode message in normal mode", () => {
        renderDateFilterBody({ isEditMode: false });
        expect(screen.queryByText("Set default date filter for viewers:")).not.toBeInTheDocument();
    });

    describe("absolute form granularities", () => {
        const absoluteForm: IUiAbsoluteDateFilterForm = {
            localIdentifier: "ABSOLUTE_FORM",
            type: "absoluteForm",
            name: "",
            visible: true,
            availableGranularities: [
                "GDC.time.date",
                "GDC.time.week_us",
                "GDC.time.month",
                "GDC.time.quarter",
                "GDC.time.year",
            ],
        };

        it("should not render granularity tabs when isAbsoluteDateFilterGranularityEnabled is not set", () => {
            renderDateFilterBody({
                filterOptions: { absoluteForm },
                selectedFilterOption: absoluteForm,
            });

            fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

            expect(document.querySelector(".s-absolute-filter-form-granularity-tabs")).toBeNull();
        });

        it("should not reset granularity or clear from/to when isAbsoluteDateFilterGranularityEnabled is not set, even if availableGranularities lacks the implied granularity", () => {
            const formWithoutDateGranularity: IUiAbsoluteDateFilterForm = {
                ...absoluteForm,
                availableGranularities: ["GDC.time.month", "GDC.time.quarter"],
                from: "2026-03-01",
                to: "2026-03-31",
            };
            const onSelectedFilterOptionChange = vi.fn();

            renderDateFilterBody({
                filterOptions: { absoluteForm: formWithoutDateGranularity },
                selectedFilterOption: formWithoutDateGranularity,
                onSelectedFilterOptionChange,
            });

            fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

            expect(onSelectedFilterOptionChange).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    from: undefined,
                    to: undefined,
                }),
            );
        });

        it("should still offer Month/Quarter/Year even when the fiscal tab is the default (fiscal calendar active)", () => {
            renderDateFilterBody({
                filterOptions: {
                    absoluteForm,
                    relativePreset: {
                        "GDC.time.fiscal_year": [
                            {
                                from: 0,
                                to: 0,
                                granularity: "GDC.time.fiscal_year",
                                localIdentifier: "THIS_FISCAL_YEAR",
                                type: "relativePreset",
                                name: "",
                                visible: true,
                            },
                        ],
                        "GDC.time.year": [
                            {
                                from: 0,
                                to: 0,
                                granularity: "GDC.time.year",
                                localIdentifier: "THIS_YEAR",
                                type: "relativePreset",
                                name: "",
                                visible: true,
                            },
                        ],
                    },
                },
                selectedFilterOption: absoluteForm,
                isAbsoluteDateFilterGranularityEnabled: true,
                activeCalendars: { standard: true, fiscal: true, default: "FISCAL" },
            } as Partial<IDateFilterBodyProps>);

            fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

            expect(document.querySelector(".s-granularity-month")).not.toBeNull();
            expect(document.querySelector(".s-granularity-quarter")).not.toBeNull();
            expect(document.querySelector(".s-granularity-year")).not.toBeNull();
        });

        it("should reset to the first available granularity and clear from/to when reopening after the selected granularity was hidden", () => {
            const staleSelection: IUiAbsoluteDateFilterForm = {
                ...absoluteForm,
                availableGranularities: ["GDC.time.date", "GDC.time.week_us", "GDC.time.year"],
                granularity: "GDC.time.month",
                from: "2026-03-01",
                to: "2026-03-31",
            };
            const onSelectedFilterOptionChange = vi.fn();

            renderDateFilterBody({
                filterOptions: { absoluteForm: staleSelection },
                selectedFilterOption: staleSelection,
                onSelectedFilterOptionChange,
                isAbsoluteDateFilterGranularityEnabled: true,
            } as Partial<IDateFilterBodyProps>);

            fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

            expect(onSelectedFilterOptionChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    granularity: "GDC.time.date",
                    from: undefined,
                    to: undefined,
                }),
            );
        });

        it("does not navigate back to the option list when ArrowLeft is pressed inside a PeriodRangePicker field", async () => {
            renderDateFilterBody({
                filterOptions: { absoluteForm },
                selectedFilterOption: absoluteForm,
                isAbsoluteDateFilterGranularityEnabled: true,
            });

            fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

            // PeriodRangePicker is lazy-loaded (see PeriodRangePicker.tsx), so its <input>s mount asynchronously.
            const input = await waitFor(() => {
                const element = document.querySelector<HTMLInputElement>(".rc-picker input");
                expect(element).toBeInTheDocument();
                return element as HTMLInputElement;
            });
            input.focus();

            const notPrevented = fireEvent.keyDown(input, { key: "ArrowLeft", code: "ArrowLeft" });

            // dispatchEvent returns false only if some listener called preventDefault() - this proves no
            // ancestor (DateFilterBody's own "back" handler included) swallowed the native caret-move action.
            expect(notPrevented).toBe(true);
            // still inside the form, not back at the top-level option list.
            expect(document.querySelector(".s-period-range-picker")).toBeInTheDocument();
        });

        describe("PeriodRangePicker validity gates the real Apply button", () => {
            const filledAbsoluteForm: IUiAbsoluteDateFilterForm = {
                ...absoluteForm,
                from: "2026-03-01",
                to: "2026-03-10",
            };

            it("disables Apply while a field is garbled, and blocks the click while disabled", async () => {
                const onApplyClick = vi.fn();
                renderDateFilterBody({
                    filterOptions: { absoluteForm: filledAbsoluteForm },
                    selectedFilterOption: filledAbsoluteForm,
                    isAbsoluteDateFilterGranularityEnabled: true,
                    onApplyClick,
                });

                fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

                const startInput = await waitFor(() => {
                    const element = document.querySelector<HTMLInputElement>(".rc-picker input");
                    expect(element).toBeInTheDocument();
                    return element as HTMLInputElement;
                });

                const applyButton = document.querySelector(".s-date-filter-apply")!;
                expect(applyButton).toHaveAttribute("aria-disabled", "false");

                fireEvent.focus(startInput);
                fireEvent.change(startInput, { target: { value: "garbage" } });

                expect(applyButton).toHaveAttribute("aria-disabled", "true");

                fireEvent.click(applyButton);
                expect(onApplyClick).not.toHaveBeenCalled();
            });

            it("resets validity once the picker remounts on a granularity-tab switch, even while a field was garbled", async () => {
                renderStatefulDateFilterBody({
                    filterOptions: { absoluteForm: filledAbsoluteForm },
                    selectedFilterOption: filledAbsoluteForm,
                    isAbsoluteDateFilterGranularityEnabled: true,
                });

                fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

                const startInput = await waitFor(() => {
                    const element = document.querySelector<HTMLInputElement>(".rc-picker input");
                    expect(element).toBeInTheDocument();
                    return element as HTMLInputElement;
                });

                const applyButton = document.querySelector(".s-date-filter-apply")!;
                fireEvent.focus(startInput);
                fireEvent.change(startInput, { target: { value: "garbage" } });
                expect(applyButton).toHaveAttribute("aria-disabled", "true");

                // Switching granularity remounts PeriodRangePicker (key={selectedGranularity} in
                // AbsoluteDateFilterForm.tsx), unmounting the garbled instance - its cleanup effect must reset
                // validity rather than leaving Apply permanently disabled by a now-gone picker's last report.
                const monthTab = document.querySelector<HTMLElement>(".s-granularity-month")!;
                fireEvent.click(monthTab);

                // The new granularity starts with a cleared, blank range (handleGranularityChange resets
                // from/to on a real switch) - correctly invalid on its own terms, so Apply stays disabled for
                // that reason, not because of the old, already-unmounted picker's stale report.
                await waitFor(() => {
                    const newStartInput = document.querySelector<HTMLInputElement>(".rc-picker input");
                    expect(newStartInput).toBeInTheDocument();
                    expect(newStartInput!.value).toBe("");
                });
                expect(applyButton).toHaveAttribute("aria-disabled", "true");

                // Typing a complete, valid range into the freshly mounted picker proves it - not a stale
                // leftover "false" - is what's now driving validity, and that it reports correctly on its own.
                const [newStartInput, newEndInput] = Array.from(
                    document.querySelectorAll<HTMLInputElement>(".rc-picker input"),
                );
                fireEvent.focus(newStartInput);
                fireEvent.change(newStartInput, { target: { value: "3/2026" } });
                fireEvent.keyDown(newStartInput, { key: "Tab", code: "Tab" });
                fireEvent.blur(newStartInput);
                fireEvent.focus(newEndInput);
                fireEvent.change(newEndInput, { target: { value: "6/2026" } });
                fireEvent.keyDown(newEndInput, { key: "Enter", code: "Enter" });

                await waitFor(() => {
                    expect(applyButton).toHaveAttribute("aria-disabled", "false");
                });
            });
        });

        it("moves focus between granularity tabs with ArrowLeft/ArrowRight without navigating back to the option list", () => {
            renderDateFilterBody({
                filterOptions: { absoluteForm },
                selectedFilterOption: absoluteForm,
                isAbsoluteDateFilterGranularityEnabled: true,
            });

            fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

            // Tabs render in canonical coarse-to-fine order: year, quarter, month, week, day.
            const monthTab = document.querySelector<HTMLElement>(".s-granularity-month");
            expect(monthTab).toBeInTheDocument();
            monthTab!.focus();

            fireEvent.keyDown(monthTab!, { key: "ArrowRight", code: "ArrowRight" });
            expect(document.activeElement).toHaveClass("s-granularity-week");
            expect(document.querySelector(".s-absolute-filter-form-granularity-tabs")).toBeInTheDocument();

            fireEvent.keyDown(document.activeElement as HTMLElement, {
                key: "ArrowLeft",
                code: "ArrowLeft",
            });
            expect(document.activeElement).toHaveClass("s-granularity-month");
            expect(document.querySelector(".s-absolute-filter-form-granularity-tabs")).toBeInTheDocument();
        });

        it("jumps to the selected granularity tab with Home/End without navigating back to the option list", () => {
            renderDateFilterBody({
                filterOptions: { absoluteForm },
                selectedFilterOption: absoluteForm,
                isAbsoluteDateFilterGranularityEnabled: true,
            });

            fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

            // Roving tabindex is keyed off the *selected* granularity (day, by default here), not the
            // currently focused tab - so Home/End both land on it, same as in the relative form.
            const quarterTab = document.querySelector<HTMLElement>(".s-granularity-quarter");
            expect(quarterTab).toBeInTheDocument();
            quarterTab!.focus();

            fireEvent.keyDown(quarterTab!, { key: "End", code: "End" });
            expect(document.activeElement).toHaveClass("s-granularity-day");
            expect(document.querySelector(".s-absolute-filter-form-granularity-tabs")).toBeInTheDocument();

            quarterTab!.focus();
            fireEvent.keyDown(quarterTab!, { key: "Home", code: "Home" });
            expect(document.activeElement).toHaveClass("s-granularity-day");
            expect(document.querySelector(".s-absolute-filter-form-granularity-tabs")).toBeInTheDocument();
        });
    });

    describe("relative form", () => {
        const relativeForm: IUiRelativeDateFilterForm = {
            localIdentifier: "RELATIVE_FORM",
            type: "relativeForm",
            name: "",
            visible: true,
            granularity: "GDC.time.date",
        };

        it("does not let ArrowLeft/ArrowRight/Home/End in a DynamicSelect field reach the granularity-tabs handler", () => {
            renderDateFilterBody({
                filterOptions: { relativeForm },
                selectedFilterOption: relativeForm,
                availableGranularities: ["GDC.time.date", "GDC.time.month", "GDC.time.quarter"],
            });

            fireEvent.click(screen.getByRole("button", { name: /Relative period/i }));

            const fromInput = document.querySelector<HTMLInputElement>(".s-relative-range-input")!;
            expect(fromInput).toBeInTheDocument();
            fromInput.focus();

            for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) {
                const notPrevented = fireEvent.keyDown(fromInput, { key, code: key });
                // dispatchEvent returns false only if some listener called preventDefault() - proves the
                // granularity-tabs handler (which would otherwise move focus away to a tab) never saw the event.
                expect(notPrevented).toBe(true);
            }

            // focus never left the input - the outer roving-tabindex handler did not steal it.
            expect(document.activeElement).toBe(fromInput);
        });

        // Mirrors the absolute form's own ArrowLeft/ArrowRight and Home/End cases above - both forms are
        // wired to the same keydown-handler-building hook, so the same behavior must hold for both.
        it("moves focus between granularity tabs with ArrowLeft/ArrowRight without navigating back to the option list", () => {
            renderDateFilterBody({
                filterOptions: { relativeForm },
                selectedFilterOption: relativeForm,
                availableGranularities: ["GDC.time.date", "GDC.time.month", "GDC.time.quarter"],
            });

            fireEvent.click(screen.getByRole("button", { name: /Relative period/i }));

            // Tabs render in canonical coarse-to-fine order: quarter, month, day.
            const monthTab = document.querySelector<HTMLElement>(".s-granularity-month");
            expect(monthTab).toBeInTheDocument();
            monthTab!.focus();

            fireEvent.keyDown(monthTab!, { key: "ArrowRight", code: "ArrowRight" });
            expect(document.activeElement).toHaveClass("s-granularity-day");
            expect(document.querySelector(".s-relative-filter-form-granularity-tabs")).toBeInTheDocument();

            fireEvent.keyDown(document.activeElement as HTMLElement, {
                key: "ArrowLeft",
                code: "ArrowLeft",
            });
            expect(document.activeElement).toHaveClass("s-granularity-month");
            expect(document.querySelector(".s-relative-filter-form-granularity-tabs")).toBeInTheDocument();
        });

        it("jumps to the selected granularity tab with Home/End without navigating back to the option list", () => {
            renderDateFilterBody({
                filterOptions: { relativeForm },
                selectedFilterOption: relativeForm,
                availableGranularities: ["GDC.time.date", "GDC.time.month", "GDC.time.quarter"],
            });

            fireEvent.click(screen.getByRole("button", { name: /Relative period/i }));

            // Roving tabindex is keyed off the *selected* granularity (day, by default here), not the
            // currently focused tab - same as in the absolute form.
            const quarterTab = document.querySelector<HTMLElement>(".s-granularity-quarter");
            expect(quarterTab).toBeInTheDocument();
            quarterTab!.focus();

            fireEvent.keyDown(quarterTab!, { key: "End", code: "End" });
            expect(document.activeElement).toHaveClass("s-granularity-day");
            expect(document.querySelector(".s-relative-filter-form-granularity-tabs")).toBeInTheDocument();

            quarterTab!.focus();
            fireEvent.keyDown(quarterTab!, { key: "Home", code: "Home" });
            expect(document.activeElement).toHaveClass("s-granularity-day");
            expect(document.querySelector(".s-relative-filter-form-granularity-tabs")).toBeInTheDocument();
        });
    });

    // A layer dropping the week start would turn the label back into a day range with the suite still green.
    describe("date filter button title for a week-granularity absolute filter", () => {
        const weekFilter: IUiAbsoluteDateFilterForm = {
            type: "absoluteForm",
            localIdentifier: "ABSOLUTE_FORM",
            granularity: "GDC.time.week_us",
            from: "2026-04-05",
            to: "2026-04-11",
            name: "",
            visible: true,
        };

        function DateFilterButtonUnderTest(props: Partial<IDateFilterButtonLocalizedProps>) {
            return createDateFilterButton({ dateFilterOption: weekFilter, ...props });
        }

        const renderButton = (weekStart?: WeekStart) => {
            const Wrapped = withIntlForTest(DateFilterButtonUnderTest);
            return render(<Wrapped weekStart={weekStart} />);
        };

        // These dates are one whole week under a Sunday start and two under a Monday one.
        it("should label the week according to a Sunday week start", () => {
            renderButton("Sunday");
            expect(screen.getByText("Week 15/2026")).toBeInTheDocument();
        });

        it("should label the same dates differently under a Monday week start", () => {
            renderButton("Monday");
            expect(screen.getByText("Week 14/2026 \u2013 Week 15/2026")).toBeInTheDocument();
        });

        it("should fall back to the day range when no week start reaches the button", () => {
            renderButton();
            expect(screen.getByText("04/05/2026 \u2013 04/11/2026")).toBeInTheDocument();
            expect(screen.queryByText(/^Week /)).not.toBeInTheDocument();
        });
    });

    describe("calculateHeight", () => {
        const resizeWindow = (x: number, y: number) => {
            window.innerWidth = x;
            window.innerHeight = y;
        };

        const getBodyWrapper = () => {
            return document.querySelector(".gd-extended-date-filter-body-wrapper");
        };

        const getBodyScroller = () => {
            const bodyScrollerClass =
                window.innerHeight <= 640
                    ? ".gd-extended-date-filter-body-scrollable-small-screen"
                    : ".gd-extended-date-filter-body-scrollable";
            return document.querySelector(bodyScrollerClass);
        };

        it("should not resize body wrapper and scroller", () => {
            renderDateFilterBody({ isEditMode: false });
            expect(getBodyWrapper()).not.toHaveAttribute("style");
            expect(getBodyScroller()).not.toHaveAttribute("style");
        });

        it("should resize body wrapper and scroller in horizontal mobile layout", () => {
            resizeWindow(896, 414);
            renderDateFilterBody({ isEditMode: false });
            expect(getBodyWrapper()).toHaveStyle("display: block; height: 323px");
            expect(getBodyScroller()).toHaveStyle("min-height: 323px");
        });

        it("should resize body wrapper and scroller in horizontal mobile layout when exclude is hidden", () => {
            resizeWindow(896, 414);
            renderDateFilterBody({ isEditMode: false, hideDisabledExclude: true });
            expect(getBodyWrapper()).toHaveStyle("display: block; height: 353px");
            expect(getBodyScroller()).toHaveStyle("min-height: 353px");
        });
    });
});
