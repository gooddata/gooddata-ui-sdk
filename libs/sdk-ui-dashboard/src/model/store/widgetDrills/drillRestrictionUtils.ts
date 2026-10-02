// (C) 2026 GoodData Corporation

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import {
    type IInsightDefinition,
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

export function isLabelRestricted(ref: ObjRef, unavailable: IUnavailableDashboardReference[]): boolean {
    return isDashboardObjectRestricted(
        ref,
        isComputedAttributeRef(ref) ? "computedAttribute" : "displayForm",
        unavailable,
    );
}

/**
 * Identifies positively reported restrictions; missing metadata alone is not a permission signal.
 *
 * @param insight - the drilled widget's insight; custom URL placeholders that depend on it are then
 *  resolved from the insight as it is now rather than from the references stored on the drill
 */
export function isDrillRestricted(
    drill: DashboardDrillDefinition,
    unavailable: IUnavailableDashboardReference[],
    insight?: IInsightDefinition,
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
    if (isDrillToAttributeUrl(drill)) {
        return (
            isLabelRestricted(drill.target.displayForm, unavailable) ||
            isLabelRestricted(drill.target.hyperlinkDisplayForm, unavailable)
        );
    }
    if (isDrillToCustomUrl(drill)) {
        return getDrillToCustomUrlReferences(drill.target, insight).some(
            (ref) =>
                isIdentifierRef(ref) &&
                ref.type !== undefined &&
                isDashboardObjectRestricted(ref, ref.type, unavailable),
        );
    }
    return false;
}
