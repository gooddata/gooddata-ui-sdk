// (C) 2022-2023 GoodData Corporation

import { JsonApiLabelOutAttributesValueTypeEnum } from "@gooddata/api-client-tiger";
import { AttributeDisplayFormType } from "@gooddata/sdk-model";

/**
 * convert tiger label type values to common text representation
 */
export function convertLabelType(type?: JsonApiLabelOutAttributesValueTypeEnum): string | undefined {
    if (!type) {
        return undefined;
    }

    switch (type) {
        case JsonApiLabelOutAttributesValueTypeEnum.HYPERLINK:
            return AttributeDisplayFormType.HYPERLINK;

        case JsonApiLabelOutAttributesValueTypeEnum.GEO:
            return AttributeDisplayFormType.GEO_PUSHPIN;

        case JsonApiLabelOutAttributesValueTypeEnum.GEO_LATITUDE:
            return AttributeDisplayFormType.GEO_PUSHPIN_LATITUDE;

        case JsonApiLabelOutAttributesValueTypeEnum.GEO_LONGITUDE:
            return AttributeDisplayFormType.GEO_PUSHPIN_LONGITUDE;

        default:
            return undefined;
    }
}
