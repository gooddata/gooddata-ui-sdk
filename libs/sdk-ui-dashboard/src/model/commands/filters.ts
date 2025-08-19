// (C) 2021-2025 GoodData Corporation
import {
    DashboardAttributeFilterConfigMode,
    DashboardAttributeFilterSelectionMode,
    DateFilterGranularity,
    DateFilterType,
    DateString,
    FilterContextItem,
    IAttributeElements,
    IAttributeFilter,
    IDashboardAttributeFilterByDate,
    IDashboardAttributeFilterConfig,
    IDashboardAttributeFilterParent,
    IDateFilter,
    ILowerBoundedFilter,
    IUpperBoundedFilter,
    ObjRef,
    absoluteDateFilterValues,
    filterAttributeElements,
    isAllTimeDateFilter,
    isPositiveAttributeFilter,
    isRelativeBoundedDateFilter,
    isRelativeDateFilter,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";

import { IDashboardCommand } from "./base.js";
import { IDashboardFilter } from "../../types.js";

/**
 * Payload type for {@link ChangeDateFilterSelection} command.
 *
 * @public
 */
export interface DateFilterSelection {
    /**
     * The reference to date data set to which date filter belongs.
     * If not defined it refers to so. called common date filter which data set is defined per widget
     */
    readonly dataSet?: ObjRef;

    /**
     * Indicates whether the filter should select absolute or relative values.
     *
     * @remarks
     * -  Absolute values: `from` and `to` props should be exact dates on the defined granularity
     * -  Relative values: `from` and `to` are offsets on the defined granularity
     */
    readonly type: DateFilterType;

    /**
     * Date filter granularity. For absolute dates this indicates what is the expected input format.
     *
     * @remarks
     * -  Date = MM/DD/YYYY
     * -  Month = MM/YYYY
     * -  Year = YYYY
     * -  Quarter = Q#/YYYY
     * -  Week = WW/YYYY
     */
    readonly granularity: DateFilterGranularity;

    /**
     * The start date. If absolute date filter, then `from` is the formatted start date.
     *
     * @remarks
     * If relative date filter, then `from` is offset from today.
     *
     * If not specified, then the start date is unbounded.
     *
     * See `granularity` prop for more on date format.
     */
    readonly from?: DateString | number;

    /**
     * The end date. If absolute date filter, then `to` is formatted end date.
     *
     * @remarks
     * If relative date filter, then `to` is offset from today.
     *
     * If not specified, then the end date is current date.
     *
     * See `granularity` prop for more on date format
     */
    readonly to?: DateString | number;

    /**
     * The localId of the DateFilterOption selected.
     */
    readonly dateFilterOptionLocalId?: string;

    /**
     * Determines if this command should change working (staged for application) filters or applied filters (used to compute data).
     */
    readonly isWorkingSelectionChange?: boolean;

    /**
     * Specify the local identifier of date filter
     */
    readonly localIdentifier?: string;

    /**
     * Additional bound for the relative date filter
     * @alpha
     */
    readonly boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter;
}

/**
 * Command for date filter selection change.
 *
 * @remarks
 * See {@link changeDateFilterSelection} and {@link applyDateFilter} factory functions you can use to create
 * this command more easily from raw data and {@link @gooddata/sdk-model#IDateFilter}, respectively.
 *
 * @public
 */
export interface ChangeDateFilterSelection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.CHANGE_SELECTION";
    readonly payload: DateFilterSelection;
}

/**
 * Creates the ChangeDateFilterSelection command.
 *
 * @remarks
 * Dispatching this command will result in change of dashboard's date filter, or error in case of invalid
 * update (e.g. hidden date filter option by dateFilterConfig).
 *
 * @param type - date filter type; absolute filters use exact start and end dates, while relative filters use offsets from today
 * @param granularity - granularity on which the filter works; days, weeks, months, quarters or years.
 * @param from - start date; if not specified, then the start date will be unbounded
 * @param to - end date; if not specified, then the end date will be unbounded
 * @param dateFilterOptionLocalId - localId of the {@link @gooddata/sdk-backend-spi#IDateFilterOption} selected
 * @param localIdentifier - localId of the date filter
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @see {@link ChangeDateFilterSelection} for a more complete description of the different parameters
 *
 * @public
 */
export function changeDateFilterSelection(
    type: DateFilterType,
    granularity: DateFilterGranularity,
    from?: DateString | number,
    to?: DateString | number,
    dateFilterOptionLocalId?: string,
    correlationId?: string,
    dataSet?: ObjRef,
    isWorkingSelectionChange?: boolean,
    localIdentifier?: string,
    boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter,
): ChangeDateFilterSelection {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.CHANGE_SELECTION",
        correlationId,
        payload: {
            dataSet,
            type,
            granularity,
            from,
            to,
            dateFilterOptionLocalId,
            isWorkingSelectionChange,
            localIdentifier,
            boundedFilter,
        },
    };
}

/**
 * Creates the ChangeDateFilterSelection command.
 *
 * @remarks
 * Dispatching this command will result in change of dashboard's date filter, or error in case of invalid
 * update (e.g. hidden date filter option by dateFilterConfig).
 *
 * All parameters for {@link ChangeDateFilterSelection} command is derived from the provided date filter.
 *
 * See {@link ChangeDateFilterSelection} for a more complete description of the different parameters
 *
 * @param filter - date filter to apply
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @public
 */
