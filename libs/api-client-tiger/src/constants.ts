// (C) 2019-2026 GoodData Corporation

/**
 * @deprecated - we use application/json instead of application/vnd.gooddata.api+json. Keeping the export for backwards compatibility.
 * @public
 */
export const JSON_API_HEADER_VALUE = "application/vnd.gooddata.api+json";

/**
 * @deprecated - we use application/json instead of application/vnd.gooddata.api+json. Keeping the export for backwards compatibility.
 * @public
 */
export const jsonApiHeaders = {
    Accept: JSON_API_HEADER_VALUE,
    "Content-Type": JSON_API_HEADER_VALUE,
};

export const ValidateRelationsHeader = { "X-GDC-VALIDATE-RELATIONS": "true" };
