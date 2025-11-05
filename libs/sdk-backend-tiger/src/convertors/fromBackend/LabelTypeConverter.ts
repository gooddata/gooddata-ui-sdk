// (C) 2022-2025 GoodData Corporation

import { JsonApiLabelOutAttributesValueTypeEnum } from "@gooddata/api-client-tiger";
import { AttributeDisplayFormType } from "@gooddata/sdk-model";

/**
 * convert tiger label type values to common text representation
 */
export function convertLabelType(
    type?: JsonApiLabelOutAttributesValueTypeEnum,
): AttributeDisplayFormType | undefined {
    if (!type) {
        return undefined;
    }

    switch (type) {
        case JsonApiLabelOutAttributesValueTypeEnum.HYPERLINK:
            return "GDC.link";

        case JsonApiLabelOutAttributesValueTypeEnum.IMAGE:
            return "GDC.image";

        case JsonApiLabelOutAttributesValueTypeEnum.GEO:
            return "GDC.geo.pin";

        case JsonApiLabelOutAttributesValueTypeEnum.GEO_LATITUDE:
            return "GDC.geo.pin_latitude";

        case JsonApiLabelOutAttributesValueTypeEnum.GEO_LONGITUDE:
            return "GDC.geo.pin_longitude";

        case JsonApiLabelOutAttributesValueTypeEnum.GEO_AREA:
            return "GDC.geo.area";

        default:
            return undefined;
    }
}