export function applyDateFilter(filter: IDateFilter, correlationId?: string): ChangeDateFilterSelection {
    if (isAllTimeDateFilter(filter)) {
        const values = relativeDateFilterValues(filter, true);
        return clearDateFilterSelection(correlationId, values.dataSet);
    }

    if (isRelativeDateFilter(filter)) {
        const values = relativeDateFilterValues(filter, true);
        const boundedFilter = isRelativeBoundedDateFilter(filter)
            ? filter.relativeDateFilter.boundedFilter
            : undefined;
        return changeDateFilterSelection(
            "relative",
            values.granularity as DateFilterGranularity,
            values.from,
            values.to,
            undefined,
            correlationId,
            values.dataSet,
            undefined,
            filter.relativeDateFilter.localIdentifier,
            boundedFilter,
        );
    } else {
        const values = absoluteDateFilterValues(filter, true);
        return changeDateFilterSelection(
            "absolute",
            "GDC.time.date",
            values.from,
            values.to,
            undefined,
            correlationId,
            values.dataSet,
            undefined,
            filter.absoluteDateFilter.localIdentifier,
        );
    }
}
/**
 * This convenience function will create ChangeDateFilterSelection configured so that the date filter will be
 * unbounded - showing data for 'All Time'.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @public
 */
export function clearDateFilterSelection(
    correlationId?: string,
    dataSet?: ObjRef,
    isWorkingSelectionChange?: boolean,
    localIdentifier?: string,
): ChangeDateFilterSelection {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.CHANGE_SELECTION",
        correlationId,
        payload: {
            dataSet,
            type: "relative",
            granularity: "GDC.time.date",
            isWorkingSelectionChange,
            localIdentifier,
        },
    };
}

//
//
//

/**
 * Payload of the {@link AddAttributeFilter} command.
 * @beta
 */
export interface AddAttributeFilterPayload {
    readonly displayForm: ObjRef;

    readonly index: number;

    /**
     * Specify parent filters whose selected values will be used to narrow
     * down the selection in this newly added filter.
     *
     * @privateRemarks
     * XXX: not needed in the initial version; would be good for API completeness
     */
    readonly parentFilters?: ReadonlyArray<IDashboardAttributeFilterParent>;

    /**
     * Specify the initial selection of attribute elements. If not provided all
     * elements will be selected by default.
     *
     * @privateRemarks
     * XXX: not needed in the initial version; would be good for API completeness
     */
    readonly initialSelection?: IAttributeElements;

    /**
     * Specify if the initial selection of attribute elements is a negative one:
     * if true, the elements selected should NOT be included in teh results.
     *
     * @privateRemarks
     * XXX: not needed in the initial version; would be good for API completeness
     */
    readonly initialIsNegativeSelection?: boolean;

    /**
     * Selection mode which defines how many elements can be in attributeElements.
     * Default value is 'multi' if property is missing.
     */
    readonly selectionMode?: DashboardAttributeFilterSelectionMode;

    /**
     * Specify the visibility mode of attribute filter
     */
    readonly mode?: DashboardAttributeFilterConfigMode;

    /**
     * Specify the local identifier of attribute filter
     */
    readonly localIdentifier?: string;

    /**
     * Specify the primary display form of attribute filter.
     * If provided it is used for filter definition and displayForm param is used only for UI representation
     */
    readonly primaryDisplayForm?: ObjRef;

    /**
     * Specify custom title of attribute filter
     */
    readonly title?: string;
}

/**
 * @beta
 */
export interface AddAttributeFilter extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADD";
    readonly payload: AddAttributeFilterPayload;
}

/**
 * Creates the AddAttributeFilter command. Dispatching this command will result in the addition
 * of another attribute filter to the dashboard's filter bar, at desired position,
 * or error in case of invalid update (e.g. wrong or duplicated displayForm)
 *
 * The filter will be set for the display form provided by reference. When created, the filter will be
 * no-op - all the elements will be selected.
 *
 * @param displayForm - specify attribute display form which will be used for filtering
 * @param index - specify index among the attribute filters at which the new filter should be placed.
 *  The index starts at zero and there is convenience that index of -1 would add the filter at the end.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing.
 * @param selectionMode - single or multi value selection mode of the filter.
 * @param mode - specify the visibility mode of attribute filter
 * @param initialSelection - specify the initial selection of attribute elements
 * @param initialIsNegativeSelection - specify if the initial selection of attribute elements is a negative one
 * @param localIdentifier - local identifier
 * @param primaryDisplayForm - specify the primary display form of attribute filter
 * @param title - specify custom title of attribute filter
 * @beta
 */
export function addAttributeFilter(
    displayForm: ObjRef,
    index: number,
    correlationId?: string,
    selectionMode?: DashboardAttributeFilterSelectionMode,
    mode?: DashboardAttributeFilterConfigMode,
    initialSelection?: IAttributeElements,
    initialIsNegativeSelection?: boolean,
    localIdentifier?: string,
    primaryDisplayForm?: ObjRef,
    title?: string,
): AddAttributeFilter {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADD",
        correlationId,
        payload: {
            displayForm,
            primaryDisplayForm,
            index,
            selectionMode,
            mode,
            initialSelection,
            initialIsNegativeSelection,
            localIdentifier,
            title,
        },
    };
}

