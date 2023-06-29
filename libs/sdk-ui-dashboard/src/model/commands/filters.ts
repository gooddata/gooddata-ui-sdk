// (C) 2021-2023 GoodData Corporation
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
    DateString,
    DateFilterGranularity,
    DateFilterType,
    FilterContextItem,
    IDashboardAttributeFilterParent,
    DashboardAttributeFilterSelectionMode,
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
 * @param correlationId - specify correlation id to use for this command. this will be included in all
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
 * @beta
 */
export function addAttributeFilter(
    displayForm: ObjRef,
    index: number,
    correlationId?: string,
    selectionMode?: DashboardAttributeFilterSelectionMode,
): AddAttributeFilter {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADD",
        correlationId,
        payload: {
            displayForm,
            index,
            selectionMode,
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
 * Creates the ChangeAttributeFilterSelection command.
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
 * @beta
 */
export interface SetAttributeFilterDisplayFormPayload {
    filterLocalId: string;
    displayForm: ObjRef;
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
 * @returns change filter display form command
 */
export function setAttributeFilterDisplayForm(
    filterLocalId: string,
    displayForm: ObjRef,
): SetAttributeFilterDisplayForm {
    return {
        type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_DISPLAY_FORM",
        payload: {
            filterLocalId,
            displayForm,
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
