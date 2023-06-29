// (C) 2019-2020 GoodData Corporation
import { newAbsoluteDateFilter, newAllTimeFilter, newRelativeDateFilter } from "@gooddata/sdk-model";
import { describe, it, expect } from "vitest";

import { createInternalIntl } from "../../../../../../localization/index.js";
import { getKpiPopLabel } from "../translations.js";

const allTimeFilter = newAllTimeFilter("foo");
const absoluteFilter = newAbsoluteDateFilter("foo", "2019-01-01", "2019-02-01");
const relativeFilter = newRelativeDateFilter("foo", "GDC.time.date", -5, 5);

const intl = createInternalIntl();

describe("getKpiPopLabel", () => {
    it("should return the correct popLabel for lastYear comparison", () => {
        const actual = getKpiPopLabel(allTimeFilter, "lastYear", intl);
        expect(actual).toEqual("prev. year");
    });

    describe("previousPeriod comparison", () => {
        it("should return the correct popLabel for no filter", () => {
            const actual = getKpiPopLabel(undefined, "previousPeriod", intl);
            expect(actual).toEqual("prev. period");
        });

        it("should return the correct popLabel for allTime filter", () => {
            const actual = getKpiPopLabel(allTimeFilter, "previousPeriod", intl);
            expect(actual).toEqual("prev. period");
        });

        it("should return the correct popLabel for absolute filter", () => {
            const actual = getKpiPopLabel(absoluteFilter, "previousPeriod", intl);
            expect(actual).toEqual("prev. period");
        });

        it("should return the correct popLabel for relative filter", () => {
            const actual = getKpiPopLabel(relativeFilter, "previousPeriod", intl);
            expect(actual).toEqual("prev. 11d");
        });
    });
});
