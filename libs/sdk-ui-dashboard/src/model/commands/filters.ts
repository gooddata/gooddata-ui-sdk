// (C) 2021 GoodData Corporation
import {
    DateFilterGranularity,
    DateFilterType,
    DateString,
    IDashboardAttributeFilterParent,
} from "@gooddata/sdk-backend-spi";
import { IAttributeElements, ObjRef } from "@gooddata/sdk-model";
import { IDashboardCommand } from "./base";
import { IDashboardFilter } from "@gooddata/sdk-ui-ext";

/**
 * @alpha
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
 * @alpha
 */
export interface ChangeDateFilterSelection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.CHANGE_SELECTION";
    readonly payload: DateFilterSelection;
}

/**
 * Creates the ChangeDateFilterSelection command. Dispatching this command will result in change of dashboard's
 * date filter.
 *
 * @param type - date filter type; absolute filters use exact start and end dates, while relative filters use offsets from today
 * @param granularity - granularity on which the filter works; days, weeks, months, quarters or years.
 * @param from - start date; if not specified, then the start date will be unbounded
 * @param to - end date; if not specified, then the end date will be unbounded
 * @param dateFilterOptionLocalId - localId of the {@link @gooddata/sdk-backend-spi#IDateFilterOption} selected
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @remarks see {@link ChangeDateFilterSelection} for a more complete description of the different parameters
 *
 * @alpha
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
 * This convenience function will create ChangeDateFilterSelection configured so that the date filter will be
 * unbounded - showing data for 'All Time'.
 *
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
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
 * @alpha
 */
export interface AddAttributeFilter extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.ADD";
    readonly payload: {
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
    };
}

/**
 * Creates the AddAttributeFilter command. Dispatching this command will result in the addition
 * of another attribute filter to the dashboard's filter bar, at desired position.
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
 * @alpha
 */
export interface RemoveAttributeFilters extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.REMOVE";
    readonly payload: {
        /**
         * XXX: we do not necessarily need to remove multiple filters atm, but this should
         *  be very easy to do and adds some extra flexibility.
         */
        readonly filterLocalIds: string[];
    };
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
 * @alpha
 */
export interface MoveAttributeFilter extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.MOVE";
    readonly payload: {
        readonly filterLocalId: string;
        readonly index: number;
    };
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
 * @alpha
 */
export type AttributeFilterSelectionType = "IN" | "NOT_IN";

/**
 * @alpha
 */
export interface AttributeFilterSelection {
    /**
     * Dashboard attribute filter's local identifier.
     */
    readonly filterLocalId: string;
    /**
     * Selected attribute elements.
     */
    readonly elements: IAttributeElements;
    /**
     * Selection type. Either 'IN' or 'NOT_IN'.
     */
    readonly selectionType: AttributeFilterSelectionType;
}

/**
 * @alpha
 */
export interface ChangeAttributeFilterSelection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.CHANGE_SELECTION";
    readonly payload: AttributeFilterSelection;
}

/**
 * Creates the ChangeAttributeFilterSelection command. Dispatching this command will result in application
 * of element selection for the dashboard attribute filter with the provided id.
 *
 * The attribute elements can be provided either using their URI (primary key) or value. Together with the
 * elements you must indicate the selection type - either 'IN' or 'NOT_IN'.
 *
 * @remarks see {@link resetAttributeFilterSelection} for convenience function to select all attribute elements of
 *  particular filter.
 *
 * @param filterLocalId - dashboard attribute filter's local id
 * @param elements - elements
 * @param selectionType - selection type. either 'IN' or 'NOT_IN'
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
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
 * A convenience function that will create ChangeAttributeFilterSelection command that will select all
 * elements of the dashboard attribute filter with the provided local id.
 *
 * This is same as creating the ChangeAttributeFilterSelection command with empty elements and NOT_IN selection type.
 *
 * @param filterLocalId - dashboard attribute filter's local id
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
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
 * @alpha
 */
export interface SetAttributeFilterParent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.ATTRIBUTE_FILTER.SET_PARENT";
    readonly payload: {
        readonly filterLocalId: string;
        readonly parentFilters: ReadonlyArray<IDashboardAttributeFilterParent>;
    };
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

/**
 * @alpha
 */
export interface FilterContextSelection {
    /**
     * Attribute filters to apply.
     */
    readonly attributeFilters?: Array<AttributeFilterSelection>;
    /**
     * Date filter to apply.
     */
    readonly dateFilter?: DateFilterSelection;
}

/**
 * @alpha
 */
export interface ChangeFilterContextSelection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION";
    readonly payload: {
        /**
         * Filters to apply to the current dashboard filter context.
         */
        filters: IDashboardFilter[];
        /**
         * Should filters not mentioned in the payload reset to All items selected? Defaults to false.
         */
        resetOthers: boolean;
    };
}

/**
 * Creates the {@link ChangeFilterContextSelection} command.
 * Dispatching this command will result into setting provided dashboard filters to the current dashboard filter context.
 *
 * Only filters that are stored in the filter context can be applied (filters that are visible in the filter bar).
 * Filters will be matched via display form ref, duplicities will be omitted.
 *
 * @alpha
 * @param filters - attribute filters and date filter to apply.
 * @param resetOthers - should filters not mentioned in the payload reset to All items selected? Defaults to false.
 * @param correlationId - optionally specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns change filter selection command
 */
export function changeFilterContextSelection(
    filters: IDashboardFilter[],
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
