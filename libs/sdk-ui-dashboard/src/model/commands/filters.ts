// (C) 2021-2022 GoodData Corporation
import {
    DateFilterGranularity,
    DateFilterType,
    DateString,
    FilterContextItem,
    IDashboardAttributeFilterParent,
} from "@gooddata/sdk-backend-spi";
import {
    absoluteDateFilterValues,
    filterAttributeElements,
    IAttributeElements,
    IAttributeFilter,
    IDateFilter,
    isAllTimeDateFilter,
    isPositiveAttributeFilter,
    isRelativeDateFilter,
    ObjRef,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";
import { IDashboardCommand } from "./base";
import { IDashboardFilter } from "../../types";

/**
 * Payload type for {@link ChangeDateFilterSelection} command.
 *
 * @public
 */
export interface DateFilterSelection {
    /**
     * Indicates whether the filter should select absolute or relative values.
     *
     * -  Absolute values: `from` and `to` props should be exact dates on the defined granularity
     * -  Relative values: `from` and `to` are offsets on the defined granularity
     */
    readonly type: DateFilterType;

    /**
     * Date filter granularity. For absolute dates this indicates what is the expected input format.
     *
     * -  Date = MM/DD/YYYY
     * -  Month = MM/YYYY
     * -  Year = YYYY
     * -  Quarter = Q#/YYYY
     * -  Week = WW/YYYY
     */
    readonly granularity: DateFilterGranularity;

    /**
     * The start date. If absolute date filter, then `from` is the formatted start date. If relative
     * date filter, then `from` is offset from today.
     *
     * If not specified, then the start date is unbounded.
     *
     * @remarks see `granularity` prop for more on date format.
     */
    readonly from?: DateString | number;

    /**
     * The end date. If absolute date filter, then `to` is formatted end date. If relative date filter,
     * then `to` is offset from today.
     *
     * If not specified, then the end date is current date.
     *
     * @remarks see `granularity` prop for more on date format
     */
    readonly to?: DateString | number;

    /**
     * The localId of the DateFilterOption selected.
     */
    readonly dateFilterOptionLocalId?: string;
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
 * Creates the ChangeDateFilterSelection command. Dispatching this command will result in change of dashboard's
 * date filter, or error in case of invalid update (e.g. hidden date filter option by dateFilterConfig).
 *
 * @param type - date filter type; absolute filters use exact start and end dates, while relative filters use offsets from today
 * @param granularity - granularity on which the filter works; days, weeks, months, quarters or years.
 * @param from - start date; if not specified, then the start date will be unbounded
 * @param to - end date; if not specified, then the end date will be unbounded
 * @param dateFilterOptionLocalId - localId of the {@link @gooddata/sdk-backend-spi#IDateFilterOption} selected
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
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
): ChangeDateFilterSelection {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.CHANGE_SELECTION",
        correlationId,
        payload: {
            type,
            granularity,
            from,
            to,
            dateFilterOptionLocalId,
        },
    };
}

/**
 * Creates the ChangeDateFilterSelection command. Dispatching this command will result in change of dashboard's
 * date filter, or error in case of invalid update (e.g. hidden date filter option by dateFilterConfig).
 *
 * All parameters for {@link ChangeDateFilterSelection} command is derived from the provided date filter.
 *
 * @param filter - date filter to apply
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @remarks see {@link ChangeDateFilterSelection} for a more complete description of the different parameters
 *
 * @public
 */
export function applyDateFilter(filter: IDateFilter, correlationId?: string): ChangeDateFilterSelection {
    if (isAllTimeDateFilter(filter)) {
        return clearDateFilterSelection(correlationId);
    }

    if (isRelativeDateFilter(filter)) {
        const values = relativeDateFilterValues(filter);
        return changeDateFilterSelection(
            "relative",
            values.granularity as DateFilterGranularity,
            values.from,
            values.to,
            undefined,
            correlationId,
        );
    } else {
        const values = absoluteDateFilterValues(filter);
        return changeDateFilterSelection(
            "absolute",
            "GDC.time.date",
            values.from,
            values.to,
            undefined,
            correlationId,
        );
    }
}
/**
 * This convenience function will create ChangeDateFilterSelection configured so that the date filter will be
 * unbounded - showing data for 'All Time'.
 *
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @public
 */
export function clearDateFilterSelection(correlationId?: string): ChangeDateFilterSelection {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.CHANGE_SELECTION",
        correlationId,
        payload: {
            type: "relative",
            granularity: "GDC.time.date",
        },
    };
}

//
//
//

