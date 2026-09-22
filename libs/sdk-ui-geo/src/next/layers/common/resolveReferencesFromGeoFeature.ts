// (C) 2026 GoodData Corporation

import { type ISeparators } from "@gooddata/sdk-model";
import {
    type IResolvedReferenceValues,
    labelKey,
    labelReference,
    measureReference,
    metricKey,
} from "@gooddata/sdk-ui-vis-commons";

import { type ITooltipReferenceMaps } from "../registry/adapterTypes.js";

import { type TooltipPayload, getTooltipProperties, parseTooltipPayload } from "./tooltipUtils.js";

/**
 * Builds the resolver lookup table for a hovered GeoJSON feature.
 *
 * Walks the standard tooltip payload slots in default-tooltip render order
 * (`locationName → size → color → measures[] → segment → tooltipText`) and
 * registers values keyed by `metric/<ldmId>`, `label/<id>` and `computed_attribute/<id>`. The first slot
 * that contributes a key wins — this matches the order users see in the
 * default tooltip, so a `{metric/foo}` reference in markdown resolves to the
 * same value the user can already see above it.
 *
 * Attribute payloads register under BOTH the display-form id (the `attrId`
 * stored on the payload) and, when `attributes[displayFormId]` is known, the
 * parent attribute id — mirroring Highcharts' dual-key behavior.
 *
 * @internal
 */
export function resolveReferencesFromGeoFeature(
    properties: GeoJSON.GeoJsonProperties,
    referenceMaps: ITooltipReferenceMaps | undefined,
    separators: ISeparators | undefined,
): IResolvedReferenceValues {
    const values: IResolvedReferenceValues = {};

    if (!properties) {
        return values;
    }

    const props = getTooltipProperties(properties);
    const measureLdmByLocalId = referenceMaps?.measures ?? {};
    const attributeKeysByLocalId = referenceMaps?.attributes ?? {};

    const registerAttribute = (payload: TooltipPayload | undefined) => {
        if (!payload?.attrId || payload.value === undefined) {
            return;
        }
        const status = labelReference(String(payload.value));
        // The reference keys come from the maps, looked up by the attribute's localIdentifier -
        // exactly how a measure resolves its LDM id. They carry the object type, which the
        // payload's `attrId` cannot: an LDM id is unique only within a type, so a label and a
        // computed attribute may share one. A payload with no localIdentifier predates this and
        // is treated as a label, which is what it would have resolved as before.
        const keys = payload.attrLocalId ? attributeKeysByLocalId[payload.attrLocalId] : undefined;
        const displayFormKey = keys?.displayFormKey ?? labelKey(payload.attrId);
        if (values[displayFormKey] === undefined) {
            values[displayFormKey] = status;
        }
        // When the display form and the parent attribute ids coincide, `attributeKey`
        // collapses onto `displayFormKey` and the second write is a no-op
        // under first-wins — no self-equality check needed.
        if (keys && values[keys.attributeKey] === undefined) {
            values[keys.attributeKey] = status;
        }
    };

    const registerMeasure = (payload: TooltipPayload | undefined) => {
        if (!payload?.localId) {
            return;
        }
        const ldmId = measureLdmByLocalId[payload.localId];
        if (!ldmId) {
            return;
        }
        const key = metricKey(ldmId);
        if (values[key] !== undefined) {
            return; // first-wins precedence
        }
        // Geo payloads (via JSON) can be non-numeric/NaN; normalize to null (→ "No data") first.
        const rawValue = payload.value;
        const numeric = typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : null;
        values[key] = measureReference(numeric, payload.format, separators);
    };

    // Walk in default-tooltip render order so `{metric/foo}` resolves to the
    // value users see above the custom section when the same metric appears
    // in multiple slots (rare; values are typically identical across slots).
    registerAttribute(parseTooltipPayload(props["locationName"]));
    registerMeasure(parseTooltipPayload(props["size"]));
    registerMeasure(parseTooltipPayload(props["color"]));

    const rawMeasures = props["measures"];
    if (Array.isArray(rawMeasures)) {
        for (const item of rawMeasures) {
            registerMeasure(parseTooltipPayload(item));
        }
    }

    registerAttribute(parseTooltipPayload(props["segment"]));
    registerAttribute(parseTooltipPayload(props["tooltipText"]));

    return values;
}
