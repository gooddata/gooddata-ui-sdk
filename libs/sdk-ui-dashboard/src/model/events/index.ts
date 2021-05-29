// (C) 2021 GoodData Corporation
import {
    DashboardLoaded,
    DashboardSaved,
    DateFilterValidationFailed,
    DashboardCopySaved,
    DashboardRenamed,
    DashboardWasReset,
} from "./dashboard";
import { DashboardCommandFailed, DashboardCommandRejected } from "./general";
import {
    DashboardAttributeFilterAdded,
    DashboardAttributeFilterMoved,
    DashboardAttributeFilterParentChanged,
    DashboardAttributeFilterRemoved,
    DashboardAttributeFilterSelectionChanged,
    DashboardDateFilterSelectionChanged,
    DashboardFilterContextChanged,
} from "./filters";

export { IDashboardEvent, DashboardEventType } from "./base";
export {
    DateFilterValidationFailed,
    DateFilterValidationResult,
    DashboardLoaded,
    DashboardSaved,
    DashboardCopySaved,
    DashboardRenamed,
    DashboardWasReset,
} from "./dashboard";
export { DashboardCommandRejected, DashboardCommandFailed, CommandFailedErrorReason } from "./general";

export {
    DashboardDateFilterSelectionChanged,
    DashboardFilterContextChanged,
    DashboardAttributeFilterParentChanged,
    DashboardAttributeFilterRemoved,
    DashboardAttributeFilterSelectionChanged,
    DashboardAttributeFilterMoved,
    DashboardAttributeFilterAdded,
} from "./filters";

/**
 * @internal
 */
export type DashboardEvents =
    | DashboardLoaded
    | DateFilterValidationFailed
    | DashboardCommandFailed
    | DashboardCommandRejected
    | DashboardSaved
    | DashboardCopySaved
    | DashboardRenamed
    | DashboardWasReset
    | DashboardDateFilterSelectionChanged
    | DashboardAttributeFilterAdded
    | DashboardAttributeFilterRemoved
    | DashboardAttributeFilterMoved
    | DashboardAttributeFilterSelectionChanged
    | DashboardAttributeFilterParentChanged
    | DashboardFilterContextChanged;
