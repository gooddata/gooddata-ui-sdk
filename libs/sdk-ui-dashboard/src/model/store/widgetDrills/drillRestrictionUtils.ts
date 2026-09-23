// (C) 2026 GoodData Corporation

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import {
    type ObjRef,
    isComputedAttributeRef,
    isDrillToAttributeUrl,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    isIdentifierRef,
} from "@gooddata/sdk-model";
import { getDrillToCustomUrlReferences } from "@gooddata/sdk-model/internal";

import { type DashboardDrillDefinition } from "../../../types.js";
import { isDashboardObjectRestricted } from "../filtering/restrictedFilterUtils.js";

/** Identifies positively reported restrictions; missing metadata alone is not a permission signal. */
export function isDrillRestricted(
    drill: DashboardDrillDefinition,
    unavailable: IUnavailableDashboardReference[],
): boolean {
    if (unavailable.length === 0) {
        return false;
    }
    if (isDrillToInsight(drill)) {
        return isDashboardObjectRestricted(drill.target, "insight", unavailable);
    }
    if (isDrillToDashboard(drill)) {
        return (
            !!drill.target && isDashboardObjectRestricted(drill.target, "analyticalDashboard", unavailable)
        );
    }
    const isLabelRestricted = (ref: ObjRef) =>
        isDashboardObjectRestricted(
            ref,
            isComputedAttributeRef(ref) ? "computedAttribute" : "displayForm",
            unavailable,
        );
    if (isDrillToAttributeUrl(drill)) {
        return (
            isLabelRestricted(drill.target.displayForm) ||
            isLabelRestricted(drill.target.hyperlinkDisplayForm)
        );
    }
    if (isDrillToCustomUrl(drill)) {
        return getDrillToCustomUrlReferences(drill.target).some(
            (ref) =>
                isIdentifierRef(ref) &&
                ref.type !== undefined &&
                isDashboardObjectRestricted(ref, ref.type, unavailable),
        );
    }
    return false;
}
