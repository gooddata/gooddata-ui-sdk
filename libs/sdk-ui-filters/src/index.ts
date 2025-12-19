// (C) 2019-2025 GoodData Corporation

/**
 * This package provides several React components related to filters.
 *
 * @remarks
 * These include attribute filters, measure value filters, ranking filters, and date filters and utilities
 * to work with those. You can use them to quickly add filtering to your application.
 *
 * @packageDocumentation
 */

export type {
    IDateFilterCallbackProps,
    IDateFilterOwnProps,
    IDateFilterProps,
    IDateFilterState,
    IDateFilterStatePropsIntersection,
    AbsoluteDateFilterOption,
    DateFilterOption,
    DateFilterRelativeOptionGroup,
    IDateFilterOptionsByType,
    IExtendedDateFilterErrors,
    IDateFilterRelativeFormErrors,
    RelativeDateFilterOption,
    IUiAbsoluteDateFilterForm,
    IUiRelativeDateFilterForm,
    GranularityIntlKey,
    DateFilterLabelMode,
    IDateAndMessageTranslator,
    IDateTranslator,
    IMessageTranslator,
    IFilterConfigurationProps,
    IDateFilterAbsoluteDateTimeFormErrors,
    DateRangePosition,
    CalendarTabType,
    IFiscalTabsConfig,
    IUiRelativeDateFilterFormLike,
} from "./DateFilter/index.js";
export {
    DateFilter,
    DateFilterHelpers,
    defaultDateFilterOptions,
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
    isRelativeDateFilterWithBoundOption,
    filterVisibleDateFilterOptions,
    isUiRelativeDateFilterForm,
    getLocalizedIcuDateFormatPattern,
    getFiscalTabsConfig,
    hasFiscalPresets,
    hasStandardPresets,
    filterStandardPresets,
    filterFiscalPresets,
    filterStandardGranularities,
    filterFiscalGranularities,
    getTabForPreset,
    isFiscalGranularity,
    ensureCompatibleGranularity,
} from "./DateFilter/index.js";
export type {
    IMeasureValueFilterProps,
    IMeasureValueFilterState,
} from "./MeasureValueFilter/MeasureValueFilter.js";
export { MeasureValueFilter } from "./MeasureValueFilter/MeasureValueFilter.js";
export type { IMeasureValueFilterDropdownProps } from "./MeasureValueFilter/MeasureValueFilterDropdown.js";
export { MeasureValueFilterDropdown } from "./MeasureValueFilter/MeasureValueFilterDropdown.js";
export type {
    IMeasureValueFilterCommonProps,
    IDimensionalityItem,
    DimensionalityItemType,
    WarningMessage,
    IWarningMessage,
} from "./MeasureValueFilter/typings.js";
export { isWarningMessage } from "./MeasureValueFilter/typings.js";
export type { MeasureValueFilterOperator } from "./MeasureValueFilter/types.js";
export { intervalIncludesZero } from "./MeasureValueFilter/helpers/intervalIncludesZero.js";
export type { IRankingFilterProps } from "./RankingFilter/RankingFilter.js";
export { RankingFilter } from "./RankingFilter/RankingFilter.js";
export type { IRankingFilterDropdownProps } from "./RankingFilter/RankingFilterDropdown.js";
export { RankingFilterDropdown } from "./RankingFilter/RankingFilterDropdown.js";
export type {
    IMeasureDropdownItem,
    IAttributeDropdownItem,
    ICustomGranularitySelection,
} from "./RankingFilter/types.js";

export type {
    Correlation,
    CallbackRegistration,
    Callback,
    CallbackPayloadWithCorrelation,
    Unsubscribe,
    AsyncOperationStatus,
    IAttributeLoader,
    IAttributeElementLoader,
    IAttributeFilterLoader,
    ILoadElementsResult,
    ILoadElementsOptions,
    ILoadIrrelevantElementsResult,
    OnInitCancelCallbackPayload,
    OnInitErrorCallbackPayload,
    OnInitStartCallbackPayload,
    OnInitSuccessCallbackPayload,
    OnLoadAttributeCancelCallbackPayload,
    OnLoadAttributeErrorCallbackPayload,
    OnLoadAttributeStartCallbackPayload,
    OnLoadAttributeSuccessCallbackPayload,
    OnLoadCustomElementsCancelCallbackPayload,
    OnLoadCustomElementsErrorCallbackPayload,
    OnLoadCustomElementsStartCallbackPayload,
    OnLoadCustomElementsSuccessCallbackPayload,
    OnLoadInitialElementsPageCancelCallbackPayload,
    OnLoadInitialElementsPageErrorCallbackPayload,
    OnLoadInitialElementsPageStartCallbackPayload,
    OnLoadInitialElementsPageSuccessCallbackPayload,
    OnLoadNextElementsPageCancelCallbackPayload,
    OnLoadNextElementsPageErrorCallbackPayload,
    OnLoadNextElementsPageStartCallbackPayload,
    OnLoadNextElementsPageSuccessCallbackPayload,
    OnInitTotalCountStartCallbackPayload,
    OnInitTotalCountSuccessCallbackPayload,
    OnInitTotalCountErrorCallbackPayload,
    OnInitTotalCountCancelCallbackPayload,
    OnSelectionChangedCallbackPayload,
    OnSelectionCommittedCallbackPayload,
    OnLoadIrrelevantElementsStartCallbackPayload,
    OnLoadIrrelevantElementsSuccessCallbackPayload,
    OnLoadIrrelevantElementsCancelCallbackPayload,
    OnLoadIrrelevantElementsErrorCallbackPayload,
    IAttributeFilterHandlerOptions,
    IAttributeFilterHandlerOptionsBase,
    AttributeElementKey,
    ISingleSelectionHandler,
    IStagedSingleSelectionHandler,
    ISingleSelectAttributeFilterHandlerOptions,
    InvertableSelection,
    IInvertableSelectionHandler,
    IStagedInvertableSelectionHandler,
    IMultiSelectAttributeFilterHandlerOptions,
    InvertableAttributeElementSelection,
    IAttributeFilterHandler,
    ISingleSelectAttributeFilterHandler,
    IMultiSelectAttributeFilterHandler,
} from "./AttributeFilterHandler/index.js";
export { newAttributeFilterHandler } from "./AttributeFilterHandler/index.js";

