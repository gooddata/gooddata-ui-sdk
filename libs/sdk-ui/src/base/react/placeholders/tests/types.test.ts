// (C) 2019-2025 GoodData Corporation
import { expectType } from "tsd";
import { describe, it } from "vitest";

import {
    type IArithmeticMeasureDefinition,
    type IAttribute,
    type IMeasure,
    type IPoPMeasureDefinition,
    newArithmeticMeasure,
    newPopMeasure,
} from "@gooddata/sdk-model";

import { type PlaceholdersState } from "../context.js";
import { newComposedPlaceholder, newPlaceholder } from "../factory.js";
import { resolveValueWithPlaceholders } from "../resolve.js";

const emptyState: PlaceholdersState = {
    placeholders: {},
};

describe("Measure placeholders inference", () => {
    it("inference should work for placeholder holding single value", () => {
        const placeholder = newPlaceholder<IMeasure>();
        const resolved = resolveValueWithPlaceholders(placeholder, emptyState);
        expectType<IMeasure>(resolved);
    });

    it("inference should work for placeholder holding multiple values", () => {
        const placeholder = newPlaceholder<IMeasure[]>();
        const resolved = resolveValueWithPlaceholders(placeholder, emptyState);
        expectType<IMeasure[]>(resolved);
    });

    it("inference should work for placeholder with narrowed type", () => {
        const measure = newArithmeticMeasure(["measure"], "sum");
        const placeholder = newPlaceholder(measure);
        const resolved = resolveValueWithPlaceholders(placeholder, emptyState);

        expectType<IMeasure<IArithmeticMeasureDefinition>>(resolved);
    });

    it("inference should work for array with placeholder holding single value", () => {
        const placeholder = newPlaceholder<IMeasure>();
        const resolved = resolveValueWithPlaceholders([placeholder], emptyState);

        expectType<IMeasure[]>(resolved);
    });

    it("inference should work for array with common placeholder holding multiple values", () => {
        const placeholder = newPlaceholder<IMeasure[]>();
        const resolved = resolveValueWithPlaceholders([placeholder], emptyState);

        expectType<IMeasure[]>(resolved);
    });

    it("inference should work for array with placeholder with narrowed type", () => {
        const measure = newPopMeasure("measure", "attr");
        const placeholder = newPlaceholder(measure);
        const resolved = resolveValueWithPlaceholders([placeholder], emptyState);

        expectType<IMeasure<IPoPMeasureDefinition>[]>(resolved);
    });

    it("inference should work for array with mixed placeholder types", () => {
        const measure1 = newPopMeasure("measure", "attr");
        const measure2 = newArithmeticMeasure(["measure"], "sum");
        const placeholder1 = newPlaceholder(measure1);
        const placeholder2 = newPlaceholder([measure2]);
        const resolved = resolveValueWithPlaceholders([placeholder1, placeholder2], emptyState);

        expectType<(IMeasure<IArithmeticMeasureDefinition> | IMeasure<IPoPMeasureDefinition>)[]>(resolved);
    });

    it("inference should work for composed placeholder", () => {
        const placeholder1 = newPlaceholder<IMeasure>();
        const placeholder2 = newPlaceholder<IAttribute>();
        const placeholder3 = newComposedPlaceholder([placeholder1, placeholder2]);
        const resolved = resolveValueWithPlaceholders(placeholder3, emptyState);
        expectType<(IMeasure | IAttribute)[]>(resolved);
    });

    it("inference should work for composed placeholder with computation", () => {
        const placeholder1 = newPlaceholder<IMeasure>();
        const placeholder2 = newPlaceholder<IAttribute[]>();
        const placeholder3 = newComposedPlaceholder([placeholder1, placeholder2], ([measure, attributes]) => {
            return [measure, attributes];
        });
        const resolved = resolveValueWithPlaceholders(placeholder3, emptyState);
        expectType<(IMeasure | IAttribute[])[]>(resolved);
    });
});
