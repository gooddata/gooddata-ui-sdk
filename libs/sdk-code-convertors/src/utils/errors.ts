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
    DuplicateFieldName = "core.duplicateFieldName",
    DuplicateFilterName = "core.duplicateFilterName",
    DuplicateLayerIdentifier = "core.duplicateLayerIdentifier",
    DuplicateTabIdentifier = "core.duplicateTabIdentifier",
    TabsAndRootContentMutuallyExclusive = "core.tabsAndRootContentMutuallyExclusive",
    InvalidIanaTimezoneId = "core.invalidIanaTimezoneId",
    UnsupportedContentVersion = "core.unsupportedContentVersion",
    DateFilterWithoutDataSet = "core.dateFilterWithoutDataSet",
    FilterSettingNotStorable = "core.filterSettingNotStorable",
    PagesAndSectionsMutuallyExclusive = "core.pagesAndSectionsMutuallyExclusive",
    PagesOrSectionsRequired = "core.pagesOrSectionsRequired",
    MissingRequiredKey = "core.missingRequiredKey",
    UnsupportedGranularity = "core.unsupportedGranularity",
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
    [CoreErrorCode.DuplicateFieldName]: `Duplicate field name "{0}". Each field a query declares must have a unique name.`,
    [CoreErrorCode.DuplicateFilterName]: `Duplicate filter name "{0}". Each filter in a query must have a unique name, including the filters a date filter carries.`,
    [CoreErrorCode.DuplicateLayerIdentifier]: `Duplicate layer id "{0}". Each layer of a visualisation must have a unique id.`,
    [CoreErrorCode.DuplicateTabIdentifier]: `Duplicate tab identifier "{0}". Each tab must have a unique identifier within the dashboard.`,
    [CoreErrorCode.TabsAndRootContentMutuallyExclusive]: `Dashboard "{0}" defines both "tabs" and root-level "sections" or "filters". These are mutually exclusive — keep all content inside tabs or at the root, not both.`,
    [CoreErrorCode.InvalidIanaTimezoneId]: `"{0}" is not a valid IANA timezone ID. Use a real timezone such as Europe/Prague or $browserDetected.`,
    [CoreErrorCode.UnsupportedContentVersion]: `Expected "{0}", got {1}.`,
    [CoreErrorCode.DateFilterWithoutDataSet]: `Date filter "{0}" names no date dataset. A document date filter must name the date dataset it applies to.`,
    [CoreErrorCode.FilterSettingNotStorable]: `Filter "{0}" sets "{1}", which a {2} cannot store.`,
    [CoreErrorCode.PagesAndSectionsMutuallyExclusive]: `Content defines both "pages" and "sections". Keep the pages at the top level or inside sections, not both.`,
    [CoreErrorCode.PagesOrSectionsRequired]: `Content defines neither "pages" nor "sections". Add one of them; an empty document has "pages: []".`,
    [CoreErrorCode.MissingRequiredKey]: `Missing required key "{0}".`,
    [CoreErrorCode.UnsupportedGranularity]: `Granularity {0} is not supported. Supported granularities: {1}.`,
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
    [CoreErrorCode.DuplicateFieldName]: "DuplicateFieldName",
    [CoreErrorCode.DuplicateFilterName]: "DuplicateFilterName",
    [CoreErrorCode.DuplicateLayerIdentifier]: "DuplicateLayerIdentifier",
    [CoreErrorCode.DuplicateTabIdentifier]: "DuplicateTabIdentifier",
    [CoreErrorCode.TabsAndRootContentMutuallyExclusive]: "TabsAndRootContentMutuallyExclusive",
    [CoreErrorCode.InvalidIanaTimezoneId]: "InvalidIanaTimezoneId",
    [CoreErrorCode.UnsupportedContentVersion]: "UnsupportedContentVersion",
    [CoreErrorCode.DateFilterWithoutDataSet]: "DateFilterWithoutDataSet",
    [CoreErrorCode.FilterSettingNotStorable]: "FilterSettingNotStorable",
    [CoreErrorCode.PagesAndSectionsMutuallyExclusive]: "PagesAndSectionsMutuallyExclusive",
    [CoreErrorCode.PagesOrSectionsRequired]: "PagesOrSectionsRequired",
    [CoreErrorCode.MissingRequiredKey]: "MissingRequiredKey",
    [CoreErrorCode.UnsupportedGranularity]: "UnsupportedGranularity",
};

/**
 * @public
 */
export interface IErrorContext {
    type?: string;
    path?: string[];
    data?: unknown;
}

/**
 * Update error context with new values
 */
export function updateErrorContext(
    context: IErrorContext | undefined,
    props: Partial<IErrorContext>,
): IErrorContext {
    if (context) {
        return {
            ...context,
            ...props,
            path: [...(context.path ?? []), ...(props.path ?? [])],
        };
    }
    return {
        type: props.type ?? "unknown",
        path: props.path ?? [],
        data: props.data ?? {},
    };
}

/**
 * @public
 */
export interface ICoreError extends Error {
    code: CoreErrorCode;
    type: (typeof CoreErrorTypes)[keyof typeof CoreErrorTypes];
    context?: IErrorContext;
}

export function newError(code: CoreErrorCode, params: Array<string> = [], context?: IErrorContext) {
    const err = new Error(buildMessage(CoreErrorMessages[code], params, context)) as ICoreError;

    err.type = CoreErrorTypes[code];
    err.code = code;
    err.context = context;
    return err;
}

export function buildMessage(message: string, params: Array<string>, context?: IErrorContext) {
    const m = message.replace(/\{(\d+)}/g, (match, index: string) => params[Number(index)] ?? match);

    if (context?.path) {
        return `${m} in: ${context.path.join("/")}`;
    }
    return m;
}
