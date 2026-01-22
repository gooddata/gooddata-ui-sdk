// (C) 2019-2026 GoodData Corporation

/**
 * This package provides several React components related to filters.
 *
 * @remarks
 * These include attribute filters, measure value filters, ranking filters, and date filters and utilities
 * to work with those. You can use them to quickly add filtering to your application.
 *
 * @packageDocumentation
 */

// DateFilter main component and types
export {
    DateFilter,
    type IDateFilterCallbackProps,
    type IDateFilterOwnProps,
    type IDateFilterProps,
    type IDateFilterState,
    type IDateFilterStatePropsIntersection,
} from "./DateFilter/DateFilter.js";

// DateFilter helpers (aggregated object)
export { DateFilterHelpers } from "./DateFilter/index.js";

// DateFilter interfaces
export {
    type AbsoluteDateFilterOption,
    type DateFilterOption,
    type DateFilterRelativeOptionGroup,
    type IDateFilterOptionsByType,
    type IExtendedDateFilterErrors,
    type IDateFilterRelativeFormErrors,
    type RelativeDateFilterOption,
    type IUiAbsoluteDateFilterForm,
    type IUiRelativeDateFilterForm,
    type DateRangePosition,
    type IDateFilterAbsoluteDateTimeFormErrors,
    isAbsoluteDateFilterOption,
    isRelativeDateFilterOption,
    isRelativeDateFilterWithBoundOption,
    isUiRelativeDateFilterForm,
} from "./DateFilter/interfaces/index.js";

// DateFilter constants
export { defaultDateFilterOptions } from "./DateFilter/constants/config.js";
export { type GranularityIntlKey, type DateFilterLabelMode } from "./DateFilter/constants/i18n.js";

// DateFilter utils
export type {
    IDateAndMessageTranslator,
    IDateTranslator,
    IMessageTranslator,
} from "./DateFilter/utils/Translations/Translators.js";
export { filterVisibleDateFilterOptions } from "./DateFilter/utils/OptionUtils.js";
export { getLocalizedIcuDateFormatPattern } from "./DateFilter/utils/FormattingUtils.js";
export {
    type CalendarTabType,
    type IFiscalTabsConfig,
    type IUiRelativeDateFilterFormLike,
    getFiscalTabsConfig,
    getDefaultCalendarTab,
    getFilteredPresets,
    getFilteredGranularities,
    hasFiscalPresets,
    hasStandardPresets,
    filterStandardPresets,
    filterFiscalPresets,
    filterStandardGranularities,
    filterFiscalGranularities,
    getTabForPreset,
    isFiscalGranularity,
    ensureCompatibleGranularity,
} from "./DateFilter/utils/presetFilterUtils.js";

// DateFilter body types
export type { IFilterConfigurationProps } from "./DateFilter/DateFilterBody/types.js";
export {
    type IMeasureValueFilterProps,
    type IMeasureValueFilterState,
    MeasureValueFilter,
} from "./MeasureValueFilter/MeasureValueFilter.js";
export {
    type IMeasureValueFilterDropdownProps,
    MeasureValueFilterDropdown,
} from "./MeasureValueFilter/MeasureValueFilterDropdown.js";
export {
    type IMeasureValueFilterCommonProps,
    type IDimensionalityItem,
    type DimensionalityItemType,
    type WarningMessage,
    type IWarningMessage,
    isWarningMessage,
} from "./MeasureValueFilter/typings.js";
export type { MeasureValueFilterOperator } from "./MeasureValueFilter/types.js";
export { intervalIncludesZero } from "./MeasureValueFilter/helpers/intervalIncludesZero.js";
export { type IRankingFilterProps, RankingFilter } from "./RankingFilter/RankingFilter.js";
export {
    type IRankingFilterDropdownProps,
    RankingFilterDropdown,
} from "./RankingFilter/RankingFilterDropdown.js";
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
    AttributeElementKey,
} from "./AttributeFilterHandler/types/common.js";
export type {
    ISingleSelectionHandler,
    IStagedSingleSelectionHandler,
    InvertableSelection,
    IInvertableSelectionHandler,
    IStagedInvertableSelectionHandler,
    OnSelectionChangedCallbackPayload,
    OnSelectionCommittedCallbackPayload,
} from "./AttributeFilterHandler/types/selectionHandler.js";
export type {
    IAttributeLoader,
    OnLoadAttributeStartCallbackPayload,
    OnLoadAttributeSuccessCallbackPayload,
    OnLoadAttributeErrorCallbackPayload,
    OnLoadAttributeCancelCallbackPayload,
} from "./AttributeFilterHandler/types/attributeLoader.js";
export type {
    ILoadElementsResult,
    ILoadIrrelevantElementsResult,
    ILoadElementsOptions,
    IAttributeElementLoader,
    OnLoadInitialElementsPageStartCallbackPayload,
    OnLoadInitialElementsPageSuccessCallbackPayload,
    OnLoadInitialElementsPageErrorCallbackPayload,
    OnLoadInitialElementsPageCancelCallbackPayload,
    OnLoadNextElementsPageStartCallbackPayload,
    OnLoadNextElementsPageSuccessCallbackPayload,
    OnLoadNextElementsPageErrorCallbackPayload,
    OnLoadNextElementsPageCancelCallbackPayload,
    OnLoadCustomElementsStartCallbackPayload,
    OnLoadCustomElementsSuccessCallbackPayload,
    OnLoadCustomElementsErrorCallbackPayload,
    OnLoadCustomElementsCancelCallbackPayload,
    OnLoadIrrelevantElementsStartCallbackPayload,
    OnLoadIrrelevantElementsSuccessCallbackPayload,
    OnLoadIrrelevantElementsErrorCallbackPayload,
    OnLoadIrrelevantElementsCancelCallbackPayload,
    OnInitTotalCountStartCallbackPayload,
    OnInitTotalCountSuccessCallbackPayload,
    OnInitTotalCountErrorCallbackPayload,
    OnInitTotalCountCancelCallbackPayload,
} from "./AttributeFilterHandler/types/elementsLoader.js";
export type {
    IAttributeFilterLoader,
    OnInitStartCallbackPayload,
    OnInitSuccessCallbackPayload,
    OnInitErrorCallbackPayload,
    OnInitCancelCallbackPayload,
} from "./AttributeFilterHandler/types/attributeFilterLoader.js";
export type {
    InvertableAttributeElementSelection,
    IMultiSelectAttributeFilterHandler,
    ISingleSelectAttributeFilterHandler,
    IAttributeFilterHandler,
} from "./AttributeFilterHandler/types/attributeFilterHandler.js";
export {
    type IAttributeFilterHandlerOptions,
    type IAttributeFilterHandlerOptionsBase,
    type ISingleSelectAttributeFilterHandlerOptions,
    type IMultiSelectAttributeFilterHandlerOptions,
    newAttributeFilterHandler,
} from "./AttributeFilterHandler/factory.js";

