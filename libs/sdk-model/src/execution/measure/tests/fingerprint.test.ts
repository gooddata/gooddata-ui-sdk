// (C) 2020 GoodData Corporation
import { newPositiveAttributeFilter } from "../../../index.js";
import { Account, Velocity, Won } from "../../../../__mocks__/model.js";
import { modifySimpleMeasure } from "../factory.js";
import { measureFingerprint } from "../fingerprint.js";
import { IMeasure } from "../index.js";
import cloneDeep from "lodash/cloneDeep.js";

describe("measureFingerprint", () => {
    describe("for simple measure", () => {
        /*
         * The test inputs are hand-crafted to rule out measure build conventions interfering and
         * possibly causing false positives.
         *
         * While the measure builders are the recommended way for programmers, there MAY be use-cases
         * where machines work (create/save/load) with raw measure definitions.
         */

        const WonRatioFalse = cloneDeep(Won);
        WonRatioFalse.measure.definition.measureDefinition.computeRatio = false;

        const WonRatioUndefined = cloneDeep(Won);
        delete WonRatioUndefined.measure.definition.measureDefinition.computeRatio;

        const VelocityAggUndefined = cloneDeep(Velocity.Sum);
        delete VelocityAggUndefined.measure.definition.measureDefinition.aggregation;

        const WonFiltersUndefined = cloneDeep(Won);
        delete WonFiltersUndefined.measure.definition.measureDefinition.filters;

        const WonFiltersEmpty = cloneDeep(Won);
        WonFiltersEmpty.measure.definition.measureDefinition.filters = [];

        const SameFpScenarios: Array<[string, IMeasure, IMeasure]> = [
            ["no ratio vs ratio false", WonRatioUndefined, WonRatioFalse],
            ["no filters vs empty filter array", WonFiltersUndefined, WonFiltersEmpty],
        ];

        it.each(SameFpScenarios)("should compute same fingerprit when %s", (_desc, left, right) => {
            expect(measureFingerprint(left)).toEqual(measureFingerprint(right));
        });

        const WonRatioTrue = modifySimpleMeasure(Won, (m) => m.ratio());
        const VelocityAvg = Velocity.Avg;
        const WonRatioWithFilters = modifySimpleMeasure(Won, (m) =>
            m.filters(newPositiveAttributeFilter(Account.Name, ["account"])),
        );

        const DifferentFpScenarios: Array<[string, IMeasure, IMeasure]> = [
            ["no ratio vs ratio true", WonRatioUndefined, WonRatioTrue],
            ["no aggregation vs aggregation avg", VelocityAggUndefined, VelocityAvg],
            ["no filters vs filter specified", WonFiltersUndefined, WonRatioWithFilters],
        ];

        it.each(DifferentFpScenarios)("should compute different fingerprit when %s", (_desc, left, right) => {
            expect(measureFingerprint(left)).not.toEqual(measureFingerprint(right));
        });
    });
});
