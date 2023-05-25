// (C) 2007-2021 GoodData Corporation
import isUndefined from "lodash/isUndefined.js";
import omitBy from "lodash/omitBy.js";
import { describe, it, expect } from "vitest";

import { getFilterLabelFilter } from "../filterUtils.js";
import { IBrokenAlertDateFilter, IBrokenAlertAttributeFilter } from "../../../../types.js";

describe("getFilterLabelFilter", () => {
    const pickDefined = (obj: object) => omitBy(obj, isUndefined);

    describe("item should be converted to AD-FilterLabel compatible format", () => {
        it("should convert date filter item", () => {
            const title = "Date (Created)";
            const dateItemTitle = "This year";

            const item: IBrokenAlertDateFilter = {
                type: "date",
                brokenType: "deleted",
                dateFilterTitle: dateItemTitle,
                title,
            };

            const filterLabel = getFilterLabelFilter(item);

            expect(pickDefined(filterLabel)).toEqual({
                title,
                selection: dateItemTitle,
                isDate: true,
                isAllSelected: false,
            });
        });

        it("should convert attribute filter item", () => {
            const title = "Education";
            const bachelor = "Bachelor";
            const graduate = "Graduate";
            const count = 1000;
            const isAll = false;

            const item: IBrokenAlertAttributeFilter = {
                type: "attribute",
                brokenType: "deleted",
                isAllSelected: isAll,
                selection: `${bachelor}, ${graduate}`,
                selectionSize: count,
                title,
            };

            const filterLabel = getFilterLabelFilter(item);

            expect(pickDefined(filterLabel)).toEqual({
                title,
                selection: `${bachelor}, ${graduate}`,
                isAllSelected: isAll,
                isDate: false,
                selectionSize: count,
            });
        });
    });
});