// AttributeFilter types
export type {
    ParentFilterOverAttributeType,
    OnApplyCallbackType,
    OnSelectCallbackType,
    IAttributeFilterBaseProps,
    IAttributeFilterCoreProps,
    IAttributeFilterCustomComponentProps,
} from "./AttributeFilter/types.js";

// AttributeFilter main components
export { type IAttributeFilterProps, AttributeFilter } from "./AttributeFilter/AttributeFilter.js";
export {
    type IAttributeFilterButtonProps,
    AttributeFilterButton,
} from "./AttributeFilter/AttributeFilterButton.js";

// AttributeFilter hooks
export {
    type IUseAttributeFilterControllerProps,
    useAttributeFilterController,
} from "./AttributeFilter/hooks/useAttributeFilterController.js";
export type {
    AttributeFilterController,
    AttributeFilterControllerData,
    AttributeFilterControllerCallbacks,
} from "./AttributeFilter/hooks/types.js";
export {
    type IUseAttributeFilterHandlerProps,
    useAttributeFilterHandler,
} from "./AttributeFilter/hooks/useAttributeFilterHandler.js";
export {
    type IAttributeFilterContext,
    useAttributeFilterContext,
} from "./AttributeFilter/Context/AttributeFilterContext.js";
export {
    type IUseAttributeFilterSearchProps,
    useAttributeFilterSearch,
} from "./AttributeFilter/hooks/useAttributeFilterSearch.js";
export { getAttributeFilterSubtitle } from "./AttributeFilter/utils.js";

// AttributeFilter Components - DropdownButton
export {
    type IAttributeFilterDropdownButtonProps,
    AttributeFilterDropdownButton,
} from "./AttributeFilter/Components/DropdownButton/AttributeFilterDropdownButton.js";
export { AttributeFilterButtonTooltip } from "./AttributeFilter/Components/DropdownButton/AttributeFilterButtonTooltip.js";
export {
    AttributeFilterSimpleDropdownButton,
    AttributeFilterSimpleDropdownButtonWithSelection,
} from "./AttributeFilter/Components/DropdownButton/AttributeFilterSimpleDropdownButton.js";

// AttributeFilter Components - Dropdown
export { AttributeFilterDropdownBody } from "./AttributeFilter/Components/Dropdown/AttributeFilterDropdownBody.js";
export type { IAttributeFilterDropdownBodyProps } from "./AttributeFilter/Components/Dropdown/types.js";
export {
    type IAttributeFilterDropdownActionsProps,
    AttributeFilterDropdownActions,
} from "./AttributeFilter/Components/Dropdown/AttributeFilterDropdownActions.js";

