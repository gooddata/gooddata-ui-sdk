// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type WeekStart } from "@gooddata/sdk-model";

import { createDateFilter, getDateFilterButtonText } from "./extendedDateFilters.test.helpers.js";
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
});
