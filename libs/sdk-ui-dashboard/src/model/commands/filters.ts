// (C) 2021 GoodData Corporation
import { IDashboardAttributeFilterParent } from "@gooddata/sdk-backend-spi";
import { IAttributeElements, ObjRef } from "@gooddata/sdk-model";
import { IDashboardCommand } from "./base";

/**
 * @internal
 */
export interface AddAttributeFilter extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.AF.ADD";
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
 * @internal
 */
export function addAttributeFilter(
    displayForm: ObjRef,
    index: number,
    correlationId?: string,
): AddAttributeFilter {
    return {
        type: "GDC.DASHBOARD.CMD.AF.ADD",
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
 * @internal
 */
export interface RemoveAttributeFilters extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.AF.REMOVE";
    readonly payload: {
        /**
         * XXX: we do not necessarily need to remove multiple filters atm, but this should
         *  be very easy to do and adds some extra flexibility.
         */
        readonly filterLocalId: string[];
    };
}

/**
 * Creates the RemoveAttributeFilters command. Dispatching this command will result in the removal
 * of dashboard's attribute filter with the provided local identifier.
 *
 * @param filterLocalId - dashboard attribute filter's local identifier
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @internal
 */
export function removeAttributeFilter(filterLocalId: string, correlationId?: string): RemoveAttributeFilters {
    return {
        type: "GDC.DASHBOARD.CMD.AF.REMOVE",
        correlationId,
        payload: {
            filterLocalId: [filterLocalId],
        },
    };
}

//
//
//

/**
 * @internal
 */
export interface MoveAttributeFilter extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.AF.MOVE";
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
 * @internal
 */
export function moveAttributeFilter(
    filterLocalId: string,
    index: number,
    correlationId?: string,
): MoveAttributeFilter {
    return {
        type: "GDC.DASHBOARD.CMD.AF.MOVE",
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
 * @internal
 */
export type AttributeFilterSelectionType = "IN" | "NOT_IN";

/**
 * @internal
 */
export interface ChangeAttributeFilterSelection extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.AF.CHANGE_SELECTION";
    readonly payload: {
        readonly filterLocalId: string;
        readonly elements: IAttributeElements;
        readonly selectionType: AttributeFilterSelectionType;
    };
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
 * @internal
 */
export function changeAttributeFilterSelection(
    filterLocalId: string,
    elements: IAttributeElements,
    selectionType: AttributeFilterSelectionType,
    correlationId?: string,
): ChangeAttributeFilterSelection {
    return {
        type: "GDC.DASHBOARD.CMD.AF.CHANGE_SELECTION",
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
 * @internal
 */
export function resetAttributeFilterSelection(
    filterLocalId: string,
    correlationId?: string,
): ChangeAttributeFilterSelection {
    return {
        type: "GDC.DASHBOARD.CMD.AF.CHANGE_SELECTION",
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
 * @internal
 */
export interface SetAttributeFilterParent extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.AF.SET_PARENT";
    readonly payload: {
        readonly filterLocalId: string;
        readonly parentFilters: ReadonlyArray<IDashboardAttributeFilterParent>;
    };
}

/**
 * Creates the SetAttributeFilterParent command. Dispatching this command will result in setting a parent-child
 * relationship between two filters.
 *
 * When an attribute filter has a parent set up, the attribute elements that will be available in the child
 * filter will be influenced by the selection in the parent. Only elements which have a link over some attributes
 * to the parent filter will be available for selection in the child filter.
 *
 * TODO: fix the docs
 *
 * @param filterLocalId - local id of filter that will be a child in the relationship
 * @param parentFilter - definition of the relationship to parent, this contains local id of the parent filter and
 *  one or more 'over' attributes. The 'over' attributes will be included when querying
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function setAttributeFilterParent(
    filterLocalId: string,
    parentFilter: IDashboardAttributeFilterParent,
    correlationId?: string,
): SetAttributeFilterParent {
    return {
        type: "GDC.DASHBOARD.CMD.AF.SET_PARENT",
        correlationId,
        payload: {
            filterLocalId,
            parentFilters: [parentFilter],
        },
    };
}
