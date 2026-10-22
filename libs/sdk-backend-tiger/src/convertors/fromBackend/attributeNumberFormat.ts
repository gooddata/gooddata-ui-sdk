// (C) 2026 GoodData Corporation

import { type ComputedAttributeDataType } from "@gooddata/sdk-model";

const NUMERIC_DATA_TYPES: ReadonlyArray<ComputedAttributeDataType> = ["INT", "NUMERIC"];

/**
 * Format applied to numeric attribute values without a format of their own. Unlike the measure default,
 * it keeps a leading digit, so a zero element reads "0" and not an empty label.
 */
const DEFAULT_ATTRIBUTE_NUMBER_FORMAT = "#,##0.##";

/**
 * Number format of the attribute's element values, as stated by the backend for the attribute header
 * of an execution result or for an elements response.
 *
 * @remarks
 * Only numeric attributes (`INT` or `NUMERIC` data type, i.e. numeric computed attributes) are formatted:
 * with their own format or, when they have none, with the attribute default. Everything else yields
 * undefined and stays unformatted, even with a format, because formatting would mangle text values.
 *
 * @param numberFormat - format the backend states for the values
 * @param dataType - data type of the values
 * @internal
 */
export function attributeNumberFormat(
    numberFormat: string | undefined,
    dataType: ComputedAttributeDataType | undefined,
): string | undefined {
    if (dataType === undefined || !NUMERIC_DATA_TYPES.includes(dataType)) {
        return undefined;
    }

    return numberFormat || DEFAULT_ATTRIBUTE_NUMBER_FORMAT;
}
