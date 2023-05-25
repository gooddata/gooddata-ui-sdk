// (C) 2021-2022 GoodData Corporation
import { IRelativeDateFilterPreset } from "@gooddata/sdk-model";
import { IUiRelativeDateFilterForm } from "../../interfaces/index.js";
import { normalizeSelectedFilterOption } from "../FilterOptionNormalization.js";

describe("normalizeSelectedFilterOption", () => {
    const sampleFloatingRangeFormOption: IUiRelativeDateFilterForm = {
        from: -2,
        to: 0,
        granularity: "GDC.time.date",
        localIdentifier: "RELATIVE_FORM",
        type: "relativeForm",
        name: "",
        visible: true,
    };

    const sampleUnsortedFloatingRangeFormOption: IUiRelativeDateFilterForm = {
        from: 99,
        to: -2,
        granularity: "GDC.time.date",
        localIdentifier: "RELATIVE_FORM",
        type: "relativeForm",
        name: "",
        visible: true,
    };

    const sampleFloatingRangePresetOption: IRelativeDateFilterPreset = {
        from: -11,
        to: 0,
        granularity: "GDC.time.month",
        localIdentifier: "LAST_12_MONTHS",
        type: "relativePreset",
        name: "",
        visible: true,
    };

    it("should sort floating range from and to fields", () => {
        const normalizedOption: IUiRelativeDateFilterForm = normalizeSelectedFilterOption(
            sampleUnsortedFloatingRangeFormOption,
        ) as any;
        expect(normalizedOption.from < normalizedOption.to).toBe(true);
    });

    it("should not update floating range from and to fields if already in correct order", () => {
        const actual = normalizeSelectedFilterOption(sampleFloatingRangeFormOption);
        expect(actual).toBe(sampleFloatingRangeFormOption);
    });

    it("should leave other options as is", () => {
        const actual = normalizeSelectedFilterOption(sampleFloatingRangePresetOption);
        expect(actual).toBe(sampleFloatingRangePresetOption);
    });
});
