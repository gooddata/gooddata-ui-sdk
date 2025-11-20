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
        case "HYPERLINK":
            return "GDC.link";

        case "IMAGE":
            return "GDC.image";

        case "GEO":
            return "GDC.geo.pin";

        case "GEO_LATITUDE":
            return "GDC.geo.pin_latitude";

        case "GEO_LONGITUDE":
            return "GDC.geo.pin_longitude";

        case "GEO_AREA":
            return "GDC.geo.area";

        default:
            return undefined;
    }
}
