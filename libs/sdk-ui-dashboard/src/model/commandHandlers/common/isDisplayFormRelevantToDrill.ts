// (C) 2021-2022 GoodData Corporation
import {
    InsightDrillDefinition,
    isDrillFromAttribute,
    IAttributeDisplayFormMetadataObject,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import { IAvailableDrillTargets } from "@gooddata/sdk-ui";
import {
    getLocalIdentifierOrDie,
    getValidDrillOriginAttributes,
} from "../../../_staging/drills/drillingUtils.js";

export function isDisplayFormRelevantToDrill(
    drillDefinition: InsightDrillDefinition,
    availableDrillTargets: IAvailableDrillTargets,
    displayForm: IAttributeDisplayFormMetadataObject,
) {
    const attributeRef = isDrillFromAttribute(drillDefinition.origin)
        ? drillDefinition.origin?.attribute
        : drillDefinition.origin?.measure;

    const localId = getLocalIdentifierOrDie(attributeRef);

    const relevantAttributes = getValidDrillOriginAttributes(availableDrillTargets, localId);

    return relevantAttributes.some((attribute) =>
        areObjRefsEqual(displayForm.attribute, attribute.attributeHeader.formOf),
    );
}