//
//
//

/**
 * Payload of the {@link RemoveAttributeFilters} command.
 * @beta
 */
export interface RemoveAttributeFiltersPayload {
    /**
     * XXX: we do not necessarily need to remove multiple filters atm, but this should
     *  be very easy to do and adds some extra flexibility.
     */
    readonly filterLocalIds: string[];
}

/**
 * @beta
 */
export interface RemoveAttributeFilters extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVE";
    readonly payload: RemoveAttributeFiltersPayload;
}

/**
 * Creates the RemoveAttributeFilters command. Dispatching this command will result in the removal
 * of dashboard's attribute filter with the provided local identifier.
 *
 * @param filterLocalId - dashboard attribute filter's local identifier
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @beta
 */
export function removeAttributeFilter(filterLocalId: string, correlationId?: string): RemoveAttributeFilters {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVE",
        correlationId,
        payload: {
            filterLocalIds: [filterLocalId],
        },
    };
}

/**
 * Creates the RemoveAttributeFilters command. Dispatching this command will result in the removal
 * of dashboard's attribute filters with the provided local identifiers.
 *
 * @param filterLocalIds - an array of dashboard attribute filter's local identifiers
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @beta
 */
export function removeAttributeFilters(
    filterLocalIds: string[],
    correlationId?: string,
): RemoveAttributeFilters {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVE",
        correlationId,
        payload: {
            filterLocalIds,
        },
    };
}

//
//
//

/**
 * Payload of the {@link MoveAttributeFilter} command.
 * @beta
 */
export interface MoveAttributeFilterPayload {
    /**
     * Local identifier of the filter to move.
     */
    readonly filterLocalId: string;
    /**
     * Index to move the filter to.
     */
    readonly index: number;
}

/**
 * @beta
 */
export interface MoveAttributeFilter extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVE";
    readonly payload: MoveAttributeFilterPayload;
}

/**
 * Creates the MoveAttributeFilter command. Dispatching this command will result in move of the dashboard attribute
 * filter with the provided local id to a new spot. The new spot is defined by index. For convenience the index
 * of -1 means move to the end of the attribute filter list.
 *
 * @param filterLocalId - dashboard filter's local identifier
 * @param index - specify index among the attribute filters at which the new filter should be placed.
 *  The index starts at zero and there is convenience that index of -1 would add the filter at the end.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function moveAttributeFilter(
    filterLocalId: string,
    index: number,
    correlationId?: string,
): MoveAttributeFilter {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVE",
        correlationId,
        payload: {
            filterLocalId,
            index,
        },
    };
}

//
//
//

/**
 * Attribute filter selection type for {@link ChangeAttributeFilterSelectionPayload}.
 *
 * @public
 */
export type AttributeFilterSelectionType = "IN" | "NOT_IN";

/**
 * Payload type for {@link ChangeAttributeFilterSelection} command.
 *
 * @public
 */
export interface ChangeAttributeFilterSelectionPayload {
    /**
     * Dashboard attribute filter's local identifier.
     */
    readonly filterLocalId: string;
    /**
     * Selected attribute elements.
     */
    readonly elements: IAttributeElements;
    /**
     * Selection type. Either 'IN' for positive selection or 'NOT_IN' for negative selection (All except selected items).
     */
    readonly selectionType: AttributeFilterSelectionType;
    /**
     * Determines if this command should change working (staged for application) filters or applied filters (used to compute data).
     * Default is false - command changes applied filters.
     */
    readonly isWorkingSelectionChange?: boolean;
    /**
     * Internal value, specifies that filter change was caused by displayAsLabel
     * ad-hoc migration, the param will be removed once the usage of displayAsLabel is migrated on database
     * metadata level.
     */
    readonly isResultOfMigration?: boolean;

    /**
     * Indicates if the current filter selection is invalid.
     * When true, the filter's localId should be added to filtersWithInvalidSelection array in state.
     * When false, the filter's localId should be removed from filtersWithInvalidSelection array.
     */
    readonly isSelectionInvalid?: boolean;
}

/**
 * Command for attribute filter selection change.
 *
 * @remarks
 * See {@link changeAttributeFilterSelection} and {@link applyAttributeFilter} factory functions you can use to create
 * this command more easily from raw data and {@link @gooddata/sdk-model#IAttributeFilter}, respectively.
 *
 * @public
 */
export interface ChangeAttributeFilterSelection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.CHANGE_SELECTION";
    readonly payload: ChangeAttributeFilterSelectionPayload;
}

