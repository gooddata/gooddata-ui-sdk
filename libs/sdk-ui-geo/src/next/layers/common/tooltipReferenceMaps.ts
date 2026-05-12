// (C) 2026 GoodData Corporation

import { measureLocalId } from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";
import { resolveMeasureLdmIdentifier } from "@gooddata/sdk-ui-vis-commons";

import { type ITooltipReferenceMaps } from "../registry/adapterTypes.js";

/**
 * Builds the per-layer reference maps the custom-tooltip resolver needs.
 *
 * - `measures`: `localIdentifier` → LDM measure id (skipping measures whose
 *   identifier ref can't be resolved, e.g. arithmetic measures).
 * - `attributes`: display-form id → attribute id, sourced from each attribute
 *   descriptor's `identifier` (the display-form id surfaced on tooltip
 *   payloads as `attrId`) paired with `formOf.identifier` (the parent
 *   attribute id). Entries where both ids are equal are still emitted so
 *   callers can do a single lookup without a self-equality check.
 *
 * @internal
 */
export function buildTooltipReferenceMaps(dataView: DataViewFacade): ITooltipReferenceMaps {
    const definition = dataView.definition;

    const measures: Record<string, string> = {};
    for (const measure of definition.measures) {
        const ldmId = resolveMeasureLdmIdentifier(measure, definition.measures);
        if (ldmId) {
            measures[measureLocalId(measure)] = ldmId;
        }
    }

    const attributes: Record<string, string> = {};
    for (const descriptor of dataView.meta().attributeDescriptors()) {
        const header = descriptor.attributeHeader;
        // `identifier` is the display-form id (URI-typed display forms fall
        // back to `uri` since `identifier` is undefined for them).
        const displayFormId = header.identifier ?? header.uri;
        const attributeId = header.formOf?.identifier;
        if (displayFormId && attributeId) {
            attributes[displayFormId] = attributeId;
        }
    }

    return { measures, attributes };
}
