// (C) 2020-2023 GoodData Corporation
import { areObjRefsEqual, AttributeDisplayFormType, IAttributeDescriptor } from "@gooddata/sdk-model";
import uniqWith from "lodash/uniqWith.js";
import { invariant } from "ts-invariant";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
    selectSelectedWidgetRef,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { IAttributeWithDisplayForm } from "../../../../drill/DrillConfigPanel/DrillToUrl/types.js";

export interface IUseAttributesWithDisplayFormsResult {
    linkDisplayForms: IAttributeWithDisplayForm[];
    allDisplayForms: IAttributeWithDisplayForm[];
}

function areAttributesWithDisplayFormsEqual(a: IAttributeWithDisplayForm, b: IAttributeWithDisplayForm) {
    return areObjRefsEqual(a.displayForm.ref, b.displayForm.ref);
}

export function useAttributesWithDisplayForms(
    attributes: IAttributeDescriptor[],
): IUseAttributesWithDisplayFormsResult {
    const widgetRef = useDashboardSelector(selectSelectedWidgetRef);
    invariant(widgetRef, "must have selected widget");

    const allAttributes = useDashboardSelector(selectAllCatalogAttributesMap);
    const allDisplayForms = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    const incomingDisplayFormRefs = attributes.map((a) => a.attributeHeader.ref);

    const result = incomingDisplayFormRefs.reduce(
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
                (df) => (df.displayFormType as AttributeDisplayFormType) === "GDC.link",
            );

            result.linkDisplayForms.push(
                ...linkDisplayForms.map((df) => ({
                    attribute: attribute.attribute,
                    attributeDisplayFormRef: ref,
                    displayForm: df,
                })),
            );

            result.allDisplayForms.push(
                ...attribute.attribute.displayForms.map((df) => ({
                    attribute: attribute.attribute,
                    attributeDisplayFormRef: ref,
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

    return {
        allDisplayForms: uniqWith(result.allDisplayForms, areAttributesWithDisplayFormsEqual),
        linkDisplayForms: uniqWith(result.linkDisplayForms, areAttributesWithDisplayFormsEqual),
    };
}