/**
 * Creates the ChangeAttributeFilterSelection command for applied filters.
 *
 * @remarks
 * Dispatching this command will result in application of element selection for the dashboard attribute filter
 * with the provided id, or error in case of invalid update (e.g. non-existing filterLocalId).
 *
 * The attribute elements can be provided either using their URI (primary key) or value. Together with the
 * elements you must indicate the selection type - either 'IN' or 'NOT_IN'.
 *
 * If you want to change working filters use {@link changeWorkingAttributeFilterSelection}.
 * See {@link ChangeAttributeFilterSelectionPayload.isWorkingSelectionChange} for details.
 *
 * @remarks see {@link resetAttributeFilterSelection} for convenience function to select all attribute elements of
 *  particular filter.
 *
 * See also {@link applyAttributeFilter} for convenient function when you have an {@link @gooddata/sdk-model#IAttributeFilter} instance.
 *
 *  @example
 * ```
 * const selectionType = isPositiveAttributeFilter ? "IN" : "NOT_IN";
 * ```
 *
 * To create this command without a need to calculate the payload values from a {@link @gooddata/sdk-model#IFilter} object,
 * we recommend to use {@link applyAttributeFilter} command creator instead.
 *
 * @param filterLocalId - dashboard attribute filter's local id
 * @param elements - elements
 * @param selectionType - selection type. either 'IN' or 'NOT_IN'
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @public
 */
export function changeAttributeFilterSelection(
    filterLocalId: string,
    elements: IAttributeElements,
    selectionType: AttributeFilterSelectionType,
    correlationId?: string,
    isSelectionInvalid?: boolean,
): ChangeAttributeFilterSelection {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.CHANGE_SELECTION",
        correlationId,
        payload: {
            filterLocalId,
            elements,
            selectionType,
            isSelectionInvalid,
        },
    };
}

/**
 * Creates the ChangeAttributeFilterSelection command for adhoc migrated attribute filter.
 *
 * @remarks
 * Dispatching this command will result in application of element selection for the dashboard attribute filter
 * with the provided id, or error in case of invalid update (e.g. non-existing filterLocalId).
 *
 * The attribute elements can be provided either using their URI (primary key) or value. Together with the
 * elements you must indicate the selection type - either 'IN' or 'NOT_IN'.
 *
 * @remarks see {@link resetAttributeFilterSelection} for convenience function to select all attribute elements of
 *  particular filter.
 *
 * See also {@link applyAttributeFilter} for convenient function when you have an {@link @gooddata/sdk-model#IAttributeFilter} instance.
 *
 *  @example
 * ```
 * const selectionType = isPositiveAttributeFilter ? "IN" : "NOT_IN";
 * ```
 *
 * To create this command without a need to calculate the payload values from a {@link @gooddata/sdk-model#IFilter} object,
 * we recommend to use {@link applyAttributeFilter} command creator instead.
 *
 * @param filterLocalId - dashboard attribute filter's local id
 * @param elements - elements
 * @param selectionType - selection type. either 'IN' or 'NOT_IN'
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function changeMigratedAttributeFilterSelection(
    filterLocalId: string,
    elements: IAttributeElements,
    selectionType: AttributeFilterSelectionType,
    correlationId?: string,
): ChangeAttributeFilterSelection {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.CHANGE_SELECTION",
        correlationId,
        payload: {
            filterLocalId,
            elements,
            selectionType,
            isResultOfMigration: true,
        },
    };
}

/**
 * Creates the ChangeAttributeFilterSelection command for working filter.
 *
 * @remarks
 * Dispatching this command will result in changing working element selection for the dashboard attribute filter
 * with the provided id, or error in case of invalid update (e.g. non-existing filterLocalId).
 *
 * The attribute elements can be provided either using their URI (primary key) or value. Together with the
 * elements you must indicate the selection type - either 'IN' or 'NOT_IN'.
 *
 * If you want to change applied filters use {@link changeAttributeFilterSelection}.
 * See {@link ChangeAttributeFilterSelectionPayload.isWorkingSelectionChange} for details.
 *
 * @remarks see {@link resetAttributeFilterSelection} for convenience function to select all attribute elements of
 *  particular filter.
 *
 * See also {@link applyAttributeFilter} for convenient function when you have an {@link @gooddata/sdk-model#IAttributeFilter} instance.
 *
 *  @example
 * ```
 * const selectionType = isPositiveAttributeFilter ? "IN" : "NOT_IN";
 * ```
 *
 * To create this command without a need to calculate the payload values from a {@link @gooddata/sdk-model#IFilter} object,
 * we recommend to use {@link applyAttributeFilter} command creator instead.
 *
 * @param filterLocalId - dashboard attribute filter's local id
 * @param elements - elements
 * @param selectionType - selection type. either 'IN' or 'NOT_IN'
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @public
 */
export function changeWorkingAttributeFilterSelection(
    filterLocalId: string,
    elements: IAttributeElements,
    selectionType: AttributeFilterSelectionType,
    correlationId?: string,
    isSelectionInvalid?: boolean,
): ChangeAttributeFilterSelection {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.CHANGE_SELECTION",
        correlationId,
        payload: {
            filterLocalId,
            elements,
            selectionType,
            isWorkingSelectionChange: true,
            isSelectionInvalid,
        },
    };
}

/**
 * Creates the ChangeAttributeFilterSelection command.
 *
 * @remarks
 * Dispatching this command will result in application of element selection for the dashboard attribute filter
 * with the provided id, or error in case of invalid update (e.g. non-existing `filterLocalId`).
 *
 * The {@link ChangeAttributeFilterSelectionPayload}'s `selectionType` and `elements` are derived from the
 * provided attribute filter.
 *
 * To convert {@link IDashboardFilter} to {@link @gooddata/sdk-model#IFilter} use {@link dashboardAttributeFilterToAttributeFilter}.
 * Converted filter can be used within the command's payload.
 *
 * @param filterLocalId - dashboard attribute filter's local id
 * @param filter - attribute filter to apply
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @public
 */
