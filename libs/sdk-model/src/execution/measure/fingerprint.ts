// (C) 2019-2020 GoodData Corporation

import stringify from "json-stable-stringify";
import { IMeasureFilter } from "../filter/index.js";
import { IMeasure, IMeasureDefinition, isSimpleMeasure } from "./index.js";
import merge from "lodash/merge.js";
import { isFilterRelevantForFingerprinting } from "../filter/fingerprint.js";

type MeasureDefinitionPropsToDefault = Pick<
    IMeasureDefinition["measureDefinition"],
    "filters" | "computeRatio"
>;

function simpleMeasureFingerprint(measure: IMeasure<IMeasureDefinition>): string {
    const { measureDefinition } = measure.measure.definition;

    const measureDefinitionWithSanitizedFilters = {
        ...measureDefinition,
        filters: measureDefinition.filters?.filter(isFilterRelevantForFingerprinting),
    };

    const measureDefinitionDefaults: MeasureDefinitionPropsToDefault = {
        filters: [] as IMeasureFilter[],
        computeRatio: false,
    };

    const measureDefinitionWithDefaults = merge(
        measureDefinitionDefaults,
        measureDefinitionWithSanitizedFilters,
    );

    return stringify({
        measure: {
            ...measure.measure,
            definition: {
                measureDefinition: measureDefinitionWithDefaults,
            },
        },
    });
}

/**
 * Calculates dimension fingerprint; ensures that the optional vs default values are correctly reflected in
 * the fingerprint.
 *
 * @internal
 */
export function measureFingerprint(measure: IMeasure): string {
    if (isSimpleMeasure(measure)) {
        /*
         * Simple measure has a few optional properties, which, when not provided default to specific
         * values (aggregation, computeRatio etc).
         *
         * Fingerprinting simple measure thus requires normalization of the definition so that measure with
         * optional props not specified has same fingerprint as measure with optional props specified to default
         * values.
         */
        return simpleMeasureFingerprint(measure);
    }

    return stringify(measure);
}