// AttributeFilter Components - ElementsSelect
export type {
    IAttributeFilterElementsSelectProps,
    IAttributeFilterElementsSelectItemProps,
} from "./AttributeFilter/Components/ElementsSelect/types.js";
export {
    type IAttributeFilterElementsSearchBarProps,
    AttributeFilterElementsSearchBar,
} from "./AttributeFilter/Components/ElementsSelect/AttributeFilterElementsSearchBar.js";
export { AttributeFilterElementsSelect } from "./AttributeFilter/Components/ElementsSelect/AttributeFilterElementsSelect.js";
export {
    type IAttributeFilterElementsSelectErrorProps,
    AttributeFilterElementsSelectError,
} from "./AttributeFilter/Components/ElementsSelect/AttributeFilterElementsSelectError.js";
export { AttributeFilterElementsSelectItem } from "./AttributeFilter/Components/ElementsSelect/AttributeFilterElementsSelectItem.js";
export { SingleSelectionAttributeFilterElementsSelectItem } from "./AttributeFilter/Components/ElementsSelect/SingleSelectionAttributeFilterElementsSelectItem.js";
export {
    type IAttributeFilterElementsSelectLoadingProps,
    AttributeFilterElementsSelectLoading,
} from "./AttributeFilter/Components/ElementsSelect/AttributeFilterElementsSelectLoading.js";
export {
    type IAttributeFilterElementsActionsProps,
    AttributeFilterElementsActions,
} from "./AttributeFilter/Components/ElementsSelect/AttributeFilterElementsActions.js";

// AttributeFilter Components - ElementsSelect EmptyResult
export { AttributeFilterEmptyAttributeResult } from "./AttributeFilter/Components/ElementsSelect/EmptyResult/AttributeFilterEmptyAttributeResult.js";
export {
    type IAttributeFilterAllValuesFilteredResultProps,
    AttributeFilterAllValuesFilteredResult,
} from "./AttributeFilter/Components/ElementsSelect/EmptyResult/AttributeFilterEmptyFilteredResult.js";
export {
    type IAttributeFilterEmptyResultProps,
    AttributeFilterEmptyResult,
} from "./AttributeFilter/Components/ElementsSelect/EmptyResult/AttributeFilterEmptyResult.js";
export { AttributeFilterEmptySearchResult } from "./AttributeFilter/Components/ElementsSelect/EmptyResult/AttributeFilterEmptySearchResult.js";

// AttributeFilter Components - ElementsSelect StatusBar
export {
    type IAttributeFilterFilteredStatusProps,
    AttributeFilterFilteredStatus,
} from "./AttributeFilter/Components/ElementsSelect/StatusBar/AttributeFilterFilteredStatus.js";
export {
    type IAttributeFilterSelectionStatusProps,
    AttributeFilterSelectionStatus,
} from "./AttributeFilter/Components/ElementsSelect/StatusBar/AttributeFilterSelectionStatus.js";
export type { IAttributeFilterStatusBarProps } from "./AttributeFilter/Components/ElementsSelect/StatusBar/types.js";
export { AttributeFilterStatusBar } from "./AttributeFilter/Components/ElementsSelect/StatusBar/AttributeFilterStatusBar.js";
export { SingleSelectionAttributeFilterStatusBar } from "./AttributeFilter/Components/ElementsSelect/StatusBar/SingleSelectionAttributeFilterStatusBar.js";

// AttributeFilter Components - Error and Loading
export {
    type IAttributeFilterErrorProps,
    AttributeFilterError,
} from "./AttributeFilter/Components/AttributeFilterError.js";
export {
    type IAttributeFilterLoadingProps,
    AttributeFilterLoading,
} from "./AttributeFilter/Components/AttributeFilterLoading.js";

// AttributeFilter Components - Addons
export {
    type IAttributeDisplayFormSelectProps,
    AttributeDisplayFormSelect,
} from "./AttributeFilter/Components/Addons/AttributeDisplayFormSelect/AttributeDisplayFormSelect.js";
export { EmptyElementsSearchBar } from "./AttributeFilter/Components/Addons/EmptyElementsSearchBar.js";
export {
    type IAttributeFilterConfigurationButtonProps,
    AttributeFilterConfigurationButton,
} from "./AttributeFilter/Components/Addons/AttributeFilterConfigurationButton.js";
export {
    type IAttributeDatasetInfoProps,
    AttributeDatasetInfo,
} from "./AttributeFilter/Components/Addons/AttributeDatasetInfo.js";
export {
    type IAttributeFilterDeleteButtonProps,
    AttributeFilterDeleteButton,
} from "./AttributeFilter/Components/Addons/AttributeFilterDeleteButton.js";
export { useAutoOpenAttributeFilterDropdownButton } from "./AttributeFilter/Components/Addons/hooks/useAutoOpenAttributeFilterDropdownButton.js";
export { useOnCloseAttributeFilterDropdownButton } from "./AttributeFilter/Components/Addons/hooks/useOnCloseAttributeFilterDropdownButton.js";
export {
    type IAttributeFilterDependencyTooltipProps,
    AttributeFilterDependencyTooltip,
} from "./AttributeFilter/Components/Addons/AttributeFilterDependencyTooltip.js";

export { FilterGroup, type IFilterGroupProps } from "./FilterGroup/FilterGroup.js";

export type { IFilterButtonCustomIcon, VisibilityMode } from "./shared/interfaces/index.js";

export type { IDateFilterButtonProps } from "./DateFilter/DateFilterButton/DateFilterButton.js";