export function applyAttributeFilter(
    filterLocalId: string,
    filter: IAttributeFilter,
    correlationId?: string,
): ChangeAttributeFilterSelection {
    return changeAttributeFilterSelection(
        filterLocalId,
        filterAttributeElements(filter),
        isPositiveAttributeFilter(filter) ? "IN" : "NOT_IN",
        correlationId,
    );
}

/**
 * A convenience function that will create ChangeAttributeFilterSelection command that will select all
 * elements of the dashboard attribute filter with the provided local id.
 *
 * @remarks
 * This is same as creating the ChangeAttributeFilterSelection command with empty elements and NOT_IN selection type.
 *
 * @param filterLocalId - dashboard attribute filter's local id
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @public
 */
export function resetAttributeFilterSelection(
    filterLocalId: string,
    correlationId?: string,
): ChangeAttributeFilterSelection {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.CHANGE_SELECTION",
        correlationId,
        payload: {
            filterLocalId,
            elements: { uris: [] },
            selectionType: "NOT_IN",
        },
    };
}

//
//
//

/**
 * Payload of the {@link SetAttributeFilterDependentDateFilters} command.
 * @beta
 */
export interface SetAttributeFilterDependentDateFiltersPayload {
    readonly filterLocalId: string;
    readonly dependentDateFilters: ReadonlyArray<IDashboardAttributeFilterByDate>;
}

/**
 * @beta
 */
export interface SetAttributeFilterDependentDateFilters extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_DEPENDENT_DATE_FILTERS";
    readonly payload: SetAttributeFilterDependentDateFiltersPayload;
}

/**
 * Creates the SetAttributeFilterDependentDateFilters command. Dispatching this command will result in setting a
 * relationship between one dashboard attribute filters and one or more date filters.
 *
 * When an attribute filter has a dependent date filter set up, the attribute elements that will be available in the attribute
 * filter will be influenced by the selection in the date filter. The attribute filter will show only those elements
 * for which a link exists to the selected elements in the dependent date filter.
 *
 *
 * @param filterLocalId - local id of filter that will be a child in the relationship
 * @param dateParentFilters - definition of the dependent date filter this contains local id of the date filter
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function setAttributeFilterDependentDateFilters(
    filterLocalId: string,
    dependentDateFilters: IDashboardAttributeFilterByDate[],
    correlationId?: string,
): SetAttributeFilterDependentDateFilters {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_DEPENDENT_DATE_FILTERS",
        correlationId,
        payload: {
            filterLocalId,
            dependentDateFilters: dependentDateFilters,
        },
    };
}

/**
 * Payload of the {@link SetAttributeFilterParents} command.
 * @beta
 */
export interface SetAttributeFilterParentsPayload {
    readonly filterLocalId: string;
    readonly parentFilters: ReadonlyArray<IDashboardAttributeFilterParent>;
}

/**
 * @beta
 */
export interface SetAttributeFilterParents extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_PARENTS";
    readonly payload: SetAttributeFilterParentsPayload;
}

/**
 * Creates the SetAttributeFilterParents command. Dispatching this command will result in setting a parent-child
 * relationship between two or more dashboard attribute filters.
 *
 * When an attribute filter has a parent set up, the attribute elements that will be available in the child
 * filter will be influenced by the selection in the parent. The child filter will show only those elements
 * for which a link exists to the selected elements in the parent.
 *
 * Take for example a model where there are continent and country attributes. You add continent and
 * country as filters onto a dashboard and establish parent-child relationship between them. When users select
 * some continents in the filter, the country filter will only show elements for countries on the selected
 * contents.
 *
 * @param filterLocalId - local id of filter that will be a child in the relationship
 * @param parentFilters - definition of the relationship to parent, this contains local id of the parent filter and
 *  one or more 'over' attributes. The 'over' attributes will be included when querying
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function setAttributeFilterParents(
    filterLocalId: string,
    parentFilters: IDashboardAttributeFilterParent[],
    correlationId?: string,
): SetAttributeFilterParents {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_PARENTS",
        correlationId,
        payload: {
            filterLocalId,
            parentFilters: parentFilters,
        },
    };
}

//
//
//

/**
 * Payload of the {@link ChangeFilterContextSelection} command.
 * @public
 */
export interface ChangeFilterContextSelectionPayload {
    /**
     * Filters to apply to the current dashboard filter context.
     */
    filters: (IDashboardFilter | FilterContextItem)[];

    /**
     * Attribute filter configs with additional props
     */
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];

    /**
     * Should filters not mentioned in the payload reset to All items selected/All time? Defaults to false.
     */
    resetOthers: boolean;
}

/**
 * Command for changing multiple filters at once.
 *
 * @remarks
 * See {@link changeFilterContextSelection} for a factory function that will help you create this command.
 *
 * @public
 */
export interface ChangeFilterContextSelection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION";
    readonly payload: ChangeFilterContextSelectionPayload;
}

