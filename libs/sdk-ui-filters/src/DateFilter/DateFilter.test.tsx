// (C) 2026 GoodData Corporation

import { fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type WeekStart } from "@gooddata/sdk-model";

import {
    clickAbsoluteFormFilter,
    clickApplyButton,
    clickCancelButton,
    clickDateFilterButton,
    clickExcludeCurrentPeriodCheckBox,
    clickRelativeFormFilter,
    clickStaticFilter,
    createDateFilter,
    getDateFilterButtonText,
    isDateFilterBodyVisible,
    isRelativeFormVisible,
    openRelativeFormFilter,
} from "./extendedDateFilters.test.helpers.js";
import { type DateFilterOption, type IUiAbsoluteDateFilterForm } from "./interfaces/index.js";

describe("DateFilter", () => {
    const weekFilter: IUiAbsoluteDateFilterForm = {
        type: "absoluteForm",
        localIdentifier: "ABSOLUTE_FORM",
        granularity: "GDC.time.week_us",
        from: "2026-04-05",
        to: "2026-04-11",
        name: "",
        visible: true,
    };

    it.each<WeekStart>(["Sunday", "Monday"])(
        "names an absolute week filter by its days on the button under a %s week start",
        (weekStart) => {
            createDateFilter({
                filterOptions: { absoluteForm: weekFilter },
                selectedFilterOption: weekFilter,
                isAbsoluteDateFilterGranularityEnabled: true,
                weekStart,
            });

            expect(getDateFilterButtonText()).toBe("04/05/2026 – 04/11/2026");
        },
    );

    it("steps back from a period form on Escape, and closes the filter on a second Escape", () => {
        createDateFilter();
        openRelativeFormFilter();
        const fromInput = document.querySelector(".s-relative-range-picker-from input");
        if (!(fromInput instanceof HTMLElement)) {
            throw new Error("the relative period form did not open");
        }

        fireEvent.keyDown(fromInput, { key: "Escape", code: "Escape" });

        expect(isRelativeFormVisible()).toBe(false);
        expect(isDateFilterBodyVisible()).toBe(true);

        const relativeFormButton = document.querySelector("button.s-relative-form-button");
        if (!(relativeFormButton instanceof HTMLElement)) {
            throw new Error("the option list did not come back");
        }
        fireEvent.keyDown(relativeFormButton, { key: "Escape", code: "Escape" });

        expect(isDateFilterBodyVisible()).toBe(false);
    });

    it.each([
        ["static", clickAbsoluteFormFilter, "button.s-absolute-form-button"],
        ["relative", clickRelativeFormFilter, "button.s-relative-form-button"],
    ])(
        "steps back from the %s period form on Cancel and restores the selection it was entered with",
        async (_form, openForm, openerSelector) => {
            const onApply = vi.fn<(option: DateFilterOption, excludeCurrentPeriod: boolean) => void>();
            const onCancel = vi.fn<() => void>();
            createDateFilter({ onApply, onCancel });
            clickDateFilterButton();
            clickStaticFilter("last-7-days");
            clickExcludeCurrentPeriodCheckBox();
            openForm();
            expect(document.querySelector(openerSelector)).toBeNull();

            clickCancelButton();

            expect(isDateFilterBodyVisible()).toBe(true);
            expect(onCancel).not.toHaveBeenCalled();
            await waitFor(() => expect(document.activeElement).toBe(document.querySelector(openerSelector)));

            clickApplyButton();
            expect(onApply).toHaveBeenCalledWith(
                expect.objectContaining({ localIdentifier: "LAST_7_DAYS" }),
                true,
            );
        },
    );

    it("drops Include empty values ticked in a period form on Cancel", () => {
        const onApply = vi.fn<(option: DateFilterOption, excludeCurrentPeriod: boolean) => void>();
        createDateFilter({ onApply, enableEmptyDateValues: true });
        clickDateFilterButton();
        clickStaticFilter("last-7-days");
        clickAbsoluteFormFilter();
        const includeEmptyValues = document.querySelector(
            ".gd-date-filter-empty-values-handling-toggle input",
        );
        if (!(includeEmptyValues instanceof HTMLElement)) {
            throw new Error("the static period form has no Include empty values checkbox");
        }
        fireEvent.click(includeEmptyValues);

        clickCancelButton();
        clickApplyButton();

        expect(onApply).toHaveBeenCalledWith(
            expect.objectContaining({ localIdentifier: "LAST_7_DAYS" }),
            false,
        );
        expect(onApply.mock.lastCall?.[0]).not.toHaveProperty("emptyValueHandling", "include");
    });

    it("discards all changes and closes the filter on Cancel in the option list", () => {
        const onApply = vi.fn<(option: DateFilterOption, excludeCurrentPeriod: boolean) => void>();
        const onCancel = vi.fn<() => void>();
        createDateFilter({ onApply, onCancel });
        clickDateFilterButton();
        clickStaticFilter("last-7-days");

        clickCancelButton();

        expect(isDateFilterBodyVisible()).toBe(false);
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onApply).not.toHaveBeenCalled();
    });

    it("closes the filter on Close in a period form when changes apply without Apply", () => {
        createDateFilter({ withoutApply: true });
        openRelativeFormFilter();

        const closeButton = document.querySelector(".s-date-filter-close");
        if (!(closeButton instanceof HTMLElement)) {
            throw new Error("the Close button is missing");
        }
        fireEvent.click(closeButton);

        expect(isDateFilterBodyVisible()).toBe(false);
    });
});
