// (C) 2026 GoodData Corporation

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type DashboardAttributeFilterItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilterConfig,
    type ObjRef,
    areObjRefsEqual,
    dashboardAttributeFilterItemDisplayForm,
    dashboardAttributeFilterItemLocalIdentifier,
    idRef,
    isDashboardAttributeFilter,
    uriRef,
} from "@gooddata/sdk-model";

import { canApplyFilterTypeToTarget } from "./attributeFilterSelectionTypeCompatibility.js";

export type AttributeFilterType = "list" | "text";

export interface IAttributeFilterMatchSource {
    readonly displayForm: ObjRef;
    readonly localIdentifier?: string;
    readonly type: AttributeFilterType;
}

export interface IFindAttributeFilterCounterpartOptions {
    readonly sourceFilterConfigs?: IDashboardAttributeFilterConfig[];
    readonly targetFilterConfigs?: IDashboardAttributeFilterConfig[];
    readonly displayForms?: IAttributeDisplayFormMetadataObject[];
    readonly attributesWithReferences?: IAttributeWithReferences[];
    readonly allowListToText?: boolean;
    readonly allowTextToList?: boolean;
}

export type AttributeFilterCounterpartResult =
    | {
          readonly status: "matched";
          readonly counterpart: DashboardAttributeFilterItem;
      }
    | {
          readonly status: "notCompatible";
          readonly counterpart: DashboardAttributeFilterItem;
      }
    | {
          readonly status: "notFound";
      };

/**
 * Finds the target dashboard attribute filter representing the same logical attribute.
 *
 * Matching is shared by drill-filter transfer validation and cross-tab filter synchronization.
 * Same-type targets take precedence over list/text migrations. Display forms are compared directly
 * and through display-as-label configuration. List filters also match through their owning attribute
 * when metadata is available. Text filters match only the same display form: their values are label
 * values, so another label of the same attribute is a different filter.
 *
 * @internal
 */
export function findAttributeFilterCounterpart(
    source: DashboardAttributeFilterItem | IAttributeFilterMatchSource,
    targets: DashboardAttributeFilterItem[],
    options: IFindAttributeFilterCounterpartOptions = {},
): AttributeFilterCounterpartResult {
    const sourceIdentity = sourceIdentityOf(source);
    const sourceConfigs = options.sourceFilterConfigs ?? [];
    const targetConfigs = options.targetFilterConfigs ?? [];
    const displayForms = options.displayForms ?? [];

    const sameType = targets.filter((target) => filterTypeOf(target) === sourceIdentity.type);
    const sameTypeMatch = findIdentityMatch(
        sourceIdentity,
        sourceConfigs,
        sameType,
        targetConfigs,
        displayForms,
        options.attributesWithReferences,
        // Text values are specific to one label. Attribute-level matching applies to list filters.
        sourceIdentity.type === "list",
    );
    if (sameTypeMatch) {
        return { status: "matched", counterpart: sameTypeMatch };
    }

    const allowsMigration =
        sourceIdentity.type === "list"
            ? (options.allowListToText ?? true)
            : (options.allowTextToList ?? true);
    if (!allowsMigration) {
        return { status: "notFound" };
    }

    const crossType = targets.filter((target) => filterTypeOf(target) !== sourceIdentity.type);
    const crossTypeMatch = findIdentityMatch(
        sourceIdentity,
        sourceConfigs,
        crossType,
        targetConfigs,
        displayForms,
        options.attributesWithReferences,
        true,
    );
    if (!crossTypeMatch) {
        return { status: "notFound" };
    }

    const targetLocalIdentifier = dashboardAttributeFilterItemLocalIdentifier(crossTypeMatch);
    if (!targetLocalIdentifier) {
        return { status: "notFound" };
    }
    const targetSelectionType = targetFilterConfigsFor(targetConfigs, targetLocalIdentifier)?.selectionType;
    return canApplyFilterTypeToTarget(sourceIdentity.type, targetSelectionType, crossTypeMatch)
        ? { status: "matched", counterpart: crossTypeMatch }
        : { status: "notCompatible", counterpart: crossTypeMatch };
}

function sourceIdentityOf(
    source: DashboardAttributeFilterItem | IAttributeFilterMatchSource,
): IAttributeFilterMatchSource {
    if ("type" in source) {
        return source;
    }
    return {
        displayForm: dashboardAttributeFilterItemDisplayForm(source),
        localIdentifier: dashboardAttributeFilterItemLocalIdentifier(source),
        type: filterTypeOf(source),
    };
}

