// (C) 2026 GoodData Corporation

import {
    type IExecutionDefinition,
    type IMeasure,
    isIdentifierRef,
    isMeasure,
    isSimpleMeasure,
    measureItem,
    measureLocalId,
    measureMasterIdentifier,
} from "@gooddata/sdk-model";
import { BucketNames, VisualizationTypes } from "@gooddata/sdk-ui";

/**
 * Highcharts point field that carries a measure's value. Differs by chart type:
 * single-Y charts use `y`; scatter/bubble spread measures across `x`/`y`/`z`;
 * heatmap uses `value`; bullet's target series uses `target`.
 */
export type MeasurePointField = "x" | "y" | "z" | "value" | "target";

export interface IMeasureMapping {
    ldmId: string;
    pointField: MeasurePointField;
}

/**
 * Mapping from execution localIdentifier to the data the custom tooltip needs
 * to resolve `{metric/id}` references at hover time.
 */
export interface IIdentifierMapping {
    measures: Record<string, IMeasureMapping>;
}

/**
 * Returns the LDM identifier the measure ultimately resolves to.
 *
 * - Simple measures: the identifier of the underlying catalog metric
 * - Derived measures (PoP, previous period): follows the chain to the master
 * - Arithmetic measures (and anything without an identifier ref): undefined
 */
function resolveMeasureLdmIdentifier(measure: IMeasure, allMeasures: IMeasure[]): string | undefined {
    if (isSimpleMeasure(measure)) {
        const ref = measureItem(measure);
        return ref && isIdentifierRef(ref) ? ref.identifier : undefined;
    }

    const masterLocalId = measureMasterIdentifier(measure);
    if (!masterLocalId) {
        return undefined;
    }

    const masterMeasure = allMeasures.find((m) => measureLocalId(m) === masterLocalId);
    return masterMeasure ? resolveMeasureLdmIdentifier(masterMeasure, allMeasures) : undefined;
}

function getMeasurePointField(
    chartType: string | undefined,
    bucketLocalId: string | undefined,
): MeasurePointField {
    switch (chartType) {
        case VisualizationTypes.HEATMAP:
            return "value";
        case VisualizationTypes.SCATTER:
            return bucketLocalId === BucketNames.MEASURES ? "x" : "y";
        case VisualizationTypes.BUBBLE:
            if (bucketLocalId === BucketNames.MEASURES) return "x";
            if (bucketLocalId === BucketNames.TERTIARY_MEASURES) return "z";
            return "y";
        case VisualizationTypes.BULLET:
            // Bullet's target series carries its value on point.target; the
            // primary (MEASURES) and comparative (TERTIARY_MEASURES) series
            // both use point.y.
            return bucketLocalId === BucketNames.SECONDARY_MEASURES ? "target" : "y";
        default:
            return "y";
    }
}

/**
 * Builds a mapping from execution localIdentifiers to the data needed to
 * resolve `{metric/id}` references in custom tooltip content.
 *
 * The drill intersection only carries localIdentifiers, while users reference
 * metrics by their LDM identifiers — and depending on chart type, the measure
 * value lives on a different Highcharts point field. Both pieces are resolved
 * up-front so the per-hover resolver stays cheap.
 *
 * Handles derived measures (previous period, PoP) by tracing back to their
 * master simple measure's LDM identifier.
 */
export function buildIdentifierMapping(
    definition: IExecutionDefinition,
    chartType?: string,
): IIdentifierMapping {
    const measures: Record<string, IMeasureMapping> = {};

    const addMeasure = (measure: IMeasure, bucketLocalId: string | undefined) => {
        const localId = measureLocalId(measure);
        if (measures[localId]) {
            return;
        }
        const ldmId = resolveMeasureLdmIdentifier(measure, definition.measures);
        if (!ldmId) {
            return;
        }
        measures[localId] = {
            ldmId,
            pointField: getMeasurePointField(chartType, bucketLocalId),
        };
    };

    for (const bucket of definition.buckets ?? []) {
        for (const item of bucket.items) {
            if (isMeasure(item)) {
                addMeasure(item, bucket.localIdentifier);
            }
        }
    }

    // Catches measures from executions built without bucket metadata — they
    // default to `y` since chart-type routing needs a bucket to act on.
    for (const measure of definition.measures) {
        addMeasure(measure, undefined);
    }

    return { measures };
}
