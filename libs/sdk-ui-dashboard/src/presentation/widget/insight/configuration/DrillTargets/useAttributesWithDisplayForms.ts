// (C) 2020-2022 GoodData Corporation
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    isCatalogAttribute,
} from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { AttributeDisplayFormType } from "../../../../drill/types";
import {
    selectAllCatalogAttributesMap,
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

export function useAttributesWithDisplayForms(): IUseAttributesWithDisplayFormsResult {
    const widgetRef = useDashboardSelector(selectSelectedWidgetRef);
    invariant(widgetRef, "must have selected widget");

    const drillTargets = useDashboardSelector(selectDrillTargetsByWidgetRef(widgetRef));
    const allAttributes = useDashboardSelector(selectAllCatalogAttributesMap);

    const availableAttributes = drillTargets?.availableDrillTargets?.attributes ?? [];
    const attributes = availableAttributes.map((drillTarget) =>
        allAttributes.get(drillTarget.attribute.attributeHeader.formOf.ref),
    );

    return attributes.reduce(
        (result: IUseAttributesWithDisplayFormsResult, item) => {
            if (!item || !isCatalogAttribute(item.attribute)) {
                return result;
            }

            const linkDisplayForms = item.attribute.displayForms.filter(
                (df) => df.displayFormType === AttributeDisplayFormType.HYPERLINK,
            );

            result.linkDisplayForms.push(
                ...linkDisplayForms.map((df) => ({
                    attribute: item.attribute,
                    displayForm: df,
                })),
            );

            result.allDisplayForms.push(
                ...item.attribute.displayForms.map((df) => ({
                    attribute: item.attribute,
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
