// (C) 2022 GoodData Corporation

import { JsonApiLabelOutAttributesValueTypeEnum } from "@gooddata/api-client-tiger";

/**
 * convert tiger label type values to common text representation
 */
export function convertLabelType(
    type?: JsonApiLabelOutAttributesValueTypeEnum,
    labelId?: string,
): string | undefined {
    if (!type) {
        return undefined;
    }

    // TODO POC: remove this patched type and labelID parameter, these are used only in POC to simulate these
    //   label types until modeler supports them
    const patchedType =
        labelId === "city.latitude"
            ? JsonApiLabelOutAttributesValueTypeEnum.GEO_LATITUDE
            : labelId === "city.longitude"
            ? JsonApiLabelOutAttributesValueTypeEnum.GEO_LONGITUDE
            : type;

    switch (patchedType) {
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
