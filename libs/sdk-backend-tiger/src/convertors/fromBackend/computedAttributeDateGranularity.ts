// (C) 2026 GoodData Corporation

import { type JsonApiAttributeOutAttributesGranularityEnum } from "@gooddata/api-client-tiger";
import { type ComputedAttributeDataType, type DateAttributeGranularity } from "@gooddata/sdk-model";

import { isSupportedTigerGranularity, toSdkGranularity } from "./dateGranularityConversions.js";

/**
 * Granularity assumed for the values of a date computed attribute of the given data type when the backend
 * states none.
 *
 * @remarks
 * The backend does not send a granularity for computed attributes yet, so their values are parsed as full
 * dates or full timestamps. Once it does, the stated granularity takes precedence.
 */
const COMPUTED_ATTRIBUTE_FALLBACK_GRANULARITIES: Partial<
    Record<ComputedAttributeDataType, JsonApiAttributeOutAttributesGranularityEnum>
> = {
    DATE: "DAY",
    TIMESTAMP: "SECOND",
    TIMESTAMP_TZ: "SECOND",
};

/**
 * Granularity to parse date values of an attribute with: the one the backend states or, for a date
 * computed attribute without it, the fallback granularity of its data type.
 *
 * @remarks
 * Only computed attributes with a date data type have date values; the values of other computed
 * attributes are never formatted as dates, whatever granularity or format the backend sends for them.
 *
 * The fallback is used only for parsing and formatting the values. It is never put on the attribute
 * descriptor, where a granularity marks the attribute as a date attribute for drilling and KDA.
 * A granularity the SDK does not model gives none, so the values are not formatted.
 *
 * @param granularity - granularity the backend states for the values
 * @param dataType - data type of the values, stated for computed attributes only
 * @param isComputedAttribute - whether the values belong to a computed attribute
 * @internal
 */
export function dateValueGranularity(
    granularity: JsonApiAttributeOutAttributesGranularityEnum | undefined,
    dataType: ComputedAttributeDataType | undefined,
    isComputedAttribute: boolean,
): DateAttributeGranularity | undefined {
    const fallbackGranularity = dataType ? COMPUTED_ATTRIBUTE_FALLBACK_GRANULARITIES[dataType] : undefined;

    if (isComputedAttribute && !fallbackGranularity) {
        return undefined;
    }

    const valueGranularity = granularity ?? fallbackGranularity;

    return valueGranularity && isSupportedTigerGranularity(valueGranularity)
        ? toSdkGranularity(valueGranularity)
        : undefined;
}
