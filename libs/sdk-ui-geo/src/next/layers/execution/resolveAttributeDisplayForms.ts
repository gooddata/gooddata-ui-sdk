// (C) 2026 GoodData Corporation

import { type IAttributeDisplayFormMetadataObject, type ObjRef } from "@gooddata/sdk-model";

import { type IGeoAdapterContext } from "../registry/adapterTypes.js";

const GEO_ICON_DISPLAY_FORM_TYPE = "GDC.geo.icon";

function isGeoDisplayForm(displayForm: IAttributeDisplayFormMetadataObject): boolean {
    const displayFormType = displayForm.displayFormType;
    return typeof displayFormType === "string" && displayFormType.startsWith("GDC.geo.");
}

function pickPreferredDisplayForm(
    displayForms: IAttributeDisplayFormMetadataObject[],
): IAttributeDisplayFormMetadataObject | undefined {
    return (
        displayForms.find((displayForm) => displayForm.isDefault) ??
        displayForms.find((displayForm) => displayForm.isPrimary) ??
        displayForms[0]
    );
}

/**
 * Display form refs derived from a single attribute metadata lookup.
 *
 * @internal
 */
export interface IDerivedDisplayForms {
    /** Preferred non-geo display form (for tooltip text). */
    tooltipRef?: ObjRef;
    /** GDC.geo.icon display form (for icon-by-value pushpins). */
    geoIconRef?: ObjRef;
}

/**
 * Fetches the parent attribute for a given display form ref and resolves
 * both the preferred tooltip display form and the GDC.geo.icon display form
 * in a single backend call.
 *
 * @internal
 */
export async function resolveAttributeDisplayForms(
    context: IGeoAdapterContext,
    ref: ObjRef | undefined,
): Promise<IDerivedDisplayForms> {
    if (!ref) {
        return {};
    }

    try {
        const attribute = await context.backend
            .workspace(context.workspace)
            .attributes()
            .getAttributeByDisplayForm(ref);
        const displayForms = attribute.displayForms ?? [];
        if (!displayForms.length) {
            return {};
        }

        const nonGeoDisplayForms = displayForms.filter((df) => !isGeoDisplayForm(df));
        const preferredTooltip = pickPreferredDisplayForm(
            nonGeoDisplayForms.length ? nonGeoDisplayForms : displayForms,
        );

        const geoIconDf = displayForms.find((df) => df.displayFormType === GEO_ICON_DISPLAY_FORM_TYPE);

        return {
            tooltipRef: preferredTooltip?.ref,
            geoIconRef: geoIconDf?.ref,
        };
    } catch {
        return {};
    }
}
