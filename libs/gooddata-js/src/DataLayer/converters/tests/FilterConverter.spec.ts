// (C) 2007-2019 GoodData Corporation
import * as input from "./fixtures/FilterConverter.input.fixtures";
import * as expected from "./fixtures/FilterConverter.afm.fixtures";
import { convertVisualizationObjectFilter } from "../FilterConverter";

// tslint:disable:max-line-length
const VIS_OBJ_TESTS = [
    ["absolute date filter", input.absoluteDateFilter, expected.absoluteDateFilter],
    [
        "absolute date filter with identifier",
        input.absoluteDateFilterWithIdentifier,
        expected.absoluteDateFilterWithIdentifier,
    ],
    ["absolute date filter without range", input.absoluteDateFilterWithoutRange, null],
    ["relative date filter", input.relativeDateFilter, expected.relativeDateFilter],
    [
        "relative date filter with identifier",
        input.relativeDateFilterWithIdentifier,
        expected.relativeDateFilterWithIdentifier,
    ],
    ["relative date filter without range", input.relativeDateFilterWithoutRange, null],
    ["positive attribute filter", input.positiveAttrFilter, expected.positiveAttrFilter],
    ["negative attribute filter", input.negativeAttrFilter, expected.negativeAttrFilter],
    ["negative attribute filter without elements", input.negativeAttrFilterWithoutElements, null],
];

describe.each(VIS_OBJ_TESTS)("convertVisualizationObjectFilter", (desc, input, expected) => {
    it(`should ${desc}`, () => {
        expect(convertVisualizationObjectFilter(input)).toEqual(expected);
    });
});