/**
 * Creates the {@link ChangeFilterContextSelection} command.
 *
 * @remarks
 * Dispatching this command will result into setting provided dashboard filters to the current dashboard filter context.
 *
 * Only filters that are stored in the filter context can be applied (filters that are visible in the filter bar).
 * Filters will be matched via display form ref, duplicities will be omitted.
 * Date filter that does not match any visible option by the current date filter config will be also omitted.
 *
 * @public
 * @param filters - attribute filters and date filter to apply.
 * @param resetOthers - If true, filters not mentioned in the payload will be reset to All items selected/All time. Defaults to false.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns change filter selection command
 */
export function changeFilterContextSelection(
    filters: (IDashboardFilter | FilterContextItem)[],
    resetOthers: boolean = false,
    correlationId?: string,
): ChangeFilterContextSelection {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
        correlationId,
        payload: {
            filters,
            resetOthers,
        },
    };
}

/**
 * Params for {@link changeFilterContextSelectionByParams} command.
 *
 * @public
 */
export interface ChangeFilterContextSelectionParams {
    filters: (IDashboardFilter | FilterContextItem)[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
    resetOthers?: boolean;
    correlationId?: string;
}

/**
 * Creates the {@link ChangeFilterContextSelection} command.
 *
 * @remarks
 * Dispatching this command will result into setting provided dashboard filters to the current dashboard filter context.
 *
 * Only filters that are stored in the filter context can be applied (filters that are visible in the filter bar).
 * Filters will be matched via display form ref, duplicities will be omitted.
 * Date filter that does not match any visible option by the current date filter config will be also omitted.
 *
 * @param params - params for the command creator
 * @internal
 * TODO: next major release can remove ByParams suffix and use this implementation instead of original cmd creator + other creators can be rewriten to use params object
 * https://gooddata.atlassian.net/browse/STL-700
 */
export function changeFilterContextSelectionByParams(
    params: ChangeFilterContextSelectionParams,
): ChangeFilterContextSelection {
    const { filters, attributeFilterConfigs = [], resetOthers = false, correlationId } = params;
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
        correlationId,
        payload: {
            filters,
            attributeFilterConfigs,
            resetOthers,
        },
    };
}

/**
 * @beta
 */
export interface SetAttributeFilterDisplayFormPayload {
    filterLocalId: string;
    displayForm: ObjRef;
    isWorkingSelectionChange?: boolean;
    isResultOfMigration?: boolean;
}

/**
 * @beta
 */
export interface SetAttributeFilterDisplayForm extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_DISPLAY_FORM";
    readonly payload: SetAttributeFilterDisplayFormPayload;
}

/**
 * Creates the {@link SetAttributeFilterDisplayForm} command.
 *
 * @remarks
 * Dispatching the commands will result into setting provided display form as a selected
 * display form for the attribute filter.
 *
 *
 * @beta
 * @param filterLocalId - local identifier of the filter the display form is changed for
 * @param displayForm - newly selected display form
 * @param isWorkingSelectionChange - determines if command updates working filter context or applied filter context. Applied filter context is default.
 * @param isResultOfMigration - internal value, specifies that filter change was caused by displayAsLabel
 *  ad-hoc migration, the param will be removed once the usage of displayAsLabel is migrated on database
 *  metadata level.
 * @returns change filter display form command
 */
export function setAttributeFilterDisplayForm(
    filterLocalId: string,
    displayForm: ObjRef,
    isWorkingSelectionChange?: boolean,
    isResultOfMigration?: boolean,
): SetAttributeFilterDisplayForm {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_DISPLAY_FORM",
        payload: {
            filterLocalId,
            displayForm,
            isWorkingSelectionChange,
            isResultOfMigration,
        },
    };
}

/**
 * Payload of the {@link SetAttributeFilterTitle} command.
 * @beta
 */
export interface SetAttributeFilterTitlePayload {
    /**
     * Local identifier of the filter to rename.
     */
    filterLocalId: string;
    /**
     * Title of the filter.
     */
    title?: string;
}

/**
 * Command for changing attribute filter title.
 * @beta
 */
export interface SetAttributeFilterTitle extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_TITLE";
    readonly payload: SetAttributeFilterTitlePayload;
}

/**
 * Creates the {@link SetAttributeFilterTitle} command.
 *
 * @remarks
 * Dispatching the commands will result into setting provided title as a selected
 * title for the attribute filter.
 *
 *
 * @beta
 * @param filterLocalId - local identifier of the filter the display form is changed for
 * @param title - newly added title
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns change filter title command
 */
export function setAttributeFilterTitle(
    filterLocalId: string,
    title?: string,
    correlationId?: string,
): SetAttributeFilterTitle {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_TITLE",
        correlationId,
        payload: {
            filterLocalId,
            title,
        },
    };
}

/**
 * @beta
 */
export interface SetAttributeFilterSelectionModePayload {
    filterLocalId: string;
    selectionMode: DashboardAttributeFilterSelectionMode;
}

/**
 * @beta
 */
export interface SetAttributeFilterSelectionMode extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_SELECTION_MODE";
    readonly payload: SetAttributeFilterSelectionModePayload;
}