/**
 * Payload of the {@link AddAttributeFilter} command.
 * @alpha
 */
export interface AddAttributeFilterPayload {
    readonly displayForm: ObjRef;

    readonly index: number;

    /**
     * Optionally specify parent filters whose selected values will be used to narrow
     * down the selection in this newly added filter.
     *
     * XXX: not needed in the initial version; would be good for API completeness
     */
    readonly parentFilters?: ReadonlyArray<IDashboardAttributeFilterParent>;

    /**
     * Optionally specify the initial selection of attribute elements. If not provided all
     * elements will be selected by default.
     *
     * XXX: not needed in the initial version; would be good for API completeness
     */
    readonly initialSelection?: IAttributeElements;

    /**
     * Optionally specify if the initial selection of attribute elements is a negative one:
     * if true, the elements selected should NOT be included in teh results.
     *
     * XXX: not needed in the initial version; would be good for API completeness
     */
    readonly initialIsNegativeSelection?: boolean;
}

/**
 * @alpha
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
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @alpha
 */
export function addAttributeFilter(
    displayForm: ObjRef,
    index: number,
    correlationId?: string,
): AddAttributeFilter {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADD",
        correlationId,
        payload: {
            displayForm,
            index,
        },
    };
}

//
//
//

/**
 * Payload of the {@link RemoveAttributeFilters} command.
 * @alpha
 */
export interface RemoveAttributeFiltersPayload {
    /**
     * XXX: we do not necessarily need to remove multiple filters atm, but this should
     *  be very easy to do and adds some extra flexibility.
     */
    readonly filterLocalIds: string[];
}

/**
 * @alpha
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
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @alpha
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

//
//
//

/**
 * Payload of the {@link MoveAttributeFilter} command.
 * @alpha
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
 * @alpha
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
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
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
 * Creates the ChangeAttributeFilterSelection command. Dispatching this command will result in application
 * of element selection for the dashboard attribute filter with the provided id, or error in case of invalid update (e.g. non-existing filterLocalId).
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
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @public
 */
export function changeAttributeFilterSelection(
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
        },
    };
}

/**
 * Creates the ChangeAttributeFilterSelection command. Dispatching this command will result in application
 * of element selection for the dashboard attribute filter with the provided id, or error in case of invalid update (e.g. non-existing `filterLocalId`).
 *
 * The {@link ChangeAttributeFilterSelectionPayload}'s `selectionType` and `elements` are derived from the
 * provided attribute filter.
 *
 * To convert {@link IDashboardFilter} to {@link @gooddata/sdk-model#IFilter} use {@link dashboardAttributeFilterToAttributeFilter}.
 * Converted filter can be used within the command's payload.
 *
 * @param filterLocalId - dashboard attribute filter's local id
 * @param filter - attribute filter to apply
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
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
 * This is same as creating the ChangeAttributeFilterSelection command with empty elements and NOT_IN selection type.
 *
 * @param filterLocalId - dashboard attribute filter's local id
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
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
 * Payload of the {@link SetAttributeFilterParent} command.
 * @alpha
 */
export interface SetAttributeFilterParentPayload {
    readonly filterLocalId: string;
    readonly parentFilters: ReadonlyArray<IDashboardAttributeFilterParent>;
}

/**
 * @alpha
 */
export interface SetAttributeFilterParent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_PARENT";
    readonly payload: SetAttributeFilterParentPayload;
}

/**
 * Creates the SetAttributeFilterParent command. Dispatching this command will result in setting a parent-child
 * relationship between two dashboard attribute filters.
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
 * @param parentFilter - definition of the relationship to parent, this contains local id of the parent filter and
 *  one or more 'over' attributes. The 'over' attributes will be included when querying
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function setAttributeFilterParent(
    filterLocalId: string,
    parentFilter: IDashboardAttributeFilterParent,
    correlationId?: string,
): SetAttributeFilterParent {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_PARENT",
        correlationId,
        payload: {
            filterLocalId,
            parentFilters: [parentFilter],
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
 * Dispatching this command will result into setting provided dashboard filters to the current dashboard filter context.
 *
 * Only filters that are stored in the filter context can be applied (filters that are visible in the filter bar).
 * Filters will be matched via display form ref, duplicities will be omitted.
 * Date filter that does not match any visible option by the current date filter config will be also omitted.
 *
 * @public
 * @param filters - attribute filters and date filter to apply.
 * @param resetOthers - If true, filters not mentioned in the payload will be reset to All items selected/All time. Defaults to false.
 * @param correlationId - optionally specify correlation id. It will be included in all events that will be emitted during the command processing.
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
