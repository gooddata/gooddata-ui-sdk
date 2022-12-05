// (C) 2020-2022 GoodData Corporation
import {
    areObjRefsEqual,
    IAttributeDescriptor,
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
} from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import intersectionWith from "lodash/intersectionWith";
import { AttributeDisplayFormType } from "../../../../drill/types";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
    selectDrillTargetsByWidgetRef,
    selectSelectedWidgetRef,
    useDashboardSelector,
} from "../../../../../model";

interface IAttributeWithDisplayForm {
    attribute: IAttributeMetadataObject;
    displayForm: IAttributeDisplayFormMetadataObject;
}

interface IUseAttributesWithDisplayFormsResult {
    linkDisplayForms: IAttributeWithDisplayForm[];
    allDisplayForms: IAttributeWithDisplayForm[];
}

export function useAttributesWithDisplayForms(
    attributes: IAttributeDescriptor[],
): IUseAttributesWithDisplayFormsResult {
    const widgetRef = useDashboardSelector(selectSelectedWidgetRef);
    invariant(widgetRef, "must have selected widget");

    const drillTargets = useDashboardSelector(selectDrillTargetsByWidgetRef(widgetRef));
    const allAttributes = useDashboardSelector(selectAllCatalogAttributesMap);
    const allDisplayForms = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    // restrict the possible attributes be the available drill targets
    const drillTargetDisplayFormRefs =
        drillTargets?.availableDrillTargets?.attributes?.map((a) => a.attribute.attributeHeader.ref) ?? [];

    const incomingDisplayFormRefs = attributes.map((a) => a.attributeHeader.ref);

    const candidateDisplayFormRefs = intersectionWith(
        drillTargetDisplayFormRefs,
        incomingDisplayFormRefs,
        areObjRefsEqual,
    );

    return candidateDisplayFormRefs.reduce(
        (result: IUseAttributesWithDisplayFormsResult, ref) => {
            const displayForm = allDisplayForms.get(ref);
            if (!displayForm) {
                return result;
            }
            const attribute = allAttributes.get(displayForm.attribute);
            if (!attribute) {
                return result;
            }

            const linkDisplayForms = attribute.attribute.displayForms.filter(
                (df) => df.displayFormType === AttributeDisplayFormType.HYPERLINK,
            );

            result.linkDisplayForms.push(
                ...linkDisplayForms.map((df) => ({
                    attribute: attribute.attribute,
                    displayForm: df,
                })),
            );

            result.allDisplayForms.push(
                ...attribute.attribute.displayForms.map((df) => ({
                    attribute: attribute.attribute,
                    displayForm: df,
                })),
            );

            return result;
        },
        {
            linkDisplayForms: [],
            allDisplayForms: [],
        },
    );
}