/**
 * Creates the {@link SetAttributeFilterSelectionMode} command.
 *
 * @remarks
 * Dispatching the commands will result into setting provided selection mode as a selected
 * selection mode for the attribute filter.
 *
 *
 * @beta
 * @param filterLocalId - local identifier of the filter the selection mode is changed for
 * @param selectionMode - newly selected selection mode
 * @returns change filter selection mode command
 */
export function setAttributeFilterSelectionMode(
    filterLocalId: string,
    selectionMode: DashboardAttributeFilterSelectionMode,
): SetAttributeFilterSelectionMode {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_SELECTION_MODE",
        payload: {
            filterLocalId,
            selectionMode,
        },
    };
}

//////////////////// DATE FILTER //////////////////////////

/**
 * Payload of the {@link AddDateFilter} command.
 *
 * @alpha
 */
export interface AddDateFilterPayload {
    readonly index: number;
    readonly dateDataset: ObjRef;
}

/**
 * @alpha
 */
export interface AddDateFilter extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.ADD";
    readonly payload: AddDateFilterPayload;
}

/**
 * Creates the AddDateFilter command. Dispatching this command will result in the addition
 * of another date filter with defined dimension to the dashboard's filter bar, at desired position,
 * or error in case of invalid update (e.g. wrong or duplicated date dimension/data set)
 *
 * The filter will be set for the date dimension provided by reference. When created, the filter will be
 * no-op - all time filter.
 *
 * @param dateDataset - specify date dimension/data set which will be used for filtering of all widgets
 * @param index - specify index among the filters at which the new filter should be placed.
 * The index starts at zero and there is convenience that index of -1 would add the filter at the end.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *
 * @alpha
 */
export function addDateFilter(dateDataset: ObjRef, index: number, correlationId?: string): AddDateFilter {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.ADD",
        correlationId,
        payload: {
            dateDataset,
            index,
        },
    };
}

/**
 * Payload of the {@link RemoveDateFilters} command.
 * @beta
 */
export interface RemoveDateFiltersPayload {
    /**
     * XXX: we do not necessarily need to remove multiple filters atm, but this should
     *  be very easy to do and adds some extra flexibility.
     */
    readonly dataSets: ObjRef[];
}

/**
 * @beta
 */
export interface RemoveDateFilters extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.REMOVE";
    readonly payload: RemoveDateFiltersPayload;
}

/**
 * Creates the RemoveDateFilters command. Dispatching this command will result in the removal
 * of dashboard's date filter with the provided date data set.
 *
 * @param dataSet - dashboard date filter's date data set ref
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @beta
 */
export function removeDateFilter(dataSet: ObjRef, correlationId?: string): RemoveDateFilters {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.REMOVE",
        correlationId,
        payload: {
            dataSets: [dataSet],
        },
    };
}

/**
 * Payload of the {@link MoveDateFilter} command.
 * @beta
 */
export interface MoveDateFilterPayload {
    /**
     * Data set of the filter to move.
     */
    readonly dataSet: ObjRef;
    /**
     * Index to move the filter to.
     */
    readonly index: number;
}

/**
 * @beta
 */
export interface MoveDateFilter extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.MOVE";
    readonly payload: MoveDateFilterPayload;
}

/**
 * Creates the MoveDateFilter command. Dispatching this command will result in move of the dashboard date
 * filter with the provided dataSet to a new spot. The new spot is defined by index. For convenience the index
 * of -1 means move to the end of the filter list.
 *
 * @param dataSet - dashboard filter's dataSet - no duplicates allowed
 * @param index - specify index among the draggable filters (attribute filters and date filters with dataSet) at which the new filter should be placed.
 *  The index starts at zero and there is convenience that index of -1 would add the filter at the end.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function moveDateFilter(dataSet: ObjRef, index: number, correlationId?: string): MoveDateFilter {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.MOVE",
        correlationId,
        payload: {
            dataSet,
            index,
        },
    };
}

/**
 * Payload of the {@link SaveFilterView} command.
 * @alpha
 */
export interface SaveFilterViewPayload {
    readonly name: string;
    readonly isDefault: boolean;
}

/**
 * Command for snapshotting current filter context and saving it as a filter view.
 *
 * @remarks
 * See {@link saveFilterView} for a factory function that will help you create this command.
 *
 * @alpha
 */
export interface SaveFilterView extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.SAVE";
    readonly payload: SaveFilterViewPayload;
}

/**
 * Creates the {@link SaveFilterView} command.
 *
 * @remarks
 * Dispatching this command will result into snapshotting of the current dashboard filter context into a
 * filter view that will be persisted. User can later apply it to the filter context to restore it to the
 * saved state.
 *
 * @alpha
 * @param name - name of the filter view under which it will be listed in UI.
 * @param isDefault - determine if new filter view should be set as a default.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns save filter view command
 */
export function saveFilterView(name: string, isDefault: boolean, correlationId?: string): SaveFilterView {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.SAVE",
        correlationId,
        payload: {
            name,
            isDefault,
        },
    };
}

/**
 * Payload of the {@link DeleteFilterView} command.
 * @alpha
 */
export interface DeleteFilterViewPayload {
    readonly ref: ObjRef;
}

/**
 * Command for deletion of a saved filter view.
 *
 * @remarks
 * See {@link deleteFilterView} for a factory function that will help you create this command.
 *
 * @alpha
 */
