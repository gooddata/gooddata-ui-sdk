// (C) 2020-2026 GoodData Corporation

import { uniqWith } from "lodash-es";
import { invariant } from "ts-invariant";

import {
    type AttributeDisplayFormType,
    type IAttributeDescriptor,
    areObjRefsEqual,
} from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import {
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
} from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectSelectedWidgetRef } from "../../../../../model/store/ui/uiSelectors.js";
import { type IAttributeWithDisplayForm } from "../../../../drill/DrillConfigPanel/DrillToUrl/types.js";

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
