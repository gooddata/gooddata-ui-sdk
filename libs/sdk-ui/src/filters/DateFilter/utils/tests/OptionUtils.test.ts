// (C) 2019 GoodData Corporation
import { getDateFilterOptionGranularity } from "../OptionUtils";
import { absoluteFormFilter, relativePresetFilter } from "../Translations/tests/fixtures";

describe("optionUtils", () => {
    describe("getDateFilterOptionGranularity", () => {
        it("should return date filter value", () => {
            expect(getDateFilterOptionGranularity(absoluteFormFilter)).toEqual(undefined);
            expect(getDateFilterOptionGranularity(relativePresetFilter)).toEqual("GDC.time.date");
        });
    });
});
