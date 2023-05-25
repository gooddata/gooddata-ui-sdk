// (C) 2021-2022 GoodData Corporation
import { ObjRefMap } from "../../_staging/metadata/objRefMap.js";
import { call, SagaReturnType } from "redux-saga/effects";
import { resolveDisplayFormMetadata } from "./displayFormResolver.js";
import isEmpty from "lodash/isEmpty.js";
import {
    objRefToString,
    FilterContextItem,
    isDashboardAttributeFilter,
    IAttributeDisplayFormMetadataObject,
} from "@gooddata/sdk-model";
import { DashboardContext } from "../types/commonTypes.js";
import { SagaIterator } from "redux-saga";
import { invariant } from "ts-invariant";

/**
 * This generator function resolves display form metadata objects for all attribute filters in the provided `filters`
 * parameter. The resolver will first check in-memory `displayForms` mapping; if some used display forms are not
 * found, it will consult the backend.
 *
 * @param ctx - dashboard context where the resolution is being done
 * @param filters - list of dashboard filters; resolver will extract just the attribute filters from here
 * @param displayForms - in-memory mapping of known display forms to use during the initial lookup; if not specified, the
 *  code will obtain all catalog display forms; note: this parameter is really only useful during the dashboard initialization
 *  where the catalog is not yet set. once the dashboard is initialized, the parameter is not needed
 */
export function* resolveFilterDisplayForms(
    ctx: DashboardContext,
    filters: FilterContextItem[],
    displayForms?: ObjRefMap<IAttributeDisplayFormMetadataObject>,
): SagaIterator<IAttributeDisplayFormMetadataObject[]> {
    const displayFormRefs = filters
        .filter(isDashboardAttributeFilter)
        .map((filter) => filter.attributeFilter.displayForm);

    const resolvedDisplayForms: SagaReturnType<typeof resolveDisplayFormMetadata> = yield call(
        resolveDisplayFormMetadata,
        ctx,
        displayFormRefs,
        displayForms,
    );

    // TODO: this is too strict; instead of exploding, the resolver should communicate that some filters are invalid so
    //  that the upstream code can remove the filter from the filter context
    invariant(
        isEmpty(resolvedDisplayForms.missing),
        `Unable to resolve display forms used in filter context filters: ${resolvedDisplayForms.missing
            .map((m) => objRefToString(m))
            .join(", ")}.`,
    );

    return Array.from(resolvedDisplayForms.resolved.values());
}
