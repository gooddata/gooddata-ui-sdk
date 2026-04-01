// (C) 2026 GoodData Corporation

import { cloneDeep, set } from "lodash-es";

import { isConcreteViewportPreset } from "@gooddata/sdk-ui-geo/internal";

import { type IExtendedReferencePoint } from "../../../interfaces/Visualization.js";

/**
 * Strips viewport-related properties that are incompatible with the current viewport mode.
 *
 * - Preset viewports (continent_*, world): strip bounds, center, zoom
 * - Custom viewport with bounds: strip center, zoom (bounds is canonical)
 *
 * @internal
 */
export function sanitizeGeoViewportProperties(
    referencePoint: IExtendedReferencePoint,
): IExtendedReferencePoint {
    const controls = referencePoint.properties?.controls;
    if (!controls) {
        return referencePoint;
    }

    const viewportArea = controls["viewport"]?.area;
    const hasBounds = controls["bounds"] !== undefined;
    const hasCenter = controls["center"] !== undefined;
    const hasZoom = controls["zoom"] !== undefined;

    if (isConcreteViewportPreset(viewportArea)) {
        // Preset viewport — strip all positional overrides
        if (!hasBounds && !hasCenter && !hasZoom) {
            return referencePoint;
        }
        const updated = cloneDeep(referencePoint);
        set(updated, "properties.controls.bounds", undefined);
        set(updated, "properties.controls.center", undefined);
        set(updated, "properties.controls.zoom", undefined);
        return updated;
    }

    if (viewportArea === "custom" && hasBounds && (hasCenter || hasZoom)) {
        // Custom viewport with bounds — strip redundant center/zoom
        const updated = cloneDeep(referencePoint);
        set(updated, "properties.controls.center", undefined);
        set(updated, "properties.controls.zoom", undefined);
        return updated;
    }

    return referencePoint;
}