export interface DeleteFilterView extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.DELETE";
    readonly payload: DeleteFilterViewPayload;
}

/**
 * Creates the {@link DeleteFilterView} command.
 *
 * @remarks
 * Dispatching this command will result into deletion of the persisted filter view.
 *
 * @alpha
 * @param ref - ref of the filter view that must be deleted
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns delete filter view command
 */
export function deleteFilterView(ref: ObjRef, correlationId?: string): DeleteFilterView {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.DELETE",
        correlationId,
        payload: {
            ref,
        },
    };
}

/**
 * Payload of the {@link ApplyFilterView} command.
 * @alpha
 */
export interface ApplyFilterViewPayload {
    readonly ref: ObjRef;
}

/**
 * Command for application of a saved filter view.
 *
 * @remarks
 * See {@link applyFilterView} for a factory function that will help you create this command.
 *
 * @alpha
 */
export interface ApplyFilterView extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.APPLY";
    readonly payload: ApplyFilterViewPayload;
}

/**
 * Creates the {@link ApplyFilterView} command.
 *
 * @remarks
 * Dispatching this command will result into application of the persisted filter view.
 *
 * @alpha
 * @param ref - ref of the filter view that must be applied to the filter context.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns delete filter view command
 */
export function applyFilterView(ref: ObjRef, correlationId?: string): ApplyFilterView {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.APPLY",
        correlationId,
        payload: {
            ref,
        },
    };
}

/**
 * Payload of the {@link SetFilterViewAsDefault} command.
 * @alpha
 */
export interface SetFilterViewAsDefaultPayload {
    readonly ref: ObjRef;
    readonly isDefault: boolean;
}

/**
 * Command for setting a saved filter view as a default one or removing the default status from it.
 *
 * @remarks
 * See {@link setFilterViewAsDefault} for a factory function that will help you create this command.
 *
 * @alpha
 */
export interface SetFilterViewAsDefault extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS";
    readonly payload: SetFilterViewAsDefaultPayload;
}

/**
 * Creates the {@link SetFilterViewAsDefault} command.
 *
 * @remarks
 * Dispatching this command will result into setting of the persisted filter view as a default one when
 * dashboard filter context is loaded or unsetting it from being applied automatically on load.
 *
 * @alpha
 * @param ref - ref of the filter view that must be set as a default one.
 * @param isDefault - determine if filter view identified by the provided ref should be marked as a default
 *      one. If yes, any existing filter view for the same user and dashboard will be marked as non default
 *      as only one can be set as default at the same time.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns delete filter view command
 */
export function setFilterViewAsDefault(
    ref: ObjRef,
    isDefault: boolean,
    correlationId?: string,
): SetFilterViewAsDefault {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.CHANGE_DEFAULT_STATUS",
        correlationId,
        payload: {
            ref,
            isDefault,
        },
    };
}

/**
 * Command for refreshing of the cache with saved filter views from persistent storage.
 *
 * @remarks
 * See {@link reloadFilterViews} for a factory function that will help you create this command.
 *
 * @alpha
 */
export interface ReloadFilterViews extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.RELOAD";
}

/**
 * Creates the {@link ReloadFilterViews} command.
 *
 * @remarks
 * Dispatching this command will result with refreshing of the cache with saved filter views from
 * persistent storage and updating the local cache in redux store.
 *
 * @alpha
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns delete filter view command
 */
export function reloadFilterViews(correlationId?: string): ReloadFilterViews {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.FILTER_VIEW.RELOAD",
        correlationId,
    };
}

/**
 * Command for applying all working filters staged for application.
 * Usually used with setting dashboardApplyFiltersMode: ALL_AT_ONCE
 *
 * @remarks
 * See {@link applyFilterContextWorkingSelection} for a factory function that will help you create this command.
 *
 * @alpha
 */
export interface ApplyFilterContextWorkingSelection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.APPLY_WORKING_SELECTION";
}

/**
 * Creates the {@link ApplyFilterContextWorkingSelection} command.
 *
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns apply all filters command
 *
 * @alpha
 */
export function applyFilterContextWorkingSelection(
    correlationId?: string,
): ApplyFilterContextWorkingSelection {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.APPLY_WORKING_SELECTION",
        correlationId,
    };
}

/**
 * Command for reseting all working filters.
 * It resets the working filters in to  same state as applied filters.
 *
 * @remarks
 * This command ot usually used with setting dashboardApplyFiltersMode: ALL_AT_ONCE
 *
 * If you want to reset applied filters too, you may use {@link changeFilterContextSelection} and pass all available filters to it.
 *
 * @remarks
 * See {@link applyFilterContextWorkingSelection} for a factory function that will help you create this command.
 *
 * @alpha
 */
export interface ResetFilterContextWorkingSelection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.RESET_WORKING_SELECTION";
}

/**
 * Creates the {@link ResetFilterContextWorkingSelection} command.
 *
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns apply reset working filters command
 *
 * @alpha
 */
export function resetFilterContextWorkingSelection(
    correlationId?: string,
): ResetFilterContextWorkingSelection {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.RESET_WORKING_SELECTION",
        correlationId,
    };
}
