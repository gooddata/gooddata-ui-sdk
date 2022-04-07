// (C) 2022 GoodData Corporation

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

        default:
            return undefined;
    }
}
