// (C) 2020-2023 GoodData Corporation
import {
    areObjRefsEqual,
    IAttributeDescriptor,
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    AttributeDisplayFormType,
} from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import uniqWith from "lodash/uniqWith";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
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

    return {
        allDisplayForms: uniqWith(result.allDisplayForms, areAttributesWithDisplayFormsEqual),
        linkDisplayForms: uniqWith(result.linkDisplayForms, areAttributesWithDisplayFormsEqual),
    };
}
