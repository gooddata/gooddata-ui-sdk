// (C) 2019 GoodData Corporation
import { ExtendedDateFilters } from "../../interfaces/ExtendedDateFilters";
import { mapAbsoluteFilterToAfm, mapOptionToAfm, mapRelativeFilterToAfm } from "../AFMConversions";

const dataSet = {
    uri: "foo",
};
const allTimeDateFilterValue: ExtendedDateFilters.IAllTimeDateFilter = {
    localIdentifier: "baz",
    name: "bar",
    visible: true,
    type: "allTime",
};
const absoluteDateFilterFormValue: ExtendedDateFilters.IAbsoluteDateFilterForm = {
    localIdentifier: "baz",
    name: "bar",
    visible: true,
    type: "absoluteForm",
    from: "1",
    to: "2",
};
const absoluteDateFilterPresetValue: ExtendedDateFilters.IAbsoluteDateFilterPreset = {
    localIdentifier: "baz",
    name: "bar",
    visible: true,
    type: "absolutePreset",
    from: "1",
    to: "2",
};
const relativeDateFilterFormValue: ExtendedDateFilters.IRelativeDateFilterForm = {
    localIdentifier: "baz",
    name: "bar",
    visible: true,
    type: "relativeForm",
    from: 1,
    to: 2,
    availableGranularities: ["GDC.time.date"],
};
const relativeDateFilterPresetValue: ExtendedDateFilters.IRelativeDateFilterPreset = {
    localIdentifier: "baz",
    name: "bar",
    visible: true,
    type: "relativePreset",
    from: 1,
    to: 2,
    granularity: "GDC.time.date",
};

describe("mapAbsoluteFilterToAfm", () => {
    it("should convert absolute date filter form value to AFM absolute date filter definition", () => {
        const actual = mapAbsoluteFilterToAfm(absoluteDateFilterFormValue, dataSet);
        expect(actual).toEqual({
            absoluteDateFilter: {
                from: "1",
                to: "2",
                dataSet: {
                    uri: "foo",
                },
            },
        });
    });
});

describe("mapRelativeFilterToAfm", () => {
    it("should convert relative date filter form value to AFM relative date filter definition", () => {
        const actual = mapRelativeFilterToAfm(relativeDateFilterFormValue, dataSet);
        expect(actual).toEqual({
            relativeDateFilter: {
                from: 1,
                to: 2,
                dataSet: {
                    uri: "foo",
                },
            },
        });
    });
});

describe("mapOptionToAfm", () => {
    it("should convert all time date filter value to AFM empty date filter definition", () => {
        const actual = mapOptionToAfm(allTimeDateFilterValue, dataSet, false);
        expect(actual).toBe(null);
    });

    it("should convert absolute date filter form value to AFM absolute date filter definition", () => {
        const actual = mapOptionToAfm(absoluteDateFilterFormValue, dataSet, false);
        expect(actual).toHaveProperty("absoluteDateFilter");
    });

    it("should convert absolute date filter preset value to AFM absolute date filter definition", () => {
        const actual = mapOptionToAfm(absoluteDateFilterPresetValue, dataSet, false);
        expect(actual).toHaveProperty("absoluteDateFilter");
    });

    it("should convert relative date filter form value to AFM relative date filter definition", () => {
        const actual = mapOptionToAfm(relativeDateFilterFormValue, dataSet, false);
        expect(actual).toHaveProperty("relativeDateFilter");
    });

    it("should convert relative date filter preset value to AFM relative date filter definition", () => {
        const actual = mapOptionToAfm(relativeDateFilterPresetValue, dataSet, false);
        expect(actual).toHaveProperty("relativeDateFilter");
    });

    it("should convert relative date filter preset value to AFM relative date filter definition with excluding current period", () => {
        const actual = mapOptionToAfm({ ...relativeDateFilterPresetValue, from: -30, to: 0 }, dataSet, true);
        expect(actual).toMatchObject({ relativeDateFilter: { from: -31, to: -1 } });
    });

    it("should throw error when type is uknown and TS is not used", () => {
        const value = {
            localIdentifier: "baz",
            name: "bar",
            visible: true,
            type: "uknownType",
        } as any;
        expect(() => mapOptionToAfm(value, dataSet, false)).toThrow();
    });
});
