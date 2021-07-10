// (C) 2021 GoodData Corporation
import {
    isMeasure,
    isArithmeticMeasure,
    measureLocalId,
    isSimpleMeasure,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    measureMasterIdentifier,
    IMeasure,
} from "@gooddata/sdk-model";
import { InvariantError } from "ts-invariant";

/*
 * Availability query measures do not need to contain arithmetic measures and measures derived from them:
 * they cannot influence the item availability anyway.
 */
export function filterMeasuresForAvailabilityQuery(measures: IMeasure[]): IMeasure[] {
    const arithmeticMeasuresIds = new Set<string>();
    const otherMeasureIds = new Set<string>();

    measures.forEach((measure) => {
        if (isArithmeticMeasure(measure)) {
            arithmeticMeasuresIds.add(measureLocalId(measure));
        } else if (isMeasure(measure)) {
            otherMeasureIds.add(measureLocalId(measure));
        }
    });

    return measures.filter((measure) => {
        if (isSimpleMeasure(measure)) {
            return true;
        } else if (isArithmeticMeasure(measure)) {
            return false;
        } else if (isPoPMeasure(measure) || isPreviousPeriodMeasure(measure)) {
            const masterMeasure = measureMasterIdentifier(measure);

            // remove derived measures which are either derived from arithmetic measure or which do
            // not have their master among the items to query
            return !arithmeticMeasuresIds.has(masterMeasure) && otherMeasureIds.has(masterMeasure);
        }

        throw new InvariantError(
            "unexpected type of measure encountered while constructing items for availability query",
        );
    });
}
