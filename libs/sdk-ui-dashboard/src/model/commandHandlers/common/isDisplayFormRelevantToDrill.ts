// (C) 2021-2025 GoodData Corporation
import {
    type IAttributeDisplayFormMetadataObject,
    type InsightDrillDefinition,
    areObjRefsEqual,
    isDrillFromAttribute,
} from "@gooddata/sdk-model";
import { type IAvailableDrillTargets } from "@gooddata/sdk-ui";

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
