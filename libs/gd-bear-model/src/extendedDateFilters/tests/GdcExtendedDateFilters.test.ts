// (C) 2019 GoodData Corporation
import { GdcExtendedDateFilters } from "../GdcExtendedDateFilters";

describe("GdcExtendedDateFilters", () => {
    const absoluteForm: GdcExtendedDateFilters.IAbsoluteDateFilterForm = {
        from: "2000-01-01",
        localIdentifier: "foo",
        to: "2020-01-01",
        type: "absoluteForm",
        name: "Absolute Form",
        visible: true,
    };

    const absolutePreset: GdcExtendedDateFilters.IAbsoluteDateFilterPreset = {
        from: "2000-01-01",
        localIdentifier: "foo",
        name: "bar",
        to: "2020-01-01",
        type: "absolutePreset",
        visible: true,
    };

    const relativeForm: GdcExtendedDateFilters.IRelativeDateFilterForm = {
        from: -2,
        granularity: "GDC.time.date",
        availableGranularities: ["GDC.time.date"],
        localIdentifier: "foo",
        name: "bar",
        to: 0,
        type: "relativeForm",
        visible: true,
    };

    const relativePreset: GdcExtendedDateFilters.IRelativeDateFilterPreset = {
        from: -2,
        granularity: "GDC.time.date",
        localIdentifier: "foo",
        name: "bar",
        to: 0,
        type: "relativePreset",
        visible: true,
    };

    const allTimeFilter: GdcExtendedDateFilters.IAllTimeDateFilter = {
        localIdentifier: "foo",
        type: "allTime",
        name: "All time",
        visible: true,
    };

    describe("isAllTimeDateFilter", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["a relative form", relativeForm],
            ["a relative preset", relativePreset],
            ["an absolute form", absoluteForm],
            ["an absolute preset", absolutePreset],
        ])("should return false when %s is tested", (_: any, input: any) => {
            const result = GdcExtendedDateFilters.isAllTimeDateFilter(input);
            expect(result).toEqual(false);
        });

        it("should return true when an all-time filter is tested", () => {
            const result = GdcExtendedDateFilters.isAllTimeDateFilter(allTimeFilter);
            expect(result).toEqual(true);
        });
    });

    describe("isAbsoluteDateFilterForm", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["a relative form", relativeForm],
            ["a relative preset", relativePreset],
            ["an absolute preset", absolutePreset],
            ["an all-time filter", allTimeFilter],
        ])("should return false when %s is tested", (_: any, input: any) => {
            const result = GdcExtendedDateFilters.isAbsoluteDateFilterForm(input);
            expect(result).toEqual(false);
        });

        it("should return true when an absolute form is tested", () => {
            const result = GdcExtendedDateFilters.isAbsoluteDateFilterForm(absoluteForm);
            expect(result).toEqual(true);
        });
    });

    describe("isAbsoluteDateFilterPreset", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["a relative form", relativeForm],
            ["a relative preset", relativePreset],
            ["an absolute form", absoluteForm],
            ["an all-time filter", allTimeFilter],
        ])("should return false when %s is tested", (_: any, input: any) => {
            const result = GdcExtendedDateFilters.isAbsoluteDateFilterPreset(input);
            expect(result).toEqual(false);
        });

        it("should return true when an absolute preset is tested", () => {
            const result = GdcExtendedDateFilters.isAbsoluteDateFilterPreset(absolutePreset);
            expect(result).toEqual(true);
        });
    });

    describe("isRelativeDateFilterForm", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["a relative preset", relativePreset],
            ["an absolute form", absoluteForm],
            ["an absolute preset", absolutePreset],
            ["an all-time filter", allTimeFilter],
        ])("should return false when %s is tested", (_: any, input: any) => {
            const result = GdcExtendedDateFilters.isRelativeDateFilterForm(input);
            expect(result).toEqual(false);
        });

        it("should return true when a relative form is tested", () => {
            const result = GdcExtendedDateFilters.isRelativeDateFilterForm(relativeForm);
            expect(result).toEqual(true);
        });
    });

    describe("isRelativeDateFilterPreset", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["a relative form", relativeForm],
            ["an absolute form", absoluteForm],
            ["an absolute preset", absolutePreset],
            ["an all-time filter", allTimeFilter],
        ])("should return false when %s is tested", (_: any, input: any) => {
            const result = GdcExtendedDateFilters.isRelativeDateFilterPreset(input);
            expect(result).toEqual(false);
        });

        it("should return true when a relative preset is tested", () => {
            const result = GdcExtendedDateFilters.isRelativeDateFilterPreset(relativePreset);
            expect(result).toEqual(true);
        });
    });

    describe("isAbsoluteDateFilterOption", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["a relative form", relativeForm],
            ["a relative preset", relativePreset],
            ["an all-time filter", allTimeFilter],
        ])("should return false when %s is tested", (_: any, input: any) => {
            const result = GdcExtendedDateFilters.isAbsoluteDateFilterOption(input);
            expect(result).toEqual(false);
        });

        it.each([["an absolute form", absoluteForm], ["an absolute preset", absolutePreset]])(
            "should return true when %s is tested",
            (_: any, input: any) => {
                const result = GdcExtendedDateFilters.isAbsoluteDateFilterOption(input);
                expect(result).toEqual(true);
            },
        );
    });

    describe("isRelativeDateFilterOption", () => {
        it.each([
            ["null", null],
            ["undefined", undefined],
            ["an absolute form", absoluteForm],
            ["an absolute preset", absolutePreset],
            ["an all-time filter", allTimeFilter],
        ])("should return false when %s is tested", (_: any, input: any) => {
            const result = GdcExtendedDateFilters.isRelativeDateFilterOption(input);
            expect(result).toEqual(false);
        });

        it.each([["a relative form", relativeForm], ["a relative preset", relativePreset]])(
            "should return false when %s is tested",
            (_: any, input: any) => {
                const result = GdcExtendedDateFilters.isRelativeDateFilterOption(input);
                expect(result).toEqual(true);
            },
        );
    });
});
