// (C) 2026 GoodData Corporation

import {
    type IMeasure,
    isIdentifierRef,
    isSimpleMeasure,
    measureItem,
    measureLocalId,
    measureMasterIdentifier,
} from "@gooddata/sdk-model";

/**
 * Returns the LDM identifier the measure ultimately resolves to.
 *
 * - Simple measures: the identifier of the underlying catalog metric
 * - Derived measures (PoP, previous period): follows the chain to the master
 * - Arithmetic measures (and anything without an identifier ref): undefined
 *
 * @internal
 */
export function resolveMeasureLdmIdentifier(measure: IMeasure, allMeasures: IMeasure[]): string | undefined {
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
