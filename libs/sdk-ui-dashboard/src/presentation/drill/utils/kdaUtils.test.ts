// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { createInternalIntl } from "../../localization/createInternalIntl.js";

import { getKdaKeyDriverCombinations, getKeyDriverCombinationItemTitle } from "./kdaUtils.js";
import { createDrillEvent, keyDriverAnalysis } from "./kdaUtils.test.helpers.js";

function getCombinations(
    stacked: boolean,
    yearIndex: number,
    isMeasureDisabled?: (localIdentifier: string) => boolean,
) {
    return getKdaKeyDriverCombinations(
        keyDriverAnalysis,
        createDrillEvent(stacked, yearIndex),
        false,
        isMeasureDisabled,
    ).map((combination) => ({
        measure: combination.measure.measureHeaderItem.localIdentifier,
        where: combination.where,
        values: combination.values,
        range: combination.range.map((scope) => scope.header.attributeHeaderItem.name),
    }));
}
describe("getKdaKeyDriverCombinations", () => {
    describe.each([
        ["measures and dates in separate dimensions", false],
        ["measures interleaved with dates in one dimension", true],
    ])("with %s", (_, stacked) => {
        it("compares the clicked measure with the previous and next date", () => {
            expect(getCombinations(stacked, 1)).toEqual([
                {
                    measure: "height",
                    where: "before",
                    values: [87277.8, 14086.3],
                    range: ["2011", "2012"],
                },
                {
                    measure: "height",
                    where: "after",
                    values: [14086.3, 20000],
                    range: ["2012", "2013"],
                },
            ]);
        });

        it("offers no previous date for the first date", () => {
            expect(getCombinations(stacked, 0).map((combination) => combination.where)).toEqual(["after"]);
        });

        it("offers no next date for the last date", () => {
            expect(getCombinations(stacked, 2).map((combination) => combination.where)).toEqual(["before"]);
        });

        it("analyses the width measure when key driver analysis is disabled on the height measure", () => {
            expect(getCombinations(stacked, 1, (localIdentifier) => localIdentifier === "height")).toEqual([
                {
                    measure: "width",
                    where: "before",
                    values: [894271, 1532324],
                    range: ["2011", "2012"],
                },
                {
                    measure: "width",
                    where: "after",
                    values: [1532324, 1600000],
                    range: ["2012", "2013"],
                },
            ]);
        });
    });

    it("analyses the first measure of the intersection on other charts", () => {
        const mekkoEvent = createDrillEvent(false, 1);
        const columnEvent = {
            ...mekkoEvent,
            type: "column" as const,
            drillContext: { ...mekkoEvent.drillContext, type: "column" as const },
        };

        expect(
            getKdaKeyDriverCombinations(keyDriverAnalysis, columnEvent).map(
                (combination) => combination.measure.measureHeaderItem.localIdentifier,
            ),
        ).toEqual(["width", "width"]);
    });

    it("labels a decrease of the clicked measure as a drop", () => {
        const intl = createInternalIntl();
        const [after] = getKdaKeyDriverCombinations(keyDriverAnalysis, createDrillEvent(false, 0));

        expect(getKeyDriverCombinationItemTitle(intl, after)).toBe("Drop in 2012");
    });
});