function filterTypeOf(filter: DashboardAttributeFilterItem): AttributeFilterType {
    return isDashboardAttributeFilter(filter) ? "list" : "text";
}

function findIdentityMatch(
    source: IAttributeFilterMatchSource,
    sourceConfigs: IDashboardAttributeFilterConfig[],
    targets: DashboardAttributeFilterItem[],
    targetConfigs: IDashboardAttributeFilterConfig[],
    displayForms: IAttributeDisplayFormMetadataObject[],
    attributesWithReferences: IAttributeWithReferences[] | undefined,
    matchByOwningAttribute: boolean,
): DashboardAttributeFilterItem | undefined {
    const sourceRefs = filterDisplayForms(source.displayForm, source.localIdentifier, sourceConfigs);

    return targets.find((target) => {
        const targetRefs = filterDisplayForms(
            dashboardAttributeFilterItemDisplayForm(target),
            dashboardAttributeFilterItemLocalIdentifier(target),
            targetConfigs,
        );
        return sourceRefs.some((sourceRef) =>
            targetRefs.some((targetRef) =>
                sharesAttributeIdentity(
                    sourceRef,
                    targetRef,
                    displayForms,
                    attributesWithReferences,
                    matchByOwningAttribute,
                ),
            ),
        );
    });
}

function filterDisplayForms(
    displayForm: ObjRef,
    localIdentifier: string | undefined,
    configs: IDashboardAttributeFilterConfig[],
): ObjRef[] {
    const displayAsLabel = targetFilterConfigsFor(configs, localIdentifier)?.displayAsLabel;
    return displayAsLabel ? [displayForm, displayAsLabel] : [displayForm];
}

function targetFilterConfigsFor(
    configs: IDashboardAttributeFilterConfig[],
    localIdentifier: string | undefined,
): IDashboardAttributeFilterConfig | undefined {
    return localIdentifier ? configs.find((config) => config.localIdentifier === localIdentifier) : undefined;
}

function sharesAttributeIdentity(
    left: ObjRef,
    right: ObjRef,
    displayForms: IAttributeDisplayFormMetadataObject[],
    attributesWithReferences: IAttributeWithReferences[] | undefined,
    matchByOwningAttribute: boolean,
): boolean {
    if (displayFormsEquivalent(left, right, displayForms)) {
        return true;
    }
    if (!matchByOwningAttribute) {
        return false;
    }

    const leftAttribute = attributeRefForDisplayForm(left, displayForms, attributesWithReferences);
    const rightAttribute = attributeRefForDisplayForm(right, displayForms, attributesWithReferences);
    return !!leftAttribute && !!rightAttribute && areObjRefsEqual(leftAttribute, rightAttribute);
}

function displayFormsEquivalent(
    left: ObjRef,
    right: ObjRef,
    displayForms: IAttributeDisplayFormMetadataObject[],
): boolean {
    if (areObjRefsEqual(left, right)) {
        return true;
    }
    const leftMetadata = findDisplayFormMetadata(left, displayForms);
    const rightMetadata = findDisplayFormMetadata(right, displayForms);
    return !!leftMetadata && !!rightMetadata && leftMetadata.id === rightMetadata.id;
}

function findDisplayFormMetadata(
    ref: ObjRef,
    displayForms: IAttributeDisplayFormMetadataObject[],
): IAttributeDisplayFormMetadataObject | undefined {
    return displayForms.find(
        (displayForm) =>
            areObjRefsEqual(displayForm.ref, ref) ||
            areObjRefsEqual(idRef(displayForm.id, "displayForm"), ref) ||
            areObjRefsEqual(uriRef(displayForm.uri), ref),
    );
}

function attributeRefForDisplayForm(
    displayForm: ObjRef,
    displayForms: IAttributeDisplayFormMetadataObject[],
    attributesWithReferences?: IAttributeWithReferences[],
): ObjRef | undefined {
    const metadata = findDisplayFormMetadata(displayForm, displayForms);
    if (metadata?.attribute) {
        return metadata.attribute;
    }

    for (const entry of attributesWithReferences ?? []) {
        const ownsDisplayForm = entry.attribute.displayForms?.some((candidate) =>
            displayFormsEquivalent(candidate.ref, displayForm, displayForms),
        );
        if (ownsDisplayForm) {
            return entry.attribute.ref;
        }
    }
    return undefined;
}
