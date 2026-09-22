// (C) 2026 GoodData Corporation

import { isComputedAttributeRef, measureLocalId } from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";
import { computedAttributeKey, labelKey, resolveMeasureLdmIdentifier } from "@gooddata/sdk-ui-vis-commons";

import { type ITooltipAttributeKeys, type ITooltipReferenceMaps } from "../registry/adapterTypes.js";

/**
 * Builds the per-layer reference maps the custom-tooltip resolver needs.
 *
 * - `measures`: `localIdentifier` → LDM measure id (skipping measures whose
 *   identifier ref can't be resolved, e.g. arithmetic measures).
 * - `attributes`: attribute localIdentifier (surfaced on tooltip payloads as `attrLocalId`)
 *   → the typed reference keys for its display form and its parent attribute. The type comes
 *   from the descriptor's ref, which the backend types honestly, and is what separates a
 *   computed attribute from a label of the same id. Entries where both keys are equal are
 *   still emitted so callers can do a single lookup without a self-equality check.
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

    const attributes: Record<string, ITooltipAttributeKeys> = {};
    for (const descriptor of dataView.meta().attributeDescriptors()) {
        const header = descriptor.attributeHeader;
        // `identifier` is the display-form id (URI-typed display forms fall
        // back to `uri` since `identifier` is undefined for them).
        const displayFormId = header.identifier ?? header.uri;
        const attributeId = header.formOf?.identifier;
        if (displayFormId && attributeId && header.localIdentifier) {
            const buildKey = isComputedAttributeRef(header.ref) ? computedAttributeKey : labelKey;
            attributes[header.localIdentifier] = {
                displayFormKey: buildKey(displayFormId),
                attributeKey: buildKey(attributeId),
            };
        }
    }

    return { measures, attributes };
}
