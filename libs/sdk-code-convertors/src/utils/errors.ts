// (C) 2023-2026 GoodData Corporation

/**
 * @public
 */
export enum CoreErrorCode {
    //convertors
    BucketItemTypeNotSupported = "core.bucketItemTypeNotSupported",
    FilterItemTypeNotSupported = "core.filterItemTypeNotSupported",
    ItemNotSupported = "core.itemNotSupported",
    ReferenceTypeNotSupported = "core.referenceTypeNotSupported",
    VisualizationNotSupported = "core.visualizationNotSupported",
    LayerTypeNotSupported = "core.layerTypeNotSupported",
    MultipleDateDataSets = "core.multipleDateDataSets",
    OnlyOneDateDatasetAllowed = "core.onlyOneDateDatasetAllowed",
    OnlyOneAttributeItemAllowed = "core.onlyOneAttributeItemAllowed",
    MultipleCommonDateFilters = "core.multipleCommonDateFilters",
    DuplicateFilterLocalIdentifier = "core.duplicateFilterLocalIdentifier",
    DuplicateTabIdentifier = "core.duplicateTabIdentifier",
}

/**
 * @public
 */
export const CoreErrorMessages: Record<CoreErrorCode, string> = {
    [CoreErrorCode.BucketItemTypeNotSupported]: "Report item type is not supported. Item: {0}",
    [CoreErrorCode.FilterItemTypeNotSupported]: "Filter item type is not supported. Item: {0}",
    [CoreErrorCode.ReferenceTypeNotSupported]: "Reference type is not supported. Item: {0}",
    [CoreErrorCode.ItemNotSupported]: "Item is not supported. Item: {0}",
    [CoreErrorCode.VisualizationNotSupported]: "Visualisation is not supported. Url: {0}",
    [CoreErrorCode.LayerTypeNotSupported]: "Layer type is not supported. Type: {0}",
    [CoreErrorCode.MultipleDateDataSets]: "Multiple date datasets are not supported. Item: {0}",
    [CoreErrorCode.OnlyOneDateDatasetAllowed]: `Dashboard filters contains more filters with same date dataset "{0}".`,
    [CoreErrorCode.OnlyOneAttributeItemAllowed]: `Dashboard filters contains more filters with same attribute or label "{0}".`,
    [CoreErrorCode.MultipleCommonDateFilters]: `Multiple usage of common date filters in dashboard. Define exactly one date filter that has no date dataset defined.`,
    [CoreErrorCode.DuplicateFilterLocalIdentifier]: `Duplicate filter local identifier "{0}". Each filter must have a unique local identifier across a dashboard tab, including filters in groups.`,
    [CoreErrorCode.DuplicateTabIdentifier]: `Duplicate tab identifier "{0}". Each tab must have a unique identifier within the dashboard.`,
};

/**
 * @public
 */
export const CoreErrorTypes: Record<CoreErrorCode, string> = {
    [CoreErrorCode.BucketItemTypeNotSupported]: "BucketItemTypeNotSupported",
    [CoreErrorCode.FilterItemTypeNotSupported]: "FilterItemTypeNotSupported",
    [CoreErrorCode.ReferenceTypeNotSupported]: "ReferenceTypeNotSupported",
    [CoreErrorCode.ItemNotSupported]: "ItemNotSupported",
    [CoreErrorCode.VisualizationNotSupported]: "VisualizationNotSupported",
    [CoreErrorCode.LayerTypeNotSupported]: "LayerTypeNotSupported",
    [CoreErrorCode.MultipleDateDataSets]: "MultipleDateDataSets",
    [CoreErrorCode.OnlyOneDateDatasetAllowed]: "OnlyOneDateDatasetAllowed",
    [CoreErrorCode.OnlyOneAttributeItemAllowed]: "OnlyOneAttributeItemAllowed",
    [CoreErrorCode.MultipleCommonDateFilters]: "MultipleCommonDateFilters",
    [CoreErrorCode.DuplicateFilterLocalIdentifier]: "DuplicateFilterLocalIdentifier",
    [CoreErrorCode.DuplicateTabIdentifier]: "DuplicateTabIdentifier",
};

/**
 * @public
 */
export interface ICoreError extends Error {
    code: CoreErrorCode;
    type: (typeof CoreErrorTypes)[keyof typeof CoreErrorTypes];
}

export function newError(code: CoreErrorCode, params: Array<string> = []) {
    const err = new Error(buildMessage(CoreErrorMessages[code], params)) as ICoreError;

    err.type = CoreErrorTypes[code];
    err.code = code;
    return err;
}

export function buildMessage(message: string, params: Array<string>) {
    return params.reduce(
        (msg, param, index) => msg.replace(new RegExp(`\\{${index}}`, "gi"), param),
        message,
    );
}
