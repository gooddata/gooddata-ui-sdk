// (C) 2026 GoodData Corporation

import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type WeekStart } from "@gooddata/sdk-model";

import {
    createDateFilter,
    getDateFilterButtonText,
    isDateFilterBodyVisible,
    isRelativeFormVisible,
    openRelativeFormFilter,
} from "./extendedDateFilters.test.helpers.js";
import { type IUiAbsoluteDateFilterForm } from "./interfaces/index.js";

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
});
