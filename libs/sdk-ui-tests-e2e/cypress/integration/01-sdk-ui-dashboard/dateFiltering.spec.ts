// (C) 2023-2025 GoodData Corporation

import { DateFilter } from "../../tools/dateFilter";
import { EditMode } from "../../tools/editMode";
import { DateFilterValue } from "../../tools/enum/DateFilterValue";
import { Kpi } from "../../tools/kpi";
import * as Navigation from "../../tools/navigation";

const dateFilter = new DateFilter();
const editMode = new EditMode();

describe("Date filtering", () => {
    it(
        "verify date filter default state",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            Navigation.visit("dashboard/new-dashboard");
            dateFilter.subtitleHasValue(DateFilterValue.THIS_MONTH);
        },
    );

    it(
        "should update date filter value correctly",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            Navigation.visit("dashboard/dashboard-many-rows-columns");
            dateFilter.subtitleHasValue(DateFilterValue.ALL_TIME);
            dateFilter
                .openAndSelectDateFilterByName(DateFilterValue.THIS_YEAR)
                .apply()
                .subtitleHasValue(DateFilterValue.THIS_YEAR);
        },
    );

    it("should display message on the top date filter panel", { tags: "checklist_integrated_tiger" }, () => {
        Navigation.visit("dashboard/dashboard-many-rows-columns");
        dateFilter.open().isDateFilterMessageVisibled(false).cancel();
        editMode.edit().isInEditMode(true);
        dateFilter.open().isDateFilterMessageVisibled(true);
    });

    it(
        "should reset the selected date filter on view mode when open edit mode",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            Navigation.visit("dashboard/dashboard-many-rows-columns");
            dateFilter
                .openAndSelectDateFilterByName(DateFilterValue.THIS_YEAR)
                .apply()
                .subtitleHasValue(DateFilterValue.THIS_YEAR);
            editMode.edit().isInEditMode(true);
            dateFilter.subtitleHasValue(DateFilterValue.ALL_TIME);
        },
    );

    it(
        "should display the selected date interval correctly",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            Navigation.visitCopyOf("dashboard/dashboard-many-rows-columns");

            const dateFilterValues = [
                DateFilterValue.THIS_MONTH,
                DateFilterValue.THIS_YEAR,
                DateFilterValue.ALL_TIME,
            ];

            dateFilterValues.forEach((dateFilterValue) => {
                editMode.edit();
                dateFilter
                    .waitDateFilterButtonVisible()
                    .openAndSelectDateFilterByName(dateFilterValue)
                    .apply();
                editMode.saveButtonEnabled(true).save(true);
                dateFilter.open().hasSelectedDateFilterValue(dateFilterValue);
            });
        },
    );

    it.skip("should select date filter by preset", { tags: "checklist_integrated_bear" }, () => {
        Navigation.visit("dashboard/for-date-filter");

        const dateFilterValues = [
            DateFilterValue.ALL_TIME,
            DateFilterValue.LAST_7_DAYS,
            DateFilterValue.LAST_30_DAYS,
            DateFilterValue.LAST_90_DAYS,
            DateFilterValue.THIS_MONTH,
            DateFilterValue.LAST_MONTH,
            DateFilterValue.LAST_12_MONTHS,
            DateFilterValue.THIS_QUARTER,
            DateFilterValue.LAST_QUARTER,
            DateFilterValue.LAST_4_QUARTERS,
            DateFilterValue.THIS_YEAR,
            DateFilterValue.LAST_YEAR,
        ];
        editMode.edit().isInEditMode(true);
        dateFilterValues.forEach((dateFilterValue) => {
            dateFilter.openAndSelectDateFilterByName(dateFilterValue).apply();
            new Kpi(".s-dash-item-0").isEmptyValue();
        });
    });
});