export type {
    IAttributeFilterProps,
    IAttributeFilterButtonProps,
    IAttributeFilterBaseProps,
    IAttributeFilterErrorProps,
    IAttributeFilterLoadingProps,
    IAttributeFilterDropdownButtonProps,
    IAttributeFilterDropdownBodyProps,
    IAttributeFilterDropdownActionsProps,
    IAttributeFilterElementsSearchBarProps,
    IAttributeFilterElementsActionsProps,
    IAttributeFilterElementsSelectProps,
    IAttributeFilterElementsSelectItemProps,
    IAttributeFilterElementsSelectErrorProps,
    IAttributeFilterElementsSelectLoadingProps,
    IAttributeFilterEmptyResultProps,
    IAttributeFilterStatusBarProps,
    OnApplyCallbackType,
    OnSelectCallbackType,
    ParentFilterOverAttributeType,
    IAttributeFilterCoreProps,
    IAttributeFilterCustomComponentProps,
    IUseAttributeFilterControllerProps,
    IUseAttributeFilterHandlerProps,
    IAttributeFilterContext,
    IAttributeDatasetInfoProps,
    IAttributeDisplayFormSelectProps,
    IAttributeFilterAllValuesFilteredResultProps,
    IAttributeFilterConfigurationButtonProps,
    IAttributeFilterDeleteButtonProps,
    IAttributeFilterFilteredStatusProps,
    IAttributeFilterSelectionStatusProps,
    IUseAttributeFilterSearchProps,
    AttributeFilterController,
    AttributeFilterControllerData,
    AttributeFilterControllerCallbacks,
    IAttributeFilterDependencyTooltipProps,
} from "./AttributeFilter/index.js";
export {
    AttributeFilter,
    AttributeFilterButton,
    useAttributeFilterController,
    useAttributeFilterHandler,
    useAttributeFilterContext,
    AttributeDisplayFormSelect,
    AttributeFilterAllValuesFilteredResult,
    AttributeFilterConfigurationButton,
    AttributeFilterDeleteButton,
    AttributeFilterDropdownActions,
    AttributeFilterDropdownBody,
    AttributeFilterDropdownButton,
    AttributeFilterElementsActions,
    AttributeFilterElementsSearchBar,
    AttributeFilterElementsSelect,
    AttributeFilterElementsSelectError,
    AttributeFilterElementsSelectItem,
    SingleSelectionAttributeFilterElementsSelectItem,
    AttributeFilterElementsSelectLoading,
    AttributeFilterEmptyAttributeResult,
    AttributeFilterEmptyResult,
    AttributeFilterEmptySearchResult,
    AttributeFilterError,
    AttributeFilterFilteredStatus,
    AttributeFilterLoading,
    AttributeFilterSelectionStatus,
    AttributeFilterSimpleDropdownButton,
    AttributeFilterSimpleDropdownButtonWithSelection,
    AttributeFilterStatusBar,
    SingleSelectionAttributeFilterStatusBar,
    AttributeDatasetInfo,
    AttributeFilterButtonTooltip,
    EmptyElementsSearchBar,
    useAutoOpenAttributeFilterDropdownButton,
    useOnCloseAttributeFilterDropdownButton,
    useAttributeFilterSearch,
    AttributeFilterDependencyTooltip,
    getAttributeFilterSubtitle,
} from "./AttributeFilter/index.js";

export type { IFilterButtonCustomIcon, VisibilityMode } from "./shared/index.js";

export type { IDateFilterButtonProps } from "./DateFilter/DateFilterButton/DateFilterButton.js";
