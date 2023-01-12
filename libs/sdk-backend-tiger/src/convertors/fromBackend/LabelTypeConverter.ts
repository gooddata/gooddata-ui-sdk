// (C) 2022-2023 GoodData Corporation

import { JsonApiLabelOutAttributesValueTypeEnum } from "@gooddata/api-client-tiger";

/**
 * convert tiger label type values to common text representation
 */
export function convertLabelType(type?: JsonApiLabelOutAttributesValueTypeEnum): string | undefined {
    if (!type) {
        return undefined;
    }

    switch (type) {
        case JsonApiLabelOutAttributesValueTypeEnum.HYPERLINK:
            return "GDC.link";

        case JsonApiLabelOutAttributesValueTypeEnum.GEO:
            return "GDC.geo.pin";

        case JsonApiLabelOutAttributesValueTypeEnum.GEO_LATITUDE:
            return "GDC.geo.pin_latitude";

        case JsonApiLabelOutAttributesValueTypeEnum.GEO_LONGITUDE:
            return "GDC.geo.pin_longitude";

        default:
            return undefined;
    }
}
